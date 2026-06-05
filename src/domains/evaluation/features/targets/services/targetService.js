import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const targetService = createApi({
  reducerPath: "targetService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EvaluationTarget"],
  endpoints: (builder) => ({
    getTargets: builder.query({
      query: (args) => ({
        url: "/evaluation/targets",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "EvaluationTarget", id: "LIST" },
              ...result.data.map((r) => ({
                type: "EvaluationTarget",
                id: r.id,
              })),
            ]
          : [{ type: "EvaluationTarget", id: "LIST" }],
    }),

    getTargetById: builder.query({
      query: (id) => ({
        url: `/evaluation/targets/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EvaluationTarget", id }],
    }),

    createTarget: builder.mutation({
      query: (body) => ({
        url: "/evaluation/targets",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "EvaluationTarget", id: "LIST" }],
    }),

    updateTarget: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/targets/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EvaluationTarget", id: "LIST" },
        { type: "EvaluationTarget", id },
      ],
    }),

    deleteTarget: builder.mutation({
      query: (id) => ({
        url: `/evaluation/targets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EvaluationTarget", id: "LIST" },
        { type: "EvaluationTarget", id },
      ],
    }),
  }),
});

export const {
  useGetTargetsQuery,
  useGetTargetByIdQuery,
  useCreateTargetMutation,
  useUpdateTargetMutation,
  useDeleteTargetMutation,
} = targetService;
