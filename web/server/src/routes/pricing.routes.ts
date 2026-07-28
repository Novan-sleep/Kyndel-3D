import { Router } from 'express'
import { previewPricing } from '../services/pricing.service'
import { asyncHandler } from '../middleware/error.middleware'

export const pricingRouter = Router()

pricingRouter.post('/preview', asyncHandler(async (req) => {
  const { beratKg, hargaBeliPerGram, hargaJualPerGram, watt, estimasiJam, tarifListrik, markup, nilaiJual, multiColorMaterials } = req.body ?? {}
  return previewPricing(beratKg, hargaBeliPerGram, hargaJualPerGram, watt, estimasiJam, tarifListrik, markup, nilaiJual, multiColorMaterials)
}))
