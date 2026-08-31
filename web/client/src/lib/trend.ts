// Shared helper for "bulan ini vs bulan lalu" KPI trend chips (KpiCard's `trend` prop).

// null = tidak ada data pembanding (periode lalu kosong) -> jangan tampilkan chip
export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null
  return Math.round(((curr - prev) / prev) * 1000) / 10
}
