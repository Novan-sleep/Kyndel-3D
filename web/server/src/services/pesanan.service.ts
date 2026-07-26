import { pesananRepository } from '../repositories/pesanan.repository'
import { printerRepository } from '../repositories/printer.repository'
import { materialRepository } from '../repositories/material.repository'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { settingRepository } from '../repositories/setting.repository'
import { hitungHpp, hitungHargaRekomendasi } from './pricing.service'
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
    const material = materialRepository.findById(payload.materialId)
    if (!material) throw new HttpError(400, 'Material tidak ditemukan')
    if (material.stok < payload.beratMaterial) throw new HttpError(400, `Stok material tidak cukup. Tersedia: ${material.stok} kg`)
    const setting = settingRepository.get()
    const hpp = hitungHpp(payload.beratMaterial, material.hargaBeliPerGram, printer.watt, payload.estimasiJam, setting.tarifListrik)
    const hargaRekomendasi = hitungHargaRekomendasi(payload.beratMaterial, material.hargaJualPerGram, printer.watt, payload.estimasiJam, setting.tarifListrik, payload.markup)
    const pesanan = pesananRepository.create(payload, hpp, hargaRekomendasi, material.hargaBeliPerGram, material.hargaJualPerGram, printer.watt, setting.tarifListrik)
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
      materialRepository.kurangiStok(pesanan.materialId, pesanan.beratMaterial)
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
