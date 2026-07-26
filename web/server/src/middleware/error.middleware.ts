import { Request, Response, NextFunction } from 'express'
import { HttpError } from '../utils'

export function asyncHandler(fn: (req: Request, res: Response) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).then((data) => {
      if (!res.headersSent) res.json({ success: true, data })
    }).catch(next)
  }
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, error: err.message })
    return
  }
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada server'
  console.error(err)
  res.status(400).json({ success: false, error: message })
}
