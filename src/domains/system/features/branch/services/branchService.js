import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../../../../core/services/axiosBaseQuery";
import { buildParams } from "../../../../../shared/utils/queryHelper";

const BRANCH_TAG = "Branch";

export const branchService = createApi({
  reducerPath: "branchService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [BRANCH_TAG],
  endpoints: (builder) => ({
    fetchBranches: builder.query({
      query: (args) => ({
        url: "/branchs",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: BRANCH_TAG, id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: BRANCH_TAG, id })),
        ];
      },
    }),

    fetchBranchById: builder.query({
      query: (id) => ({
        url: `/branchs/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [{ type: BRANCH_TAG, id }],
    }),

    createBranch: builder.mutation({
      query: (body) => ({
        url: "/branchs",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: BRANCH_TAG, id: "LIST" }];
        if (result?.id) tags.push({ type: BRANCH_TAG, id: result.id });
        return tags;
      },
    }),

    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/branchs/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: BRANCH_TAG, id: args?.id },
      ],
    }),

    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branchs/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: BRANCH_TAG, id },
        { type: BRANCH_TAG, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchBranchesQuery,
  useFetchBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchService;
