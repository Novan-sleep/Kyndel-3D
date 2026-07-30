import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import printersReducer from './printersSlice'
import materialsReducer from './materialsSlice'
import pesananReducer from './pesananSlice'
import dashboardReducer from './dashboardSlice'
import klienReducer from './klienSlice'
import transaksiReducer from './transaksiSlice'
import aktivitasReducer from './aktivitasSlice'
import settingReducer from './settingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    printers: printersReducer,
    materials: materialsReducer,
    pesanan: pesananReducer,
    dashboard: dashboardReducer,
    klien: klienReducer,
    transaksi: transaksiReducer,
    aktivitas: aktivitasReducer,
    setting: settingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
