import { pesananRepository } from '../repositories/pesanan.repository'
import { printerRepository } from '../repositories/printer.repository'
import { materialRepository } from '../repositories/material.repository'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { DashboardKPI } from '../types'

function pctChange(now: number, prev: number): number | null {
  if (prev === 0) return now === 0 ? 0 : null
  return Math.round(((now - prev) / prev) * 1000) / 10
}

export const dashboardService = {
  getKPI(): DashboardKPI {
    const allPrinters = printerRepository.findAll()
    const pendapatan = transaksiRepository.sumPendapatanBulanIni()
    const pengeluaran = transaksiRepository.sumPengeluaranBulanIni()
    const pendapatanLalu = transaksiRepository.sumPendapatanBulanLalu()
    const pengeluaranLalu = transaksiRepository.sumPengeluaranBulanLalu()
    const profit = pendapatan - pengeluaran
    const profitLalu = pendapatanLalu - pengeluaranLalu
    const orderSelesai = pesananRepository.countSelesaiBulanIni()
    const orderSelesaiLalu = pesananRepository.countSelesaiBulanLalu()
    return {
      totalOrderAktif: pesananRepository.countByStatus('Antrian') + pesananRepository.countByStatus('Printing'),
      totalOrderAntrian: pesananRepository.countByStatus('Antrian'),
      totalOrderPrinting: pesananRepository.countByStatus('Printing'),
      totalOrderSelesaiBulanIni: orderSelesai,
      totalOrderDibatalkanBulanIni: pesananRepository.countDibatalkanBulanIni(),
      totalPrinterIdle: allPrinters.filter(p => p.status === 'Idle').length,
      totalPrinterPrinting: allPrinters.filter(p => p.status === 'Printing').length,
      totalMaterialHampirHabis: materialRepository.findHampirHabis().length,
      totalPendapatanBulanIni: pendapatan,
      totalPengeluaranBulanIni: pengeluaran,
      profitBulanIni: profit,
      rataRataNilaiJual: transaksiRepository.rataRataNilaiJual(),
      rataRataHpp: 0,
      rataRataEstimasiJam: 0,
      orderMendekatiDeadline: pesananRepository.findMendekatiDeadline(3),
      materialHampirHabis: materialRepository.findHampirHabis(),
      aktivitasTerbaru: aktivitasRepository.findTerbaru(10),
      trendPendapatanPct: pctChange(pendapatan, pendapatanLalu),
      trendPengeluaranPct: pctChange(pengeluaran, pengeluaranLalu),
      trendProfitPct: pctChange(profit, profitLalu),
      trendOrderSelesaiPct: pctChange(orderSelesai, orderSelesaiLalu),
    }
  }
}
