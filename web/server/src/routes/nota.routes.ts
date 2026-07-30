import { Router } from 'express'
import { pesananRepository } from '../repositories/pesanan.repository'
import { settingRepository } from '../repositories/setting.repository'
import { generateInvoiceHTML } from '../services/nota.service'
import { asyncHandler } from '../middleware/error.middleware'
import { HttpError } from '../utils'

export const notaRouter = Router()

notaRouter.post('/invoice-html', asyncHandler(async (req) => {
  const { ids, tagihanKepada } = req.body ?? {}
  const pesanans = (ids ?? []).map((id: string) => pesananRepository.findById(id)).filter((p: unknown): p is NonNullable<typeof p> => p !== null)
  if (pesanans.length === 0) throw new HttpError(400, 'Tidak ada pesanan ditemukan')
  const s = settingRepository.get()
  return generateInvoiceHTML(pesanans, { nama: s.namaToko, alamat: s.alamat, telepon: s.telepon, logoBase64: s.logoBase64, bankNama: s.bankNama, bankNoRekening: s.bankNoRekening, bankAtasNama: s.bankAtasNama }, tagihanKepada)
}))
