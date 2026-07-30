import { Router } from 'express'
import { klienService } from '../services/klien.service'
import { asyncHandler } from '../middleware/error.middleware'

export const klienRouter = Router()

klienRouter.get('/names', asyncHandler(async () => klienService.getAllNama()))
klienRouter.get('/', asyncHandler(async () => klienService.getAll()))
klienRouter.get('/:id', asyncHandler(async (req) => klienService.getById(String(req.params.id))))
klienRouter.post('/', asyncHandler(async (req) => klienService.create(req.body)))
klienRouter.put('/:id', asyncHandler(async (req) => klienService.update(String(req.params.id), req.body)))
klienRouter.delete('/:id', asyncHandler(async (req) => { klienService.delete(String(req.params.id)); return null }))
