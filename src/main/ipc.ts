import { ipcMain, IpcMainInvokeEvent, app } from 'electron'
import { dashboardService } from './services/dashboard.service'
import { pesananService } from './services/pesanan.service'
import { printerService } from './services/printer.service'
import { materialService } from './services/material.service'
import { transaksiService } from './services/transaksi.service'
import { settingService } from './services/setting.service'
import { klienService } from './services/klien.service'
import { aktivitasRepository } from './repositories/aktivitas.repository'
import { previewPricing } from './services/pricing.service'

type Handler = (event: IpcMainInvokeEvent, ...args: any[]) => any

function handle(channel: string, fn: Handler): void {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const data = await fn(event, ...args)
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[IPC] Error on channel "${channel}":`, message)
      return { success: false, error: message }
    }
  })
}

export function registerAllHandlers(): void {
  handle('dashboard:getKPI', () => dashboardService.getKPI())

  handle('pesanan:getAll', () => pesananService.getAll())
  handle('pesanan:getById', (_e, id) => pesananService.getById(id))
  handle('pesanan:create', (_e, payload) => pesananService.create(payload))
  handle('pesanan:update', (_e, id, payload) => pesananService.update(id, payload))
  handle('pesanan:updateMeta', (_e, id, payload) => pesananService.updateMeta(id, payload))
  handle('pesanan:mulaiPrinting', (_e, id) => pesananService.mulaiPrinting(id))
  handle('pesanan:selesaikan', (_e, id) => pesananService.selesaikan(id))
  handle('pesanan:batalkan', (_e, id) => pesananService.batalkan(id))
  handle('pesanan:hapus', (_e, id) => pesananService.hapus(id))

  handle('printer:getAll', () => printerService.getAll())
  handle('printer:getById', (_e, id) => printerService.getById(id))
  handle('printer:create', (_e, payload) => printerService.create(payload))
  handle('printer:update', (_e, id, payload) => printerService.update(id, payload))
  handle('printer:delete', (_e, id) => printerService.delete(id))
  handle('printer:setStatusManual', (_e, id, status) => printerService.setStatusManual(id, status))

  handle('material:getAll', () => materialService.getAll())
  handle('material:getById', (_e, id) => materialService.getById(id))
  handle('material:create', (_e, payload) => materialService.create(payload))
  handle('material:update', (_e, id, payload) => materialService.update(id, payload))
  handle('material:delete', (_e, id) => materialService.delete(id))
  handle('material:restock', (_e, id, jumlahKg, hargaBeliPerGram, catatan) => materialService.restock(id, jumlahKg, hargaBeliPerGram, catatan))

  handle('transaksi:getAll', () => transaksiService.getAll())
  handle('transaksi:getByBulan', (_e, bulan) => transaksiService.getByBulan(bulan))
  handle('transaksi:createManual', (_e, payload) => transaksiService.createManual(payload))
  handle('transaksi:delete', (_e, id) => transaksiService.delete(id))

  handle('aktivitas:getAll', (_e, limit) => aktivitasRepository.findAll(limit ?? 100))

  handle('klien:getAll', () => klienService.getAll())
  handle('klien:getById', (_e, id) => klienService.getById(id))
  handle('klien:getAllNama', () => klienService.getAllNama())
  handle('klien:create', (_e, payload) => klienService.create(payload))
  handle('klien:update', (_e, id, payload) => klienService.update(id, payload))
  handle('klien:delete', (_e, id) => klienService.delete(id))

  handle('setting:get', () => settingService.get())
  handle('setting:update', (_e, payload) => settingService.update(payload))

  handle('pricing:preview', (_e, args) => {
    const { beratKg, hargaBeliPerGram, hargaJualPerGram, watt, estimasiJam, tarifListrik, markup, nilaiJual, multiColorMaterials } = args
    return previewPricing(beratKg, hargaBeliPerGram, hargaJualPerGram, watt, estimasiJam, tarifListrik, markup, nilaiJual, multiColorMaterials)
  })

  handle('app:getVersion', () => app.getVersion())

  console.log('[IPC] Semua handler terdaftar')
}
