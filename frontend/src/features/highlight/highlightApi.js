import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/highlights`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const highlightApi = createApi({
  reducerPath: "highlightApi",
  baseQuery,
  tagTypes: ["Highlight"],
  endpoints: (builder) => ({
    // Query to get all highlights for a specific PDF
    getHighlightsByPdf: builder.query({
      // THE FIX: Encode the pdfId to handle special characters like '/'
      query: ({ pdfId, searchTerm = '' }) => {
        const encodedPdfId = encodeURIComponent(pdfId);
        if (searchTerm.trim()) {
          return `/search/${encodedPdfId}?q=${encodeURIComponent(searchTerm)}`;
        }
        return `/${encodedPdfId}`;
      },
      providesTags: (result = []) => [
        "Highlight",
        ...result.map(({ _id }) => ({ type: "Highlight", id: _id })),
      ],
    }),

    updateHighlightNote: builder.mutation({
      query: ({ id, note }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { note },
      }),
      // This will smartly refetch only the data for the updated highlight
      invalidatesTags: (result, error, { id }) => [{ type: "Highlight", id }],
    }),

    // Mutation to add a new highlight
    addHighlight: builder.mutation({
      query: (newHighlight) => ({
        url: "/",
        method: "POST",
        body: newHighlight,
      }),
      invalidatesTags: ["Highlight"],
    }),

    // Mutation to delete a highlight by its own _id
    deleteHighlight: builder.mutation({
      query: (id) => ({
        // Note: Encoding this ID as well for consistency, though it's less likely to have special characters.
        url: `/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Highlight"],
    }),
  }),
});

export const {
  useGetHighlightsByPdfQuery,
  useAddHighlightMutation,
  useDeleteHighlightMutation,
  useUpdateHighlightNoteMutation,
} = highlightApi;
