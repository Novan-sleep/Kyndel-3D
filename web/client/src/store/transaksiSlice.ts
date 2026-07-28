import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Transaksi } from '../types'

export const fetchTransaksi = createAsyncThunk('transaksi/fetchAll', async () => api.get<Transaksi[]>('/transaksi'))

export const fetchTransaksiByBulan = createAsyncThunk('transaksi/fetchByBulan', async (bulan: string) => api.get<Transaksi[]>(`/transaksi/bulan/${bulan}`))

export const createTransaksiManual = createAsyncThunk('transaksi/create', async (payload: Record<string, unknown>) => api.post<Transaksi>('/transaksi', payload))

export const deleteTransaksi = createAsyncThunk('transaksi/delete', async (id: string) => { await api.delete(`/transaksi/${id}`); return id })

interface TransaksiState {
  items: Transaksi[]
  bulanItems: Transaksi[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: TransaksiState = { items: [], bulanItems: [], status: 'idle', error: null }

const transaksiSlice = createSlice({
  name: 'transaksi',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransaksi.pending, (state) => { state.status = 'loading' })
      .addCase(fetchTransaksi.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchTransaksi.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat transaksi' })
      .addCase(fetchTransaksiByBulan.fulfilled, (state, action) => { state.bulanItems = action.payload })
      .addCase(createTransaksiManual.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.bulanItems.unshift(action.payload)
      })
      .addCase(deleteTransaksi.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
        state.bulanItems = state.bulanItems.filter((t) => t.id !== action.payload)
      })
  },
})

export default transaksiSlice.reducer
