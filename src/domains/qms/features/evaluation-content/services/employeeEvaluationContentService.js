import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const employeeEvaluationContentService = createApi({
  reducerPath: "employeeEvaluationContentService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EmployeeEvaluationContent"],
  endpoints: (builder) => ({
    fetchEmployeeEvaluationContents: builder.query({
      query: (args) => ({
        url: "/employee-evaluation-contents",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: "EmployeeEvaluationContent", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "EmployeeEvaluationContent", id })),
        ];
      },
    }),

    fetchEmployeeEvaluationContentById: builder.query({
      query: (id) => ({
        url: `/employee-evaluation-contents/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [
        { type: "EmployeeEvaluationContent", id },
      ],
    }),

    createEmployeeEvaluationContent: builder.mutation({
      query: (body) => ({
        url: "/employee-evaluation-contents",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: "EmployeeEvaluationContent", id: "LIST" }];
        if (result?.id)
          tags.push({ type: "EmployeeEvaluationContent", id: result.id });
        return tags;
      },
    }),

    updateEmployeeEvaluationContent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/employee-evaluation-contents/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "EmployeeEvaluationContent", id: args?.id },
        { type: "EmployeeEvaluationContent", id: "LIST" },
      ],
    }),

    deleteEmployeeEvaluationContent: builder.mutation({
      query: (id) => ({
        url: `/employee-evaluation-contents/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EmployeeEvaluationContent", id },
        { type: "EmployeeEvaluationContent", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchEmployeeEvaluationContentsQuery,
  useLazyFetchEmployeeEvaluationContentsQuery,
  useFetchEmployeeEvaluationContentByIdQuery,
  useLazyFetchEmployeeEvaluationContentByIdQuery,
  useCreateEmployeeEvaluationContentMutation,
  useUpdateEmployeeEvaluationContentMutation,
  useDeleteEmployeeEvaluationContentMutation,
} = employeeEvaluationContentService;
