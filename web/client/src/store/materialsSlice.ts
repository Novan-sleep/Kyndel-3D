import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Material } from '../types'

export const fetchMaterials = createAsyncThunk('materials/fetchAll', async () => api.get<Material[]>('/material'))

export const createMaterial = createAsyncThunk('materials/create', async (payload: Partial<Material>) => api.post<Material>('/material', payload))

export const updateMaterial = createAsyncThunk('materials/update', async ({ id, payload }: { id: string; payload: Partial<Material> }) => api.put<Material>(`/material/${id}`, payload))

export const deleteMaterial = createAsyncThunk('materials/delete', async (id: string) => { await api.delete(`/material/${id}`); return id })

interface MaterialsState {
  items: Material[]
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: MaterialsState = { items: [], status: 'idle', error: null }

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => { state.status = 'loading' })
      .addCase(fetchMaterials.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchMaterials.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat material' })
      .addCase(createMaterial.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => { state.items = state.items.filter((m) => m.id !== action.payload) })
  },
})

export default materialsSlice.reducer
