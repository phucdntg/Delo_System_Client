import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const recordService = createApi({
  reducerPath: "recordService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EvaluationRecord"],
  endpoints: (builder) => ({
    getRecords: builder.query({
      query: (args) => ({
        url: "/evaluation/records",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "EvaluationRecord", id: "LIST" },
              ...result.data.map((r) => ({
                type: "EvaluationRecord",
                id: r.id,
              })),
            ]
          : [{ type: "EvaluationRecord", id: "LIST" }],
    }),

    getRecordById: builder.query({
      query: (id) => ({
        url: `/evaluation/records/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EvaluationRecord", id }],
    }),
  }),
});

export const { useGetRecordsQuery, useGetRecordByIdQuery } = recordService;
