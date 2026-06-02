import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

const EMPLOYEE_EVALUATION_CONTENT_TAG = "EmployeeEvaluationContent";

export const employeeEvaluationContentService = createApi({
  reducerPath: "employeeEvaluationContentService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [EMPLOYEE_EVALUATION_CONTENT_TAG],
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
          { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: EMPLOYEE_EVALUATION_CONTENT_TAG, id })),
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
        { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id },
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
        const tags = [{ type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: "LIST" }];
        if (result?.id)
          tags.push({ type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: result.id });
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
        { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: args?.id },
        { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: "LIST" },
      ],
    }),

    deleteEmployeeEvaluationContent: builder.mutation({
      query: (id) => ({
        url: `/employee-evaluation-contents/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id },
        { type: EMPLOYEE_EVALUATION_CONTENT_TAG, id: "LIST" },
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
