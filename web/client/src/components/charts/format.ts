export function fmtShort(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}M`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}jt`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}rb`
  return `${sign}${abs}`
}
