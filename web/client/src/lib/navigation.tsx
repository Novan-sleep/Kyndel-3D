export type Page = 'dashboard' | 'pesanan' | 'klien' | 'printer' | 'material' | 'keuangan' | 'statistik' | 'aktivitas' | 'setting'

export const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard', pesanan: 'Manajemen Pesanan', klien: 'Manajemen Klien',
  printer: 'Manajemen Printer', material: 'Manajemen Material',
  keuangan: 'Keuangan', statistik: 'Statistik', aktivitas: 'Log Aktivitas', setting: 'Pengaturan',
}

export const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="1.5" width="5" height="5" rx="1.2"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/></svg> },
  { id: 'pesanan', label: 'Pesanan',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1H5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 00-2-2z"/><line x1="5.5" y1="6" x2="10.5" y2="6"/><line x1="5.5" y1="9" x2="10.5" y2="9"/><line x1="5.5" y1="12" x2="8" y2="12"/></svg> },
  { id: 'klien', label: 'Klien',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg> },
  { id: 'printer', label: 'Printer',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V3a1 1 0 011-1h6a1 1 0 011 1v4"/><path d="M2 7h12a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1z"/><path d="M4.5 14v-3h7v3"/></svg> },
  { id: 'material', label: 'Material',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1L2 4.5l6 3 6-3L8 1z"/><path d="M2 8l6 3 6-3"/><path d="M2 11.5l6 3 6-3"/></svg> },
  { id: 'keuangan', label: 'Keuangan',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,12 4.5,8 7.5,10 12,4.5"/><polyline points="10,4.5 12,4.5 12,6.5"/></svg> },
  { id: 'statistik', label: 'Statistik',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="3" height="5" rx="0.8"/><rect x="6.5" y="5" width="3" height="9" rx="0.8"/><rect x="11" y="2" width="3" height="12" rx="0.8"/></svg> },
  { id: 'aktivitas', label: 'Aktivitas',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 10,9.5"/></svg> },
  { id: 'setting', label: 'Setting',
    icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/><circle cx="5.5" cy="4" r="1.5" fill="var(--bg-sidebar)"/><circle cx="10.5" cy="8" r="1.5" fill="var(--bg-sidebar)"/><circle cx="5.5" cy="12" r="1.5" fill="var(--bg-sidebar)"/></svg> },
]
