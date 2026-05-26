import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { buildParams } from "@shared/utils/queryHelper";
import { ROLE_TAG } from "../constants";
import { branchService } from "../../branch";

export const roleService = createApi({
  reducerPath: "roleService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [ROLE_TAG],
  endpoints: (builder) => ({
    fetchRoles: builder.query({
      query: (args) => ({
        url: "/roles",
        method: "get",
        params: buildParams(args),
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: roleRes } = await queryFulfilled;
          const roles = roleRes?.data ?? [];

          if (roles.length === 0) return;

          const branchIds = [
            ...new Set(roles.map((r) => r?.branchId).filter(Boolean)),
          ];

          if (branchIds.length === 0) return;

          const branchPromises = branchIds.map((id) =>
            dispatch(branchService.endpoints.fetchBranchById.initiate(id)),
          );

          await Promise.allSettled(
            branchPromises.map((promise) => promise.unwrap()),
          );

          const state = getState();
          const branchMap = {};

          branchIds.forEach((id) => {
            const branchQuery =
              branchService.endpoints.fetchBranchById.select(id)(state);
            if (branchQuery) branchMap[id] = branchQuery.data;
          });

          dispatch(
            roleService.util.updateQueryData("fetchRoles", args, (draft) => {
              draft.data = draft?.data.map((role) => ({
                ...role,
                branch: branchMap[role?.branchId] || null,
              }));
            }),
          );
        } catch (error) {
          console.error(
            "Fetching branches based on roles failed with error:",
            error,
          );
        }
      },
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: ROLE_TAG, id: "LIST" },
          ...rows.map((x) => ({ type: ROLE_TAG, id: x.id })),
        ];
      },
    }),

    fetchRolePermissions: builder.query({
      query: (id) => ({
        url: `/roles/${id}/permissions`,
        method: "get",
      }),
      transformResponse: (response) => response?.data || null,
      providesTags: (result, error, id) => [{ type: ROLE_TAG, id }],
    }),

    createRole: builder.mutation({
      query: (body) => ({
        url: "/roles/generate-role",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: ROLE_TAG, id: "LIST" }];
        if (result?.id) tags.push({ type: ROLE_TAG, id: result.id });
        return tags;
      },
    }),

    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/roles/update-role/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: ROLE_TAG, id: args?.id },
        { type: ROLE_TAG, id: "LIST" },
      ],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: ROLE_TAG, id },
        { type: ROLE_TAG, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchRolesQuery,
  useFetchRolePermissionsQuery,
  useLazyFetchRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleService;
