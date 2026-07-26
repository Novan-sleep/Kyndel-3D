import { materialRepository } from '../repositories/material.repository'
import { pesananRepository } from '../repositories/pesanan.repository'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { getDb } from '../db'
import { nowIso } from '../utils'

function withTransaction<T>(fn: () => T): T {
  return getDb().transaction(fn)()
}

export const materialService = {
  getAll() { return materialRepository.findAll() },
  getById(id: string) { return materialRepository.findById(id) },
  create(payload: any) {
    if (!payload.nama.trim()) throw new Error("Nama material wajib diisi")
    if (payload.stok < 0) throw new Error("Stok tidak boleh negatif")
    if (payload.hargaBeliPerGram <= 0) throw new Error("Harga beli per gram harus lebih dari 0")
    if (payload.hargaJualPerGram <= 0) throw new Error("Harga jual per gram harus lebih dari 0")
    if (payload.hargaJualPerGram < payload.hargaBeliPerGram) throw new Error("Harga jual tidak boleh lebih kecil dari harga beli")
    const material = materialRepository.create(payload)
    aktivitasRepository.catat("Material", "TAMBAH", `Material "${material!.nama}" ditambahkan. Stok: ${material!.stok} kg, Margin: Rp${material!.marginPerGram}/g`, material!.id)
    return material
  },
  update(id: string, payload: any) {
    const existing = materialRepository.findById(id)
    if (!existing) throw new Error("Material tidak ditemukan")
    if (payload.stok !== undefined && payload.stok < 0) throw new Error("Stok tidak boleh negatif")
    if (payload.hargaBeliPerGram !== undefined && payload.hargaBeliPerGram <= 0) throw new Error("Harga beli harus lebih dari 0")
    if (payload.hargaJualPerGram !== undefined && payload.hargaJualPerGram <= 0) throw new Error("Harga jual harus lebih dari 0")
    const finalBeli = payload.hargaBeliPerGram ?? existing.hargaBeliPerGram
    const finalJual = payload.hargaJualPerGram ?? existing.hargaJualPerGram
    if (finalJual < finalBeli) throw new Error("Harga jual tidak boleh lebih kecil dari harga beli")
    const updated = materialRepository.update(id, payload)
    aktivitasRepository.catat("Material", "UPDATE", `Material "${updated!.nama}" diperbarui`, id)
    return updated
  },
  restock(id: string, jumlahKg: number, hargaBeliPerGram: number, catatan?: string) {
    if (jumlahKg <= 0) throw new Error("Jumlah restock harus lebih dari 0")
    if (hargaBeliPerGram <= 0) throw new Error("Harga beli harus lebih dari 0")
    const material = materialRepository.findById(id)
    if (!material) throw new Error("Material tidak ditemukan")
    if (hargaBeliPerGram > material.hargaJualPerGram) throw new Error("Harga beli tidak boleh lebih besar dari harga jual saat ini")
    const totalBiaya = Math.round(jumlahKg * 1000 * hargaBeliPerGram)
    const today = nowIso().split('T')[0]
    return withTransaction(() => {
      const updated = materialRepository.update(id, { stok: material.stok + jumlahKg, hargaBeliPerGram })
      const nama = catatan
        ? `Restock ${material.nama} ${jumlahKg} kg — ${catatan}`
        : `Restock ${material.nama} ${jumlahKg} kg`
      transaksiRepository.createAutoFromRestock(id, nama, totalBiaya, today)
      aktivitasRepository.catat("Material", "RESTOCK", `Restock "${material.nama}" +${jumlahKg} kg. Biaya: Rp ${totalBiaya.toLocaleString("id-ID")}`, id)
      return updated
    })
  },
  delete(id: string) {
    const material = materialRepository.findById(id)
    if (!material) throw new Error("Material tidak ditemukan")
    if (pesananRepository.findAktif().some(p => p.materialId === id)) throw new Error("Material masih terkait dengan pesanan aktif")
    materialRepository.delete(id)
    aktivitasRepository.catat("Material", "HAPUS", `Material "${material.nama}" dihapus`, id)
  }
}
