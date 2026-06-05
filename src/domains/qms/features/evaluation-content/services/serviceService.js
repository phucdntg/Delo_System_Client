import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const serviceService = createApi({
  reducerPath: "serviceService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Service"],
  endpoints: (builder) => ({
    fetchServices: builder.query({
      query: (args) => ({
        url: "/services",
        method: "get",
        params: buildParams(args),
      }),
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: "Service", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "Service", id })),
        ];
      },
    }),

    fetchServiceById: builder.query({
      query: (id) => ({
        url: `/services/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [{ type: "Service", id }],
    }),
  }),
});

export const {
  useFetchServicesQuery,
  useLazyFetchServicesQuery,
  useFetchServiceByIdQuery,
  useLazyFetchServiceByIdQuery,
} = serviceService;
