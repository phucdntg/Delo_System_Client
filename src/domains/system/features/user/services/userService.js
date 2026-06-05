import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const userService = createApi({
  reducerPath: "userService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User", "UserPermissions"],
  endpoints: (builder) => ({
    fetchUsers: builder.query({
      query: (args) => ({
        url: "/users",
        method: "get",
        params: buildParams(args),
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: userRes } = await queryFulfilled;
          const users = userRes?.data ?? [];

          if (users.length === 0) return;

          // Import services dynamically to avoid circular dependencies
          const { branchService } = await import("@domains/system");
          const { orgService } = await import("@domains/system");

          const organizationIds = [
            ...new Set(users.map((u) => u?.organizationId).filter(Boolean)),
          ];
          const branchIds = [
            ...new Set(users.map((u) => u?.branchId).filter(Boolean)),
          ];

          const branchPromises = branchIds.map((id) =>
            dispatch(branchService.endpoints.fetchBranchById.initiate(id)),
          );

          const organizationPromises = organizationIds.map((id) =>
            dispatch(orgService.endpoints.fetchOrganizationById.initiate(id)),
          );

          await Promise.allSettled([
            ...branchPromises,
            ...organizationPromises,
          ]);

          const state = getState();

          const branchMap = {};
          const organizationMap = {};

          branchIds.forEach((id) => {
            const branchQuery =
              branchService.endpoints.fetchBranchById.select(id)(state);
            if (branchQuery?.data) branchMap[id] = branchQuery.data;
          });

          organizationIds.forEach((id) => {
            const organizationQuery =
              orgService.endpoints.fetchOrganizationById.select(id)(state);
            if (organizationQuery?.data)
              organizationMap[id] = organizationQuery.data;
          });

          dispatch(
            userService.util.updateQueryData("fetchUsers", args, (draft) => {
              draft.data = draft?.data.map((user) => ({
                ...user,
                branch: branchMap[user?.branchId] || null,
                branchName: branchMap[user?.branchId]?.name,
                organization: organizationMap[user?.organizationId] || null,
                organizationName: organizationMap[user?.organizationId]?.name,
              }));
            }),
          );
        } catch (error) {
          console.error("Error in fetchUsers onQueryStarted:", error);
        }
      },
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: "User", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "User", id })),
        ];
      },
    }),

    fetchUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "get",
      }),
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: (error) => {
        console.error("Fetch user by ID error:", error);
        return {};
      },
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: "/users/generate-user",
        method: "post",
        data: body,
      }),
      invalidatesTags: (result) => {
        const tags = [{ type: "User", id: "LIST" }];
        if (result?.id) tags.push({ type: "User", id: result.id });
        return tags;
      },
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/update-user/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "User", id: args?.id },
        { type: "User", id: "LIST" },
        { type: "UserPermissions", id: args?.id },
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { permissionService } = await import("@domains/system");
          dispatch(
            permissionService.util.invalidateTags([
              { type: "UserPermissions", id },
            ]),
          );
        } catch (err) {
          console.error("Update user failed:", err);
        }
      },
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    fetchUserPermissions: builder.query({
      query: (id) => ({
        url: `/permissions?userPermissions.userId=${id}`, // thắc mắc thì hỏi Backend
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : [],
      transformErrorResponse: (err) => {
        console.error("Fetch user permissions error:", err);
        return [];
      },
      providesTags: (result, error, id) => [{ type: "UserPermissions", id }],
    }),
  }),
});

export const {
  useFetchUsersQuery,
  useFetchUserByIdQuery,
  useLazyFetchUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useFetchUserPermissionsQuery,
} = userService;
