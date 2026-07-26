import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import printersReducer from './printersSlice'
import materialsReducer from './materialsSlice'
import pesananReducer from './pesananSlice'
import dashboardReducer from './dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    printers: printersReducer,
    materials: materialsReducer,
    pesanan: pesananReducer,
    dashboard: dashboardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
