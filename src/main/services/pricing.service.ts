export function hitungHpp(beratKg: number, hargaBeliPerGram: number, watt: number, estimasiJam: number, tarifListrik: number): number {
  const beratGram = beratKg * 1000
  return (beratGram * hargaBeliPerGram) + (watt / 1000 * estimasiJam * tarifListrik)
}

export function hitungHargaRekomendasi(beratKg: number, hargaJualPerGram: number, watt: number, estimasiJam: number, tarifListrik: number, markup: number): number {
  const beratGram = beratKg * 1000
  return ((beratGram * hargaJualPerGram) + (watt / 1000 * estimasiJam * tarifListrik)) * (1 + markup / 100)
}

export function hitungHppMultiColor(materials: { beratGram: number; hargaBeliPerGram: number }[], watt: number, estimasiJam: number, tarifListrik: number): number {
  const biayaMaterial = materials.reduce((s, m) => s + m.beratGram * m.hargaBeliPerGram, 0)
  return biayaMaterial + (watt / 1000 * estimasiJam * tarifListrik)
}

export function hitungHargaRekomendasiMultiColor(materials: { beratGram: number; hargaJualPerGram: number }[], watt: number, estimasiJam: number, tarifListrik: number, markup: number): number {
  const hargaJualMaterial = materials.reduce((s, m) => s + m.beratGram * m.hargaJualPerGram, 0)
  return (hargaJualMaterial + (watt / 1000 * estimasiJam * tarifListrik)) * (1 + markup / 100)
}

export function previewPricing(beratKg: number, hargaBeliPerGram: number, hargaJualPerGram: number, watt: number, estimasiJam: number, tarifListrik: number, markup: number, nilaiJual: number, multiColorMaterials?: { beratGram: number; hargaBeliPerGram: number; hargaJualPerGram: number }[]) {
  let biayaMaterial: number, hargaJualMaterial: number
  if (multiColorMaterials && multiColorMaterials.length > 0) {
    biayaMaterial = multiColorMaterials.reduce((s, m) => s + m.beratGram * m.hargaBeliPerGram, 0)
    hargaJualMaterial = multiColorMaterials.reduce((s, m) => s + m.beratGram * m.hargaJualPerGram, 0)
  } else {
    const beratGram = beratKg * 1000
    biayaMaterial = beratGram * hargaBeliPerGram
    hargaJualMaterial = beratGram * hargaJualPerGram
  }
  const biayaListrik = watt / 1000 * estimasiJam * tarifListrik
  const hpp = biayaMaterial + biayaListrik
  const hargaRekomendasi = (hargaJualMaterial + biayaListrik) * (1 + markup / 100)
  return { biayaMaterial, marginMaterial: hargaJualMaterial - biayaMaterial, biayaListrik, hpp, hargaRekomendasi, profitEstimasi: nilaiJual - hpp }
}
