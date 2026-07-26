import { Router } from 'express'
import { dashboardService } from '../services/dashboard.service'
import { asyncHandler } from '../middleware/error.middleware'

export const dashboardRouter = Router()

dashboardRouter.get('/kpi', asyncHandler(async () => dashboardService.getKPI()))
