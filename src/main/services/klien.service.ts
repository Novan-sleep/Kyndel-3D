import { klienRepository } from '../repositories/klien.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'

export const klienService = {
  getAll() { return klienRepository.findAll() },
  getById(id: string) { return klienRepository.findById(id) },
  getAllNama() { return klienRepository.findAllNama() },
  create(payload: any) {
    if (!payload.nama?.trim()) throw new Error("Nama klien wajib diisi")
    const klien = klienRepository.create(payload)
    aktivitasRepository.catat("Sistem", "TAMBAH", `Klien baru "${klien!.nama}" ditambahkan`, klien!.id)
    return klien
  },
  update(id: string, payload: any) {
    const existing = klienRepository.findById(id)
    if (!existing) throw new Error("Klien tidak ditemukan")
    if ('nama' in payload && !payload.nama?.trim()) throw new Error("Nama klien wajib diisi")
    const updated = klienRepository.update(id, payload)
    aktivitasRepository.catat("Sistem", "UPDATE", `Klien "${updated!.nama}" diperbarui`, id)
    return updated
  },
  delete(id: string) {
    const klien = klienRepository.findById(id)
    if (!klien) throw new Error("Klien tidak ditemukan")
    if (klien.totalPesanan > 0) throw new Error("Klien masih memiliki riwayat pesanan, tidak bisa dihapus")
    klienRepository.delete(id)
    aktivitasRepository.catat("Sistem", "HAPUS", `Klien "${klien.nama}" dihapus`, id)
  },
}
