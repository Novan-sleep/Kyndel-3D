import { Router } from 'express'
import { settingService } from '../services/setting.service'
import { asyncHandler } from '../middleware/error.middleware'
import { getDb, getDbPath } from '../db'

export const settingRouter = Router()

settingRouter.get('/backup', asyncHandler(async (_req, res) => {
  getDb().pragma('wal_checkpoint(TRUNCATE)')
  const filename = `kyndel3d-backup-${new Date().toISOString().slice(0, 10)}.db`
  await new Promise<void>((resolve, reject) => {
    res.download(getDbPath(), filename, (err) => (err ? reject(err) : resolve()))
  })
}))
settingRouter.get('/', asyncHandler(async () => settingService.get()))
settingRouter.put('/', asyncHandler(async (req) => settingService.update(req.body)))
