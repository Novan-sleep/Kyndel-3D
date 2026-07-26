import { contextBridge, ipcRenderer } from 'electron'

function invoke(channel: string, ...args: any[]): Promise<any> {
  return ipcRenderer.invoke(channel, ...args)
}

const api = {
  dashboard: {
    getKPI: () => invoke('dashboard:getKPI')
  },
  pesanan: {
    getAll: () => invoke('pesanan:getAll'),
    getById: (id: string) => invoke('pesanan:getById', id),
    create: (payload: any) => invoke('pesanan:create', payload),
    update: (id: string, payload: any) => invoke('pesanan:update', id, payload),
    updateMeta: (id: string, payload: any) => invoke('pesanan:updateMeta', id, payload),
    mulaiPrinting: (id: string) => invoke('pesanan:mulaiPrinting', id),
    selesaikan: (id: string) => invoke('pesanan:selesaikan', id),
    batalkan: (id: string) => invoke('pesanan:batalkan', id),
    hapus: (id: string) => invoke('pesanan:hapus', id)
  },
  printer: {
    getAll: () => invoke('printer:getAll'),
    getById: (id: string) => invoke('printer:getById', id),
    create: (payload: any) => invoke('printer:create', payload),
    update: (id: string, payload: any) => invoke('printer:update', id, payload),
    delete: (id: string) => invoke('printer:delete', id),
    setStatusManual: (id: string, status: string) => invoke('printer:setStatusManual', id, status)
  },
  material: {
    getAll: () => invoke('material:getAll'),
    getById: (id: string) => invoke('material:getById', id),
    create: (payload: any) => invoke('material:create', payload),
    update: (id: string, payload: any) => invoke('material:update', id, payload),
    delete: (id: string) => invoke('material:delete', id),
    restock: (id: string, jumlahKg: number, hargaBeliPerGram: number, catatan?: string) => invoke('material:restock', id, jumlahKg, hargaBeliPerGram, catatan),
  },
  transaksi: {
    getAll: () => invoke('transaksi:getAll'),
    getByBulan: (bulan: string) => invoke('transaksi:getByBulan', bulan),
    createManual: (payload: any) => invoke('transaksi:createManual', payload),
    delete: (id: string) => invoke('transaksi:delete', id)
  },
  aktivitas: {
    getAll: (limit?: number) => invoke('aktivitas:getAll', limit)
  },
  klien: {
    getAll: () => invoke('klien:getAll'),
    getById: (id: string) => invoke('klien:getById', id),
    getAllNama: () => invoke('klien:getAllNama'),
    create: (payload: any) => invoke('klien:create', payload),
    update: (id: string, payload: any) => invoke('klien:update', id, payload),
    delete: (id: string) => invoke('klien:delete', id),
  },
  setting: {
    get: () => invoke('setting:get'),
    update: (payload: any) => invoke('setting:update', payload)
  },
  pricing: {
    preview: (args: any) => invoke('pricing:preview', args)
  },
  nota: {
    getInvoiceHTML: (ids: string[], tagihanKepada?: string) => invoke('nota:getInvoiceHTML', ids, tagihanKepada),
    exportInvoicePDF: (ids: string[], tagihanKepada?: string) => invoke('nota:exportInvoicePDF', ids, tagihanKepada)
  },
  app: {
    getVersion: () => invoke('app:getVersion'),
    setTitle: (title: string) => invoke('app:setTitle', title)
  },
  db: {
    backup: () => invoke('db:backup'),
    restore: () => invoke('db:restore'),
  },
  export: {
    pesanan: () => invoke('export:pesanan'),
    transaksi: () => invoke('export:transaksi'),
  },
  laporan: {
    keuanganBulan: (bulan: string) => invoke('laporan:keuanganBulan', bulan),
  },
}

contextBridge.exposeInMainWorld('api', api)
