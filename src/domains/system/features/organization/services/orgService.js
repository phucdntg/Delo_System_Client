import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { buildParams } from "@shared/utils/queryHelper";

const ORG_TAG = "Org";

export const orgService = createApi({
  reducerPath: "orgService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [ORG_TAG],
  endpoints: (builder) => ({
    fetchOrg: builder.query({
      query: (args) => ({
        url: "/organizations",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: ORG_TAG, id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: ORG_TAG, id })),
        ];
      },
    }),

    fetchOrganizationById: builder.query({
      query: (id) => ({
        url: "/organizations/" + id,
        method: "get",
      }),
      transformResponse: (response) => {
        return response?.success ? response?.data : {};
      },
      transformErrorResponse: (error) => {
        console.log("Fetch organization details failed with error: ", error);
        return {};
      },
      providesTags: (result, error, id) => [{ type: ORG_TAG, id }],
    }),

    createOrg: builder.mutation({
      query: (body) => ({
        url: "/organizations",
        method: "post",
        data: body,
      }),
      invalidatesTags: (result) => {
        const tags = [{ type: ORG_TAG, id: "LIST" }];
        if (result?.id) tags.push({ type: ORG_TAG, id: result.id });
        return tags;
      },
    }),

    updateOrg: builder.mutation({
      query: ({ id, body }) => ({
        url: `/organizations/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: ORG_TAG, id: args?.id },
      ],
    }),

    updateForceUpdateOrg: builder.mutation({
      query: ({ id }) => ({
        url: `/organizations/force-update/${id}`,
        method: "post",
      }),
      transformErrorResponse: (error) => {
        console.log("Force update organization failed with error: ", error);
        return {};
      },
    }),

    deleteOrg: builder.mutation({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: ORG_TAG, id },
        { type: ORG_TAG, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchOrgQuery,
  useLazyFetchOrgQuery,
  useFetchOrganizationByIdQuery,
  useLazyFetchOrganizationByIdQuery,
  useCreateOrgMutation,
  useUpdateOrgMutation,
  useUpdateForceUpdateOrgMutation,
  useDeleteOrgMutation,
} = orgService;
