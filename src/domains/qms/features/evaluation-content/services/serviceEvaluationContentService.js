import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const serviceEvaluationContentService = createApi({
  reducerPath: "serviceEvaluationContentService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ServiceEvaluationContent"],
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
          { type: "ServiceEvaluationContent", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "ServiceEvaluationContent", id })),
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
        { type: "ServiceEvaluationContent", id },
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
        const tags = [{ type: "ServiceEvaluationContent", id: "LIST" }];
        if (result?.id)
          tags.push({ type: "ServiceEvaluationContent", id: result.id });
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
        { type: "ServiceEvaluationContent", id: args?.id },
        { type: "ServiceEvaluationContent", id: "LIST" },
      ],
    }),

    deleteServiceEvaluationContent: builder.mutation({
      query: (id) => ({
        url: `/service-evaluation-contents/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ServiceEvaluationContent", id },
        { type: "ServiceEvaluationContent", id: "LIST" },
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
