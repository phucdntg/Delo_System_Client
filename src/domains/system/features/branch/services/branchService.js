import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { buildParams } from "@shared/utils/queryHelper";

export const branchService = createApi({
  reducerPath: "branchService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Branch"],
  endpoints: (builder) => ({
    fetchBranches: builder.query({
      query: (args) => ({
        url: "/branches",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: "Branch", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "Branch", id })),
        ];
      },
    }),

    fetchBranchById: builder.query({
      query: (id) => ({
        url: `/branches/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [{ type: "Branch", id }],
    }),

    createBranch: builder.mutation({
      query: (body) => ({
        url: "/branches",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: "Branch", id: "LIST" }];
        if (result?.id) tags.push({ type: "Branch", id: result.id });
        return tags;
      },
    }),

    updateBranch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/branches/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "Branch", id: args?.id },
      ],
    }),

    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branches/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Branch", id },
        { type: "Branch", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchBranchesQuery,
  useLazyFetchBranchesQuery,
  useLazyFetchBranchByIdQuery,
  useFetchBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchService;
