import { Router } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json')

export const appRouter = Router()

appRouter.get('/version', asyncHandler(async () => pkg.version as string))
