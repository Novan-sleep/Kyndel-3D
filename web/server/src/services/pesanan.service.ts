import { pesananRepository } from '../repositories/pesanan.repository'
import { printerRepository } from '../repositories/printer.repository'
import { materialRepository } from '../repositories/material.repository'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { settingRepository } from '../repositories/setting.repository'
import { hitungHpp, hitungHargaRekomendasi, hitungHppMultiColor, hitungHargaRekomendasiMultiColor } from './pricing.service'
import { nowIso, HttpError } from '../utils'
import { getDb } from '../db'

function withTransaction<T>(fn: () => T): T {
  return getDb().transaction(fn)()
}

export const pesananService = {
  getAll() { return pesananRepository.findAll() },
  getById(id: string) {
    const pesanan = pesananRepository.findById(id)
    if (!pesanan) throw new HttpError(404, 'Pesanan tidak ditemukan')
    return pesanan
  },
  create(payload: any) {
    const printer = printerRepository.findById(payload.printerId)
    if (!printer) throw new HttpError(400, 'Printer tidak ditemukan')
    if (printer.status !== 'Idle') throw new HttpError(400, `Printer "${printer.nama}" sedang tidak Idle`)
    const setting = settingRepository.get()
    let hpp: number, hargaRekomendasi: number, hargaBeli: number, hargaJual: number
    if (payload.multiColorData && payload.multiColorData.length > 0) {
      const resolved = payload.multiColorData.map((entry: any) => {
        const mat = materialRepository.findById(entry.materialId)
        if (!mat) throw new HttpError(400, 'Material tidak ditemukan')
        if (mat.stok < entry.beratGram / 1000) throw new HttpError(400, `Stok "${mat.nama}" tidak cukup. Tersedia: ${mat.stok} kg, dibutuhkan: ${(entry.beratGram / 1000).toFixed(3)} kg`)
        return { beratGram: entry.beratGram, hargaBeliPerGram: mat.hargaBeliPerGram, hargaJualPerGram: mat.hargaJualPerGram }
      })
      hpp = hitungHppMultiColor(resolved, printer.watt, payload.estimasiJam, setting.tarifListrik)
      hargaRekomendasi = hitungHargaRekomendasiMultiColor(resolved, printer.watt, payload.estimasiJam, setting.tarifListrik, payload.markup)
      const primaryMat = materialRepository.findById(payload.multiColorData[0].materialId)!
      hargaBeli = primaryMat.hargaBeliPerGram
      hargaJual = primaryMat.hargaJualPerGram
    } else {
      const material = materialRepository.findById(payload.materialId)
      if (!material) throw new HttpError(400, 'Material tidak ditemukan')
      if (material.stok < payload.beratMaterial) throw new HttpError(400, `Stok material tidak cukup. Tersedia: ${material.stok} kg`)
      hpp = hitungHpp(payload.beratMaterial, material.hargaBeliPerGram, printer.watt, payload.estimasiJam, setting.tarifListrik)
      hargaRekomendasi = hitungHargaRekomendasi(payload.beratMaterial, material.hargaJualPerGram, printer.watt, payload.estimasiJam, setting.tarifListrik, payload.markup)
      hargaBeli = material.hargaBeliPerGram
      hargaJual = material.hargaJualPerGram
    }
    const pesanan = pesananRepository.create(payload, hpp, hargaRekomendasi, hargaBeli, hargaJual, printer.watt, setting.tarifListrik)
    aktivitasRepository.catat('Pesanan', 'BUAT', `Pesanan baru "${pesanan!.nama}" untuk klien ${pesanan!.klien} dibuat`, pesanan!.id)
    return pesanan
  },
  update(id: string, payload: any) {
    const existing = pesananRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Pesanan tidak ditemukan')
    if (existing.status !== 'Antrian') throw new HttpError(400, 'Hanya pesanan Antrian yang dapat diubah')
    const updated = pesananRepository.update(id, payload)
    aktivitasRepository.catat('Pesanan', 'UPDATE', `Pesanan "${updated!.nama}" diperbarui`, id)
    return updated
  },
  updateMeta(id: string, payload: { catatan?: string; deadline?: string }) {
    const existing = pesananRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Pesanan tidak ditemukan')
    const catatan = 'catatan' in payload ? (payload.catatan || null) : (existing.catatan ?? null)
    const deadline = 'deadline' in payload ? (payload.deadline || null) : (existing.deadline ?? null)
    const updated = pesananRepository.updateMeta(id, catatan, deadline)
    aktivitasRepository.catat('Pesanan', 'UPDATE', `Catatan/deadline pesanan "${updated!.nama}" diperbarui`, id)
    return updated
  },
  mulaiPrinting(id: string) {
    return withTransaction(() => {
      const pesanan = pesananRepository.findById(id)
      if (!pesanan) throw new HttpError(404, 'Pesanan tidak ditemukan')
      if (pesanan.status !== 'Antrian') throw new HttpError(400, 'Hanya pesanan Antrian yang bisa dimulai')
      const printer = printerRepository.findById(pesanan.printerId)
      if (!printer) throw new HttpError(400, 'Printer tidak ditemukan')
      if (printer.status !== 'Idle') throw new HttpError(400, `Printer "${printer.nama}" sedang tidak Idle`)
      const now = nowIso()
      pesananRepository.setStatus(id, 'Printing', now)
      printerRepository.setStatus(pesanan.printerId, 'Printing', id)
      aktivitasRepository.catat('Pesanan', 'MULAI_PRINT', `Pesanan "${pesanan.nama}" mulai diprinting di ${printer.nama}`, id)
      return pesananRepository.findById(id)
    })
  },
  selesaikan(id: string) {
    return withTransaction(() => {
      const pesanan = pesananRepository.findById(id)
      if (!pesanan) throw new HttpError(404, 'Pesanan tidak ditemukan')
      if (pesanan.status !== 'Printing') throw new HttpError(400, 'Hanya pesanan Printing yang bisa diselesaikan')
      const now = nowIso()
      const today = now.split('T')[0]
      pesananRepository.setStatus(id, 'Selesai', now)
      if (pesanan.multiColorData && pesanan.multiColorData.length > 0) {
        for (const entry of pesanan.multiColorData) {
          materialRepository.kurangiStok(entry.materialId, entry.beratGram / 1000)
        }
      } else {
        materialRepository.kurangiStok(pesanan.materialId, pesanan.beratMaterial)
      }
      printerRepository.setStatus(pesanan.printerId, 'Idle', null)
      printerRepository.addTotalJam(pesanan.printerId, pesanan.estimasiJam)
      transaksiRepository.createAutoFromPesanan(id, `Pesanan: ${pesanan.nama} (${pesanan.klien})`, pesanan.hargaFinal, pesanan.hpp, today)
      aktivitasRepository.catat('Pesanan', 'SELESAI', `Pesanan "${pesanan.nama}" selesai. Harga final: Rp ${pesanan.hargaFinal.toLocaleString('id-ID')}`, id)
      return pesananRepository.findById(id)
    })
  },
  batalkan(id: string) {
    return withTransaction(() => {
      const pesanan = pesananRepository.findById(id)
      if (!pesanan) throw new HttpError(404, 'Pesanan tidak ditemukan')
      if (!['Antrian', 'Printing'].includes(pesanan.status)) throw new HttpError(400, 'Pesanan ini tidak bisa dibatalkan')
      const now = nowIso()
      pesananRepository.setStatus(id, 'Dibatalkan', now)
      if (pesanan.status === 'Printing') printerRepository.setStatus(pesanan.printerId, 'Idle', null)
      aktivitasRepository.catat('Pesanan', 'BATAL', `Pesanan "${pesanan.nama}" dibatalkan dari status ${pesanan.status}`, id)
      return pesananRepository.findById(id)
    })
  },
  hapus(id: string) {
    const pesanan = pesananRepository.findById(id)
    if (!pesanan) throw new HttpError(404, 'Pesanan tidak ditemukan')
    if (!['Selesai', 'Dibatalkan'].includes(pesanan.status)) throw new HttpError(400, 'Hanya pesanan Selesai atau Dibatalkan yang dapat dihapus')
    pesananRepository.delete(id)
    aktivitasRepository.catat('Pesanan', 'HAPUS', `Pesanan "${pesanan.nama}" dihapus`, id)
  }
}
