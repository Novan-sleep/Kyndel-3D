import { printerRepository } from '../repositories/printer.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { HttpError } from '../utils'

export const printerService = {
  getAll() { return printerRepository.findAll() },
  getById(id: string) {
    const printer = printerRepository.findById(id)
    if (!printer) throw new HttpError(404, 'Printer tidak ditemukan')
    return printer
  },
  create(payload: any) {
    if (!payload.nama) throw new HttpError(400, 'Nama printer wajib diisi')
    const printer = printerRepository.create(payload)
    aktivitasRepository.catat('Printer', 'TAMBAH', `Printer baru "${printer!.nama}" (${printer!.tipe ?? '-'}) ditambahkan`, printer!.id)
    return printer
  },
  update(id: string, payload: any) {
    const existing = printerRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Printer tidak ditemukan')
    const updated = printerRepository.update(id, payload)
    aktivitasRepository.catat('Printer', 'UPDATE', `Printer "${updated!.nama}" diperbarui`, id)
    return updated
  },
  delete(id: string) {
    const existing = printerRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Printer tidak ditemukan')
    if (existing.status === 'Printing') throw new HttpError(400, 'Printer sedang digunakan, tidak bisa dihapus')
    printerRepository.delete(id)
    aktivitasRepository.catat('Printer', 'HAPUS', `Printer "${existing.nama}" dihapus`, id)
  }
}
