import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";
import { branchService } from "../../branch";

export const areaService = createApi({
  reducerPath: "areaService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Area"],
  endpoints: (builder) => ({
    fetchAreas: builder.query({
      query: (args) => ({
        url: "/areas",
        method: "get",
        params: buildParams(args),
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: areaRes } = await queryFulfilled;
          const areas = areaRes?.data ?? [];

          if (areas.length === 0) return;

          const branchIds = [
            ...new Set(areas.map((a) => a?.branchId).filter(Boolean)),
          ];

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
            areaService.util.updateQueryData("fetchAreas", args, (draft) => {
              draft.data = draft?.data.map((area) => ({
                ...area,
                branch: branchMap[area?.branchId] || null,
              }));
            }),
          );
        } catch (error) {
          console.error(
            "Fetching branches based on area failed with error:",
            error,
          );
        }
      },
      providesTags: (result) => {
        const rows = result?.data ?? [];
        return [
          { type: "Area", id: "LIST" },
          ...rows
            .map((x) => x?.id)
            .filter(Boolean)
            .map((id) => ({ type: "Area", id })),
        ];
      },
    }),

    fetchAreaById: builder.query({
      query: (id) => ({
        url: `/areas/${id}`,
        method: "get",
      }),
      transformResponse: (response) =>
        response?.success ? response?.data : {},
      providesTags: (result, error, id) => [{ type: "Area", id }],
    }),

    createArea: builder.mutation({
      query: (body) => ({
        url: "/areas",
        method: "post",
        data: body,
      }),
      transformResponse: (res) => (res?.success ? res?.data : null),
      invalidatesTags: (result) => {
        const tags = [{ type: "Area", id: "LIST" }];
        if (result?.id) tags.push({ type: "Area", id: result.id });
        return tags;
      },
    }),

    updateArea: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/areas/${id}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, args) => [
        { type: "Area", id: args?.id },
      ],
    }),

    deleteArea: builder.mutation({
      query: (id) => ({
        url: `/areas/${id}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Area", id },
        { type: "Area", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFetchAreasQuery,
  useLazyFetchAreasQuery,
  useLazyFetchAreaByIdQuery,
  useFetchAreaByIdQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
} = areaService;
