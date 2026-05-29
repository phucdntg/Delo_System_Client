import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { ACCESS_TOKEN } from "@shared/constants/systemConstants";

export const authService = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: "/auth/login",
        method: "POST",
        data: { username, password },
      }),
      transformResponse: (response) => response?.data || {},
      transformErrorResponse: (err) => {
        console.error(err);
        return {};
      },
    }),

    getCurrentUser: builder.query({
      query: () => ({
        url: "/auth/current-user",
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      transformErrorResponse: (err) => {
        console.error(err);
        return {};
      },
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "post",
        data: {
          refreshToken: localStorage.getItem(SYSTEM_CONSTANTS.REFRESH_TOKEN),
        },
      }),
      transformResponse: (response) => {
        if (response?.data?.access_token) {
          localStorage.setItem(ACCESS_TOKEN, response.data.access_token);
          return { accessToken: response?.data?.access_token };
        }
      },
      transformErrorResponse: (error) => {
        console.error("Refresh token failed: ", error);
        return error;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authService;
