import { settingRepository } from '../repositories/setting.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'

export const settingService = {
  get() { return settingRepository.get() },
  update(payload: any) {
    if (payload.tarifListrik !== undefined && payload.tarifListrik <= 0) throw new Error("Tarif listrik harus lebih dari 0")
    if (payload.markupDefault !== undefined && payload.markupDefault < 0) throw new Error("Markup default tidak boleh negatif")
    if (payload.namaToko !== undefined && !payload.namaToko.trim()) throw new Error("Nama toko tidak boleh kosong")
    const updated = settingRepository.update(payload)
    aktivitasRepository.catat("Sistem", "UPDATE_SETTING", `Pengaturan diperbarui: tarif listrik Rp ${updated.tarifListrik}/kWh, markup ${updated.markupDefault}%, toko: ${updated.namaToko}`)
    return updated
  }
}
