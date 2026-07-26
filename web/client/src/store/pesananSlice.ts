import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Pesanan } from '../types'

export const fetchPesanan = createAsyncThunk('pesanan/fetchAll', async () => api.get<Pesanan[]>('/pesanan'))

export const createPesanan = createAsyncThunk('pesanan/create', async (payload: Record<string, unknown>) => api.post<Pesanan>('/pesanan', payload))

export const mulaiPrinting = createAsyncThunk('pesanan/mulaiPrinting', async (id: string) => api.post<Pesanan>(`/pesanan/${id}/mulai-printing`))

export const selesaikanPesanan = createAsyncThunk('pesanan/selesaikan', async (id: string) => api.post<Pesanan>(`/pesanan/${id}/selesaikan`))

export const batalkanPesanan = createAsyncThunk('pesanan/batalkan', async (id: string) => api.post<Pesanan>(`/pesanan/${id}/batalkan`))

export const hapusPesanan = createAsyncThunk('pesanan/hapus', async (id: string) => { await api.delete(`/pesanan/${id}`); return id })

interface PesananState {
  items: Pesanan[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: PesananState = { items: [], status: 'idle', error: null }

function upsert(state: PesananState, pesanan: Pesanan) {
  const idx = state.items.findIndex((p) => p.id === pesanan.id)
  if (idx >= 0) state.items[idx] = pesanan
  else state.items.unshift(pesanan)
}

const pesananSlice = createSlice({
  name: 'pesanan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPesanan.pending, (state) => { state.status = 'loading' })
      .addCase(fetchPesanan.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchPesanan.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat pesanan' })
      .addCase(createPesanan.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(mulaiPrinting.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(selesaikanPesanan.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(batalkanPesanan.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(hapusPesanan.fulfilled, (state, action) => { state.items = state.items.filter((p) => p.id !== action.payload) })
  },
})

export default pesananSlice.reducer
