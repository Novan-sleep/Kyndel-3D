import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Klien } from '../types'

export const fetchKliens = createAsyncThunk('klien/fetchAll', async () => api.get<Klien[]>('/klien'))

export const createKlien = createAsyncThunk('klien/create', async (payload: Partial<Klien>) => api.post<Klien>('/klien', payload))

export const updateKlien = createAsyncThunk('klien/update', async ({ id, payload }: { id: string; payload: Partial<Klien> }) => api.put<Klien>(`/klien/${id}`, payload))

export const deleteKlien = createAsyncThunk('klien/delete', async (id: string) => { await api.delete(`/klien/${id}`); return id })

interface KlienState {
  items: Klien[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: KlienState = { items: [], status: 'idle', error: null }

const klienSlice = createSlice({
  name: 'klien',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKliens.pending, (state) => { state.status = 'loading' })
      .addCase(fetchKliens.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchKliens.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat klien' })
      .addCase(createKlien.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updateKlien.fulfilled, (state, action) => {
        const idx = state.items.findIndex((k) => k.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(deleteKlien.fulfilled, (state, action) => { state.items = state.items.filter((k) => k.id !== action.payload) })
  },
})

export default klienSlice.reducer
