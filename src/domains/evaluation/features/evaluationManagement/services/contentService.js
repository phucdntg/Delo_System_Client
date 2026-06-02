import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const contentService = createApi({
  reducerPath: "contentService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EvaluationContent"],
  endpoints: (builder) => ({
    getContents: builder.query({
      query: (args) => ({
        url: "/evaluation/contents",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "EvaluationContent", id: "LIST" },
              ...result.data.map((r) => ({
                type: "EvaluationContent",
                id: r.id,
              })),
            ]
          : [{ type: "EvaluationContent", id: "LIST" }],
    }),

    getContentById: builder.query({
      query: (id) => ({
        url: `/evaluation/contents/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EvaluationContent", id }],
    }),

    createContent: builder.mutation({
      query: (body) => ({
        url: "/evaluation/contents",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "EvaluationContent", id: "LIST" }],
    }),

    updateContent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/contents/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EvaluationContent", id: "LIST" },
        { type: "EvaluationContent", id },
      ],
    }),

    deleteContent: builder.mutation({
      query: (id) => ({
        url: `/evaluation/contents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EvaluationContent", id: "LIST" },
        { type: "EvaluationContent", id },
      ],
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
} = contentService;
