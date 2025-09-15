import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import authReducer from '../features/auth/authSlice';
import {pdfApi} from '../features/pdf/pdfApi';

export const store = configureStore({
  reducer: {
    [pdfApi.reducerPath]: pdfApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, pdfApi.middleware),
});
