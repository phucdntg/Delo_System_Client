import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

const SERVICE_TAG = "Service";

export const serviceService = createApi({
  reducerPath: "serviceService",
  baseQuery: axiosBaseQuery(),
  tagTypes: [SERVICE_TAG],
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
          { type: SERVICE_TAG, id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: SERVICE_TAG, id })),
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
      providesTags: (result, error, id) => [{ type: SERVICE_TAG, id }],
    }),
  }),
});

export const {
  useFetchServicesQuery,
  useLazyFetchServicesQuery,
  useFetchServiceByIdQuery,
  useLazyFetchServiceByIdQuery,
} = serviceService;
