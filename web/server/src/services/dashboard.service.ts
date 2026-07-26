import { pesananRepository } from '../repositories/pesanan.repository'
import { printerRepository } from '../repositories/printer.repository'
import { materialRepository } from '../repositories/material.repository'
import { transaksiRepository } from '../repositories/transaksi.repository'
import { aktivitasRepository } from '../repositories/aktivitas.repository'
import { DashboardKPI } from '../types'

export const dashboardService = {
  getKPI(): DashboardKPI {
    const allPrinters = printerRepository.findAll()
    const pendapatan = transaksiRepository.sumPendapatanBulanIni()
    const pengeluaran = transaksiRepository.sumPengeluaranBulanIni()
    return {
      totalOrderAktif: pesananRepository.countByStatus('Antrian') + pesananRepository.countByStatus('Printing'),
      totalOrderAntrian: pesananRepository.countByStatus('Antrian'),
      totalOrderPrinting: pesananRepository.countByStatus('Printing'),
      totalOrderSelesaiBulanIni: pesananRepository.countSelesaiBulanIni(),
      totalOrderDibatalkanBulanIni: pesananRepository.countDibatalkanBulanIni(),
      totalPrinterIdle: allPrinters.filter(p => p.status === 'Idle').length,
      totalPrinterPrinting: allPrinters.filter(p => p.status === 'Printing').length,
      totalMaterialHampirHabis: materialRepository.findHampirHabis().length,
      totalPendapatanBulanIni: pendapatan,
      totalPengeluaranBulanIni: pengeluaran,
      profitBulanIni: pendapatan - pengeluaran,
      rataRataNilaiJual: transaksiRepository.rataRataNilaiJual(),
      orderMendekatiDeadline: pesananRepository.findMendekatiDeadline(3),
      materialHampirHabis: materialRepository.findHampirHabis(),
      aktivitasTerbaru: aktivitasRepository.findTerbaru(10)
    }
  }
}
