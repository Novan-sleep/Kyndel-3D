import { printerRepository } from '../repositories/printer.repository'
import { pesananRepository } from '../repositories/pesanan.repository'
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
    if (!payload.nama?.trim()) throw new HttpError(400, 'Nama printer wajib diisi')
    if (payload.watt <= 0) throw new HttpError(400, 'Watt harus lebih dari 0')
    const printer = printerRepository.create(payload)
    aktivitasRepository.catat('Printer', 'TAMBAH', `Printer baru "${printer!.nama}" (${printer!.tipe ?? '-'}) ditambahkan`, printer!.id)
    return printer
  },
  update(id: string, payload: any) {
    const existing = printerRepository.findById(id)
    if (!existing) throw new HttpError(404, 'Printer tidak ditemukan')
    if (existing.status === 'Printing') {
      const bolehUpdate = Object.keys(payload).every(k => ['catatan'].includes(k))
      if (!bolehUpdate) throw new HttpError(400, 'Printer sedang dipakai, hanya catatan yang bisa diubah')
    }
    const updated = printerRepository.update(id, payload)
    aktivitasRepository.catat('Printer', 'UPDATE', `Printer "${updated!.nama}" diperbarui`, id)
    return updated
  },
  setStatusManual(id: string, status: 'Idle' | 'Maintenance' | 'Rusak') {
    const printer = printerRepository.findById(id)
    if (!printer) throw new HttpError(404, 'Printer tidak ditemukan')
    if (printer.status === 'Printing') throw new HttpError(400, 'Printer sedang dipakai, tidak bisa ubah status')
    const updated = printerRepository.update(id, { status })
    aktivitasRepository.catat('Printer', 'STATUS', `Printer "${updated!.nama}" diubah ke ${status}`, id)
    return updated
  },
  delete(id: string) {
    const printer = printerRepository.findById(id)
    if (!printer) throw new HttpError(404, 'Printer tidak ditemukan')
    if (printer.status === 'Printing') throw new HttpError(400, 'Printer sedang dipakai, tidak bisa dihapus')
    if (pesananRepository.findAktif().some(p => p.printerId === id)) throw new HttpError(400, 'Printer masih terkait dengan pesanan aktif')
    printerRepository.delete(id)
    aktivitasRepository.catat('Printer', 'HAPUS', `Printer "${printer.nama}" dihapus`, id)
  }
}
