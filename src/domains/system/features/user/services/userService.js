import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@core/services/axiosBaseQuery';
import { buildParams } from '@shared/utils/queryHelper';

const USER_TAG = 'User';
const USER_PERMISSIONS = 'UserPermissions';

export const userService = createApi({
  reducerPath: 'userService',
  baseQuery: axiosBaseQuery(),
  tagTypes: [USER_TAG, USER_PERMISSIONS],
  endpoints: (builder) => ({
    fetchUsers: builder.query({
      query: (args) => ({
        url: '/users',
        method: 'get',
        params: buildParams(args),
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: userRes } = await queryFulfilled;
          const users = userRes?.data ?? [];

          if (users.length === 0) return;

          // Import services dynamically to avoid circular dependencies
          const { branchService } = await import('@domains/system');
          const { organizationService } = await import('@domains/system');

          const organizationIds = [...new Set(users.map((u) => u?.organizationId).filter(Boolean))];
          const branchIds = [...new Set(users.map((u) => u?.branchId).filter(Boolean))];

          const branchPromises = branchIds.map((id) =>
            dispatch(branchService.endpoints.getBranchById.initiate(id)),
          );

          const organizationPromises = organizationIds.map((id) =>
            dispatch(organizationService.endpoints.fetchOrganizationById.initiate(id)),
          );

          await Promise.allSettled([...branchPromises, ...organizationPromises]);

          const state = getState();

          const branchMap = {};
          const organizationMap = {};

          branchIds.forEach((id) => {
            const branchQuery = branchService.endpoints.getBranchById.select(id)(state);
            if (branchQuery?.data) branchMap[id] = branchQuery.data;
          });

          organizationIds.forEach((id) => {
            const organizationQuery = organizationService.endpoints.fetchOrganizationById.select(id)(state);
            if (organizationQuery?.data) organizationMap[id] = organizationQuery.data;
          });

          dispatch(
            userService.util.updateQueryData('fetchUsers', args, (draft) => {
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
          console.error('Error in fetchUsers onQueryStarted:', error);
        }
      },
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: USER_TAG, id: 'LIST' },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: USER_TAG, id })),
        ];
      },
    }),

    fetchUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'get',
      }),
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: (error) => {
        console.error('Fetch user by ID error:', error);
        return {};
      },
      providesTags: (result, error, id) => [{ type: USER_TAG, id }],
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: '/users/generate-user',
        method: 'post',
        data: body,
      }),
      invalidatesTags: (result) => {
        const tags = [{ type: USER_TAG, id: 'LIST' }];
        if (result?.id) tags.push({ type: USER_TAG, id: result.id });
        return tags;
      },
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/update-user/${id}`,
        method: 'patch',
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: USER_TAG, id: args?.id },
        { type: USER_TAG, id: 'LIST' },
        { type: USER_PERMISSIONS, id: args?.id },
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { permissionService } = await import('@domains/system');
          dispatch(permissionService.util.invalidateTags([{ type: USER_PERMISSIONS, id }]));
        } catch (err) {
          console.error('Update user failed:', err);
        }
      },
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (result, error, id) => [
        { type: USER_TAG, id },
        { type: USER_TAG, id: 'LIST' },
      ],
    }),

    fetchUserPermissions: builder.query({
      query: (id) => ({
        url: `/users/${id}/permissions`,
        method: 'get',
      }),
      transformResponse: (response) => (response?.success ? response?.data : []),
      transformErrorResponse: (err) => {
        console.error('Fetch user permissions error:', err);
        return [];
      },
      providesTags: (result, error, id) => [{ type: USER_PERMISSIONS, id }],
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
