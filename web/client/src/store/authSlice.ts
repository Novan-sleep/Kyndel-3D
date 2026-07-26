import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api, setToken, clearToken, getToken } from '../lib/api'

export const login = createAsyncThunk('auth/login', async (payload: { username: string; password: string }) => {
  const { token } = await api.post<{ token: string }>('/auth/login', payload)
  setToken(token)
  return token
})

interface AuthState {
  token: string | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: AuthState = {
  token: getToken(),
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      clearToken()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.status = 'idle'; state.token = action.payload })
      .addCase(login.rejected, (state, action) => { state.status = 'error'; state.error = action.error.message ?? 'Login gagal' })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
