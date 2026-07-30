import { Router } from 'express'
import { pesananService } from '../services/pesanan.service'
import { pesananRepository } from '../repositories/pesanan.repository'
import { asyncHandler } from '../middleware/error.middleware'
import { toCsv } from '../utils'

export const pesananRouter = Router()

pesananRouter.get('/export/csv', asyncHandler(async (_req, res) => {
  const data = pesananRepository.findAll()
  const headers = ['ID', 'Nama', 'Klien', 'Tipe', 'Printer', 'Material', 'Berat(g)', 'Est.Jam', 'Markup%', 'HPP', 'Harga Rekomendasi', 'Nilai Jual', 'Harga Final', 'Status', 'Deadline', 'Dibuat', 'Selesai']
  const rows = data.map(p => [
    p.id, p.nama, p.klien, p.tipe ?? '', p.printerNama ?? '', p.materialNama ?? '',
    String(Math.round(p.beratMaterial * 1000)), String(p.estimasiJam), String(p.markup),
    String(p.hpp), String(p.hargaRekomendasi), String(p.nilaiJual), String(p.hargaFinal),
    p.status, p.deadline ?? '', p.createdAt.slice(0, 10), p.completedAt?.slice(0, 10) ?? ''
  ])
  const csv = toCsv([headers, ...rows])
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="pesanan-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send('﻿' + csv)
}))
pesananRouter.get('/', asyncHandler(async () => pesananService.getAll()))
pesananRouter.get('/:id', asyncHandler(async (req) => pesananService.getById(String(req.params.id))))
pesananRouter.post('/', asyncHandler(async (req) => pesananService.create(req.body)))
pesananRouter.put('/:id', asyncHandler(async (req) => pesananService.update(String(req.params.id), req.body)))
pesananRouter.put('/:id/meta', asyncHandler(async (req) => pesananService.updateMeta(String(req.params.id), req.body)))
pesananRouter.post('/:id/mulai-printing', asyncHandler(async (req) => pesananService.mulaiPrinting(String(req.params.id))))
pesananRouter.post('/:id/selesaikan', asyncHandler(async (req) => pesananService.selesaikan(String(req.params.id))))
pesananRouter.post('/:id/batalkan', asyncHandler(async (req) => pesananService.batalkan(String(req.params.id))))
pesananRouter.delete('/:id', asyncHandler(async (req) => { pesananService.hapus(String(req.params.id)); return null }))
