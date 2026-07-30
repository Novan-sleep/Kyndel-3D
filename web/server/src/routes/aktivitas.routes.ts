import { Router } from 'express'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { asyncHandler } from '../middleware/error.middleware'

export const aktivitasRouter = Router()

aktivitasRouter.get('/', asyncHandler(async (req) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100
  return aktivitasRepository.findAll(limit)
}))
