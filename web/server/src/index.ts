import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb } from './db'
import { requireAuth } from './middleware/auth.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import { authRouter } from './routes/auth.routes'
import { printerRouter } from './routes/printer.routes'
import { materialRouter } from './routes/material.routes'
import { pesananRouter } from './routes/pesanan.routes'
import { dashboardRouter } from './routes/dashboard.routes'

initDb()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }))

app.use('/api/auth', authRouter)
app.use('/api/printer', requireAuth, printerRouter)
app.use('/api/material', requireAuth, materialRouter)
app.use('/api/pesanan', requireAuth, pesananRouter)
app.use('/api/dashboard', requireAuth, dashboardRouter)

app.use(errorMiddleware)

const port = Number(process.env.PORT) || 4000
app.listen(port, () => console.log(`[SERVER] Kyndel 3D web API listening on http://localhost:${port}`))
