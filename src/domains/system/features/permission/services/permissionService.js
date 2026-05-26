import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const permissionService = createApi({
  reducerPath: "permissionService",
  baseQuery: axiosBaseQuery(),
  typeTags: ["Permission"],
  endpoints: (builder) => ({
    fetchPermissions: builder.query({
      query: () => ({
        url: "/permissions",
        method: "get",
      }),
      transformResponse: (response) => {
        const ACTION_ORDER = ["view", "create", "edit", "delete"];

        const grouped = response.data.reduce((acc, permission) => {
          const [module, action] = permission.name.split(".");

          if (!acc[module]) {
            acc[module] = {
              name: module,
              actions: [],
              feature: permission.feature,
            };
          }

          acc[module].actions.push({ id: permission.id, name: action });

          return acc;
        }, {});

        Object.values(grouped).forEach((module) => {
          module.actions.sort((a, b) => {
            const posA = ACTION_ORDER.indexOf(a.name);
            const posB = ACTION_ORDER.indexOf(b.name);
            return (
              (posA === -1 ? Infinity : posA) - (posB === -1 ? Infinity : posB)
            );
          });
        });

        return grouped;
      },
    }),

    fetchPermissionsByRole: builder.query({
      query: (roleId) => ({
        url: `/roles/${roleId}/permissions`,
        method: "get",
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: (_, __, roleId) => [
        { type: "Permission", id: `ROLE_${roleId}` },
      ],
    }),

    fetchPermissionsByUser: builder.query({
      query: (userId) => ({
        url: `/users/${userId}/permissions`,
        method: "get",
      }),
      transformResponse: (response) => response?.data || [],
      providesTags: (_, __, userId) => [
        { type: "Permission", id: `USER_${userId}` },
      ],
    }),
  }),
});

export const {
  useFetchPermissionsQuery,
  useFetchPermissionsByRoleQuery,
  useFetchPermissionsByUserQuery,
} = permissionService;
