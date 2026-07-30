import { Router } from 'express'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { settingRepository } from '../repositories/setting.repository'
import { generateLaporanHTML } from '../services/laporan.service'
import { asyncHandler } from '../middleware/error.middleware'

export const laporanRouter = Router()

laporanRouter.get('/keuangan/:bulan/html', asyncHandler(async (req) => {
  const bulan = String(req.params.bulan)
  const transaksis = transaksiRepository.findByBulan(bulan)
  const setting = settingRepository.get()
  return generateLaporanHTML(bulan, transaksis, setting)
}))
