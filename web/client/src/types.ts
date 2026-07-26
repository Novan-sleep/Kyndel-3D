export type PrinterTipe = 'FDM' | 'Resin' | 'SLA' | 'SLS'
export type PrinterStatus = 'Idle' | 'Printing' | 'Maintenance' | 'Rusak'

export interface Printer {
  id: string
  nama: string
  model?: string
  tipe?: PrinterTipe
  watt: number
  status: PrinterStatus
  currentPesananId?: string
  totalJam: number
  catatan?: string
  createdAt: string
}

export interface Material {
  id: string
  nama: string
  tipe?: string
  warna?: string
  stok: number
  hargaBeliPerGram: number
  hargaJualPerGram: number
  marginPerGram: number
  stokMinimum?: number
  createdAt: string
}

export type PesananStatus = 'Antrian' | 'Printing' | 'Selesai' | 'Dibatalkan'

export interface Pesanan {
  id: string
  nama: string
  klien: string
  tipe?: string
  printerId: string
  materialId: string
  beratMaterial: number
  estimasiJam: number
  markup: number
  hpp: number
  hargaRekomendasi: number
  nilaiJual: number
  hargaFinal: number
  status: PesananStatus
  deadline?: string
  catatan?: string
  createdAt: string
  printingAt?: string
  completedAt?: string
  cancelledAt?: string
  printerNama?: string
  materialNama?: string
}

export interface Aktivitas {
  id: string
  modul: 'Pesanan' | 'Printer' | 'Material' | 'Keuangan' | 'Sistem'
  aksi: string
  refId?: string
  deskripsi: string
  createdAt: string
}

export interface DashboardKPI {
  totalOrderAktif: number
  totalOrderAntrian: number
  totalOrderPrinting: number
  totalOrderSelesaiBulanIni: number
  totalOrderDibatalkanBulanIni: number
  totalPrinterIdle: number
  totalPrinterPrinting: number
  totalMaterialHampirHabis: number
  totalPendapatanBulanIni: number
  totalPengeluaranBulanIni: number
  profitBulanIni: number
  rataRataNilaiJual: number
  orderMendekatiDeadline: Pesanan[]
  materialHampirHabis: Material[]
  aktivitasTerbaru: Aktivitas[]
}
