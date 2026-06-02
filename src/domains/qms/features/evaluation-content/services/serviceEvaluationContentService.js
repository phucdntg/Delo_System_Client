import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

const SERVICE_EVALUATION_CONTENT_TAG = "ServiceEvaluationContent";

export const serviceEvaluationContentService = createApi({
  reducerPath: "serviceEvaluationContentService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [SERVICE_EVALUATION_CONTENT_TAG],
  endpoints: (builder) => ({
    fetchServiceEvaluationContents: builder.query({
      query: (args) => ({
        url: "/service-evaluation-contents",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: SERVICE_EVALUATION_CONTENT_TAG, id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: SERVICE_EVALUATION_CONTENT_TAG, id })),
        ];
      },
    }),

    fetchServiceEvaluationContentById: builder.query({
      query: (id) => ({
        url: `/service-evaluation-contents/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [
        { type: SERVICE_EVALUATION_CONTENT_TAG, id },
      ],
    }),

    createServiceEvaluationContent: builder.mutation({
      query: (body) => ({
        url: "/service-evaluation-contents",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: SERVICE_EVALUATION_CONTENT_TAG, id: "LIST" }];
        if (result?.id)
          tags.push({ type: SERVICE_EVALUATION_CONTENT_TAG, id: result.id });
        return tags;
      },
    }),

    updateServiceEvaluationContent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/service-evaluation-contents/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: SERVICE_EVALUATION_CONTENT_TAG, id: args?.id },
        { type: SERVICE_EVALUATION_CONTENT_TAG, id: "LIST" },
      ],
    }),

    deleteServiceEvaluationContent: builder.mutation({
      query: (id) => ({
        url: `/service-evaluation-contents/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: SERVICE_EVALUATION_CONTENT_TAG, id },
        { type: SERVICE_EVALUATION_CONTENT_TAG, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchServiceEvaluationContentsQuery,
  useLazyFetchServiceEvaluationContentsQuery,
  useFetchServiceEvaluationContentByIdQuery,
  useLazyFetchServiceEvaluationContentByIdQuery,
  useCreateServiceEvaluationContentMutation,
  useUpdateServiceEvaluationContentMutation,
  useDeleteServiceEvaluationContentMutation,
} = serviceEvaluationContentService;
