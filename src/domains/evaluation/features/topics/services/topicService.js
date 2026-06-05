import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const topicService = createApi({
  reducerPath: "topicService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EvaluationTopic"],
  endpoints: (builder) => ({
    getTopics: builder.query({
      query: (args) => ({
        url: "/evaluation/topics",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "EvaluationTopic", id: "LIST" },
              ...result.data.map((r) => ({
                type: "EvaluationTopic",
                id: r.id,
              })),
            ]
          : [{ type: "EvaluationTopic", id: "LIST" }],
    }),

    getTopicById: builder.query({
      query: (id) => ({
        url: `/evaluation/topics/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EvaluationTopic", id }],
    }),

    createTopic: builder.mutation({
      query: (body) => ({
        url: "/evaluation/topics",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "EvaluationTopic", id: "LIST" }],
    }),

    updateTopic: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/topics/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EvaluationTopic", id: "LIST" },
        { type: "EvaluationTopic", id },
      ],
    }),

    deleteTopic: builder.mutation({
      query: (id) => ({
        url: `/evaluation/topics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EvaluationTopic", id: "LIST" },
        { type: "EvaluationTopic", id },
      ],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useLazyGetTopicsQuery,
  useGetTopicByIdQuery,
  useLazyGetTopicByIdQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicService;
