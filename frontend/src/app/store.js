import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import authReducer from '../features/auth/authSlice';
import {pdfApi} from '../features/pdf/pdfApi';
import { highlightApi } from '../features/highlight/highlightApi';

export const store = configureStore({
  reducer: {
    [pdfApi.reducerPath]: pdfApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [highlightApi.reducerPath]: highlightApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, pdfApi.middleware, highlightApi.middleware),
});
