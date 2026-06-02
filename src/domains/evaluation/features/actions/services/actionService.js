import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const actionService = createApi({
  reducerPath: "actionService",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EvaluationAction"],
  endpoints: (builder) => ({
    getActions: builder.query({
      query: (args) => ({
        url: "/evaluation/actions",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "EvaluationAction", id: "LIST" },
              ...result.data.map((r) => ({
                type: "EvaluationAction",
                id: r.id,
              })),
            ]
          : [{ type: "EvaluationAction", id: "LIST" }],
    }),

    getActionById: builder.query({
      query: (id) => ({
        url: `/evaluation/actions/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EvaluationAction", id }],
    }),

    createAction: builder.mutation({
      query: (body) => ({
        url: "/evaluation/actions",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "EvaluationAction", id: "LIST" }],
    }),

    createActionWithIcon: builder.mutation({
      query: ({ formData, topicId, label, color, displayOrder, isActive }) => {
        const fd = new FormData();
        if (formData instanceof File) {
          fd.append("file", formData);
        }
        fd.append("topicId", topicId);
        fd.append("label", label);
        if (color) fd.append("color", color);
        fd.append("displayOrder", displayOrder || 0);
        fd.append("isActive", isActive !== false);

        return {
          url: "/evaluation/actions/icon",
          method: "POST",
          data: fd,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
      invalidatesTags: [{ type: "EvaluationAction", id: "LIST" }],
    }),

    updateAction: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/actions/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EvaluationAction", id: "LIST" },
        { type: "EvaluationAction", id },
      ],
    }),

    updateActionIcon: builder.mutation({
      query: ({ id, formData, label, color, displayOrder, isActive }) => {
        const fd = new FormData();
        if (formData instanceof File) {
          fd.append("file", formData);
        }
        if (label !== undefined) fd.append("label", label);
        if (color !== undefined) fd.append("color", color);
        if (displayOrder !== undefined) fd.append("displayOrder", displayOrder);
        if (isActive !== undefined) fd.append("isActive", isActive);

        return {
          url: `/evaluation/actions/${id}/icon`,
          method: "PATCH",
          data: fd,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "EvaluationAction", id: "LIST" },
        { type: "EvaluationAction", id },
      ],
    }),

    deleteAction: builder.mutation({
      query: (id) => ({
        url: `/evaluation/actions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EvaluationAction", id: "LIST" },
        { type: "EvaluationAction", id },
      ],
    }),
  }),
});

export const {
  useGetActionsQuery,
  useLazyGetActionsQuery,
  useGetActionByIdQuery,
  useCreateActionMutation,
  useCreateActionWithIconMutation,
  useUpdateActionMutation,
  useUpdateActionIconMutation,
  useDeleteActionMutation,
} = actionService;
