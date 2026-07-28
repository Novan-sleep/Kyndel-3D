import { Router } from 'express'
import { printerService } from '../services/printer.service'
import { asyncHandler } from '../middleware/error.middleware'

export const printerRouter = Router()

printerRouter.get('/', asyncHandler(async () => printerService.getAll()))
printerRouter.get('/:id', asyncHandler(async (req) => printerService.getById(String(req.params.id))))
printerRouter.post('/', asyncHandler(async (req) => printerService.create(req.body)))
printerRouter.put('/:id', asyncHandler(async (req) => printerService.update(String(req.params.id), req.body)))
printerRouter.post('/:id/status', asyncHandler(async (req) => printerService.setStatusManual(String(req.params.id), req.body?.status)))
printerRouter.delete('/:id', asyncHandler(async (req) => { printerService.delete(String(req.params.id)); return null }))
