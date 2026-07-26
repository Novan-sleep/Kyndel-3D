import { materialRepository } from '../repositories/material.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { HttpError } from '../utils'

export const materialService = {
  getAll() { return materialRepository.findAll() },
  getById(id: string) {
    const material = materialRepository.findById(id)
    if (!material) throw new HttpError(404, 'Material tidak ditemukan')
    return material
  },
  create(payload: any) {
    if (!payload.nama) throw new HttpError(400, 'Nama material wajib diisi')
    const material = materialRepository.create(payload)
    aktivitasRepository.catat('Material', 'TAMBAH', `Material "${material!.nama}" ditambahkan. Stok: ${material!.stok} kg, Margin: Rp${material!.marginPerGram}/g`, material!.id)
    return material
  },
  update(id: string, payload: any) {
    const existing = materialRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Material tidak ditemukan')
    const updated = materialRepository.update(id, payload)
    aktivitasRepository.catat('Material', 'UPDATE', `Material "${updated!.nama}" diperbarui`, id)
    return updated
  },
  delete(id: string) {
    const existing = materialRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Material tidak ditemukan')
    materialRepository.delete(id)
    aktivitasRepository.catat('Material', 'HAPUS', `Material "${existing.nama}" dihapus`, id)
  }
}
