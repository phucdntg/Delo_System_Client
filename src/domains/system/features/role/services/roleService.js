import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { buildParams } from "@shared/utils/queryHelper";
import { ROLE_TAG } from "../constants";

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
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: ROLE_TAG, id: "LIST" },
          ...rows.map((x) => ({ type: ROLE_TAG, id: x.id })),
        ];
      },
    }),
  }),
});

export const { useFetchRolesQuery } = roleService;
