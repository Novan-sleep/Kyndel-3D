import { getDb } from '../db'
import { Setting } from '../types'

const DEFAULTS: Setting = {
  tarifListrik: 1500, markupDefault: 30,
  namaToko: 'KYndel 3D', alamat: 'Jl. Kedurus Dukuh 1 No. 62', telepon: '083122750082',
}

export const settingRepository = {
  get(): Setting {
    const row = getDb().prepare("SELECT * FROM setting WHERE id = 'global'").get() as any
    if (!row) return DEFAULTS
    return {
      tarifListrik: row.tarif_listrik,
      markupDefault: row.markup_default,
      namaToko: row.nama_toko ?? DEFAULTS.namaToko,
      alamat: row.alamat ?? DEFAULTS.alamat,
      telepon: row.telepon ?? DEFAULTS.telepon,
      logoBase64: row.logo_base64 ?? undefined,
      bankNama: row.bank_nama ?? undefined,
      bankNoRekening: row.bank_no_rekening ?? undefined,
      bankAtasNama: row.bank_atas_nama ?? undefined,
    }
  },
  update(payload: Partial<Setting>): Setting {
    const existing = this.get()
    getDb().prepare(
      "UPDATE setting SET tarif_listrik = ?, markup_default = ?, nama_toko = ?, alamat = ?, telepon = ? WHERE id = 'global'"
    ).run(
      payload.tarifListrik ?? existing.tarifListrik,
      payload.markupDefault ?? existing.markupDefault,
      payload.namaToko ?? existing.namaToko,
      payload.alamat ?? existing.alamat,
      payload.telepon ?? existing.telepon,
    )
    return this.get()
  }
}
