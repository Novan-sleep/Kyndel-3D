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
import { klienRouter } from './routes/klien.routes'
import { transaksiRouter } from './routes/transaksi.routes'
import { settingRouter } from './routes/setting.routes'
import { aktivitasRouter } from './routes/aktivitas.routes'
import { pricingRouter } from './routes/pricing.routes'
import { notaRouter } from './routes/nota.routes'
import { laporanRouter } from './routes/laporan.routes'
import { appRouter } from './routes/app.routes'

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
app.use('/api/klien', requireAuth, klienRouter)
app.use('/api/transaksi', requireAuth, transaksiRouter)
app.use('/api/setting', requireAuth, settingRouter)
app.use('/api/aktivitas', requireAuth, aktivitasRouter)
app.use('/api/pricing', requireAuth, pricingRouter)
app.use('/api/nota', requireAuth, notaRouter)
app.use('/api/laporan', requireAuth, laporanRouter)
app.use('/api/app', requireAuth, appRouter)

app.use(errorMiddleware)

const port = Number(process.env.PORT) || 4000
app.listen(port, () => console.log(`[SERVER] Kyndel 3D web API listening on http://localhost:${port}`))
