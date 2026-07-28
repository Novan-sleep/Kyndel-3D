import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Aktivitas } from '../types'

export const fetchAktivitas = createAsyncThunk('aktivitas/fetchAll', async (limit: number | undefined = 200) => api.get<Aktivitas[]>(`/aktivitas?limit=${limit}`))

interface AktivitasState {
  items: Aktivitas[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: AktivitasState = { items: [], status: 'idle', error: null }

const aktivitasSlice = createSlice({
  name: 'aktivitas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAktivitas.pending, (state) => { state.status = 'loading' })
      .addCase(fetchAktivitas.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchAktivitas.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat aktivitas' })
  },
})

export default aktivitasSlice.reducer
