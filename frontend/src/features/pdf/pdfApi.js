import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Note: I'm using the environment variable you told me about.
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/pdfs`,
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the auth state and add it to the headers
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const pdfApi = createApi({
  reducerPath: 'pdfApi',
  baseQuery,
  tagTypes: ['PDF'], // Used for caching and invalidation
  endpoints: (builder) => ({
    // Query to get all PDFs for the logged-in user
    getPdfs: builder.query({
      query: () => '/',
      providesTags: ['PDF'],
    }),
    
    // Mutation to upload a new PDF
    uploadPdf: builder.mutation({
      query: (pdfFile) => {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['PDF'], 
    }),

    // Mutation to delete a PDF by its UUID
    deletePdf: builder.mutation({
      query: (uuid) => ({
        // FIX: Encode the UUID to handle special characters like '/'
        url: `/${encodeURIComponent(uuid)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PDF'],
    }),

    // Mutation to rename a PDF
    renamePdf: builder.mutation({
      query: ({ uuid, newName }) => ({
        // FIX: Encode the UUID to handle special characters like '/'
        url: `/${encodeURIComponent(uuid)}/rename`,
        method: 'PUT',
        body: { newName },
      }),
      invalidatesTags: ['PDF'],
    }),

    // Query to get a single PDF's details
    getPdfByUuid: builder.query({
      // FIX: Encode the UUID here as well for when we build the viewer
      query: (uuid) => `/${encodeURIComponent(uuid)}`,
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPdfsQuery,
  useUploadPdfMutation,
  useDeletePdfMutation,
  useRenamePdfMutation,
  useGetPdfByUuidQuery,
} = pdfApi;