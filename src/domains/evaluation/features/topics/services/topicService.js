import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const topicService = createApi({
  reducerPath: "topicService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Topic"],
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
              { type: "Topic", id: "LIST" },
              ...result.data.map((r) => ({ type: "Topic", id: r.id })),
            ]
          : [{ type: "Topic", id: "LIST" }],
    }),

    getTopicById: builder.query({
      query: (id) => ({
        url: `/evaluation/topics/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Topic", id }],
    }),

    createTopic: builder.mutation({
      query: (body) => ({
        url: "/evaluation/topics",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Topic", id: "LIST" }],
    }),

    updateTopic: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/topics/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Topic", id: "LIST" },
        { type: "Topic", id },
      ],
    }),

    deleteTopic: builder.mutation({
      query: (id) => ({
        url: `/evaluation/topics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Topic", id: "LIST" },
        { type: "Topic", id },
      ],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useLazyGetTopicsQuery,
  useGetTopicByIdQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicService;
