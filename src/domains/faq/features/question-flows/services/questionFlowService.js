import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const questionFlowService = createApi({
  reducerPath: "questionFlowService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["QuestionFlow"],
  endpoints: (builder) => ({
    getQuestionFlows: builder.query({
      query: (args) => ({
        url: "/question-flows",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "QuestionFlow", id: "LIST" },
              ...result.data.map((r) => ({ type: "QuestionFlow", id: r.id })),
            ]
          : [{ type: "QuestionFlow", id: "LIST" }],
    }),

    getQuestionFlowById: builder.query({
      query: (id) => ({ url: `/question-flows/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "QuestionFlow", id }],
    }),

    createQuestionFlow: builder.mutation({
      query: (body) => ({ url: "/question-flows", method: "POST", data: body }),
      invalidatesTags: [{ type: "QuestionFlow", id: "LIST" }],
    }),

    updateQuestionFlow: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/question-flows/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "QuestionFlow", id: "LIST" },
        { type: "QuestionFlow", id },
      ],
    }),

    deleteQuestionFlow: builder.mutation({
      query: (id) => ({ url: `/question-flows/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "QuestionFlow", id: "LIST" }],
    }),
  }),
});

export const {
  useGetQuestionFlowsQuery,
  useLazyGetQuestionFlowsQuery,
  useGetQuestionFlowByIdQuery,
  useCreateQuestionFlowMutation,
  useUpdateQuestionFlowMutation,
  useDeleteQuestionFlowMutation,
} = questionFlowService;
