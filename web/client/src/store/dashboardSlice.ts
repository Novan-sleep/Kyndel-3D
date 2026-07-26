import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { DashboardKPI } from '../types'

export const fetchKPI = createAsyncThunk('dashboard/fetchKPI', async () => api.get<DashboardKPI>('/dashboard/kpi'))

interface DashboardState {
  kpi: DashboardKPI | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: DashboardState = { kpi: null, status: 'idle', error: null }

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKPI.pending, (state) => { state.status = 'loading' })
      .addCase(fetchKPI.fulfilled, (state, action) => { state.status = 'idle'; state.kpi = action.payload })
      .addCase(fetchKPI.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat dashboard' })
  },
})

export default dashboardSlice.reducer
