// Wrapper around window.api with type safety
declare const window: Window & { api: any }

export const api = window.api

export function formatRp(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function formatTgl(iso?: string): string {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function formatJam(jam: number): string {
  return `${jam} jam`
}
