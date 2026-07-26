import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Printer } from '../types'

export const fetchPrinters = createAsyncThunk('printers/fetchAll', async () => api.get<Printer[]>('/printer'))

export const createPrinter = createAsyncThunk('printers/create', async (payload: Partial<Printer>) => api.post<Printer>('/printer', payload))

export const updatePrinter = createAsyncThunk('printers/update', async ({ id, payload }: { id: string; payload: Partial<Printer> }) => api.put<Printer>(`/printer/${id}`, payload))

export const deletePrinter = createAsyncThunk('printers/delete', async (id: string) => { await api.delete(`/printer/${id}`); return id })

interface PrintersState {
  items: Printer[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: PrintersState = { items: [], status: 'idle', error: null }

const printersSlice = createSlice({
  name: 'printers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrinters.pending, (state) => { state.status = 'loading' })
      .addCase(fetchPrinters.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchPrinters.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat printer' })
      .addCase(createPrinter.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updatePrinter.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(deletePrinter.fulfilled, (state, action) => { state.items = state.items.filter((p) => p.id !== action.payload) })
  },
})

export default printersSlice.reducer
