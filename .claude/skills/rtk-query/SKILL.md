---
name: rtk-query
description: RTK Query patterns — service definition, hooks, cache invalidation, pagination, and lazy queries for the Delo System Client
---

# RTK Query

## When to use

Use this skill when creating new API service files, adding endpoints, managing cache tags, or debugging stale data issues. All API interactions in this project go through RTK Query — never use raw Axios calls in components.

## Service definition pattern

Every service follows this exact structure:

```js
import { axiosBaseQuery } from "@core/services/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildParams } from "@shared/utils/queryHelper";

export const topicService = createApi({
  reducerPath: "topicService",           // MUST match export name
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Topic"],                    // PascalCase singular noun
  endpoints: (builder) => ({
    // LIST
    getTopics: builder.query({
      query: (args) => ({
        url: "/evaluation/topics",
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Topic", id: "LIST" },
              ...result.data.map((r) => ({ type: "Topic", id: r.id })),
            ]
          : [{ type: "Topic", id: "LIST" }],
    }),

    // DETAIL
    getTopicById: builder.query({
      query: (id) => ({ url: `/evaluation/topics/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Topic", id }],
    }),

    // MUTATIONS — always invalidate LIST (and detail if needed)
    createTopic: builder.mutation({
      query: (body) => ({ url: "/evaluation/topics", method: "POST", data: body }),
      invalidatesTags: [{ type: "Topic", id: "LIST" }],
    }),
    updateTopic: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/evaluation/topics/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Topic", id: "LIST" },
        { type: "Topic", id },
      ],
    }),
    deleteTopic: builder.mutation({
      query: (id) => ({ url: `/evaluation/topics/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Topic", id: "LIST" },
        { type: "Topic", id },
      ],
    }),
  }),
});

// Destructure and export hooks at the bottom
export const {
  useGetTopicsQuery,
  useLazyGetTopicsQuery,
  useGetTopicByIdQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicService;
```

## Endpoint → hook naming convention

| Endpoint definition | Auto-generated hook |
|---|---|
| `getXxx: builder.query(...)` | `useGetXxxQuery` |
| `getXxxById: builder.query(...)` | `useGetXxxByIdQuery` |
| `createXxx: builder.mutation(...)` | `useCreateXxxMutation` |
| `updateXxx: builder.mutation(...)` | `useUpdateXxxMutation` |
| `deleteXxx: builder.mutation(...)` | `useDeleteXxxMutation` |

Add `Lazy` for on-demand queries: `useLazyGetXxxQuery` → returns `[trigger, results]` tuple.

## Cache tag pattern (list + detail)

Always use this two-level tag strategy so mutations correctly invalidate both the list view and detail views:

- **List query** (`getXxxs`): provides `{ type: "X", id: "LIST" }` + individual `{ type: "X", id: r.id }` for each item.
- **Detail query** (`getXxxById`): provides `{ type: "X", id }` for the specific item.
- **Mutations**: invalidate `{ type: "X", id: "LIST" }` and (for update/delete) `{ type: "X", id }`.

## Pagination

The `buildParams()` helper converts Ant Design table state to API params:

```js
buildParams({
  keyword: searchTerm,    // search text
  search: "name",         // field to search against
  sort: "name",
  order: "asc",
  filters: { branch: { id: 5 } },  // → "branch.id": 5
  pagination: { current: 1, pageSize: 10 },  // → offset: 0, limit: 10
})
```

API list responses return `{ data: [...], meta: { totalItems: number } }`.

## Five-step checklist for adding a new service

1. **Define service** in `features/{feature}/services/{feature}Service.js` using `createApi` with `axiosBaseQuery()`
2. **Export service** from feature's `index.js`, then from domain's `index.js`
3. **Register service** in `src/core/services/allRTKServices.js` (plain object mapping)
4. **Store auto-configures** — no manual store updates needed
5. **Use exported hooks** in components

## Tag invalidation on org change

When the user switches organizations, `AuthProvider.saveSelectedOrg` dispatches cache invalidation for ALL registered RTK services. If you add a new domain with org-scoped data, add its LIST tag type to the invalidation list in `AuthProvider.jsx`.

## Usage in components

- Always call `.unwrap()` on mutation results to surface errors in `catch` blocks
- Use `App.useApp()` for `message` (not direct `message` import)
- Lazy queries (`useLazyXxxQuery`) for on-demand fetching (e.g., org selector in Header)
