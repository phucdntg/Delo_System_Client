import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const counterService = createApi({
  reducerPath: "counterService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Counter"],
  endpoints: (builder) => ({
    getCounters: builder.query({
      query: () => ({ url: "/counters", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "Counter", id: "LIST" },
              ...result.map((r) => ({ type: "Counter", id: r.id })),
            ]
          : [{ type: "Counter", id: "LIST" }],
    }),

    getCounterById: builder.query({
      query: (id) => ({ url: `/counters/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Counter", id }],
    }),

    createCounter: builder.mutation({
      query: (body) => ({ url: "/counters", method: "POST", body }),
      invalidatesTags: [{ type: "Counter", id: "LIST" }],
    }),

    updateCounter: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/counters/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Counter", id },
        { type: "Counter", id: "LIST" },
      ],
    }),

    deleteCounter: builder.mutation({
      query: (id) => ({ url: `/counters/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Counter", id },
        { type: "Counter", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCountersQuery,
  useGetCounterByIdQuery,
  useCreateCounterMutation,
  useUpdateCounterMutation,
  useDeleteCounterMutation,
} = counterService;

export default counterService;
