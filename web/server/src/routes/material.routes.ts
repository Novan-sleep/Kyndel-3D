import { Router } from 'express'
import { materialService } from '../services/material.service'
import { asyncHandler } from '../middleware/error.middleware'

export const materialRouter = Router()

materialRouter.get('/', asyncHandler(async () => materialService.getAll()))
materialRouter.get('/:id', asyncHandler(async (req) => materialService.getById(String(req.params.id))))
materialRouter.post('/', asyncHandler(async (req) => materialService.create(req.body)))
materialRouter.put('/:id', asyncHandler(async (req) => materialService.update(String(req.params.id), req.body)))
materialRouter.post('/:id/restock', asyncHandler(async (req) => {
  const { jumlahKg, hargaBeliPerGram, catatan } = req.body ?? {}
  return materialService.restock(String(req.params.id), jumlahKg, hargaBeliPerGram, catatan)
}))
materialRouter.delete('/:id', asyncHandler(async (req) => { materialService.delete(String(req.params.id)); return null }))
