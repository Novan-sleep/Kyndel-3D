import { Router } from 'express'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../middleware/error.middleware'
import { HttpError } from '../utils'

export const authRouter = Router()

authRouter.post('/login', asyncHandler(async (req) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) throw new HttpError(400, 'Username dan password wajib diisi')
  const token = authService.login(username, password)
  return { token }
}))
