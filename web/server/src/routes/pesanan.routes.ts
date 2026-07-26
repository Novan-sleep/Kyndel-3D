import { Router } from 'express'
import { pesananService } from '../services/pesanan.service'
import { asyncHandler } from '../middleware/error.middleware'

export const pesananRouter = Router()

pesananRouter.get('/', asyncHandler(async () => pesananService.getAll()))
pesananRouter.get('/:id', asyncHandler(async (req) => pesananService.getById(String(req.params.id))))
pesananRouter.post('/', asyncHandler(async (req) => pesananService.create(req.body)))
pesananRouter.put('/:id', asyncHandler(async (req) => pesananService.update(String(req.params.id), req.body)))
pesananRouter.post('/:id/mulai-printing', asyncHandler(async (req) => pesananService.mulaiPrinting(String(req.params.id))))
pesananRouter.post('/:id/selesaikan', asyncHandler(async (req) => pesananService.selesaikan(String(req.params.id))))
pesananRouter.post('/:id/batalkan', asyncHandler(async (req) => pesananService.batalkan(String(req.params.id))))
pesananRouter.delete('/:id', asyncHandler(async (req) => { pesananService.hapus(String(req.params.id)); return null }))
