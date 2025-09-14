import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create a single API slice for all of your API calls
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'PDF', 'Highlight'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    getPdfs: builder.query({
      query: () => '/pdfs',
      providesTags: ['PDF'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetPdfsQuery } = authApi;
