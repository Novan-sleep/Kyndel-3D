import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { Setting } from '../types'

export const fetchSetting = createAsyncThunk('setting/fetch', async () => api.get<Setting>('/setting'))

export const updateSetting = createAsyncThunk('setting/update', async (payload: Partial<Setting>) => api.put<Setting>('/setting', payload))

interface SettingState {
  data: Setting | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: SettingState = { data: null, status: 'idle', error: null }

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSetting.pending, (state) => { state.status = 'loading' })
      .addCase(fetchSetting.fulfilled, (state, action) => { state.status = 'idle'; state.data = action.payload })
      .addCase(fetchSetting.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Gagal memuat pengaturan' })
      .addCase(updateSetting.fulfilled, (state, action) => { state.data = action.payload })
  },
})

export default settingSlice.reducer
