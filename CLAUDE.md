# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Delo System Client is a React-based multi-domain management system built with a domain-driven architecture. The application manages multiple business domains including QMS (Queue Management System), QNA (Q&A), Evaluation, Lookup, and System administration.

## Tech Stack

- **React 19** with React Compiler enabled only for production builds
- **Vite 8** (via `@vitejs/plugin-react`) - Build tool and dev server
- **Redux Toolkit** with RTK Query for API calls and Redux slices for app state
- **React Router v7** - Client-side routing
- **Ant Design 6** - UI component library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client (used within RTK Query via custom base query)

## Development Commands

```bash
# Start development server (uses .env.development)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

**Note:** No test framework is configured (no Jest, Vitest, etc.).

## Architecture

### Domain-Driven Structure

The codebase is organized into domains under `src/domains/`. Each domain follows a consistent structure:

```
src/domains/{domain}/
├── index.js                    # Public API — exports routes, navigation, features
├── routes.jsx                  # Domain-specific route definitions
├── navigation.jsx              # Sidebar navigation items for this domain
└── features/{feature}/
    ├── index.js                # Feature public API (re-exports services/hooks/components)
    ├── services/               # RTK Query service definitions
    ├── hooks/                  # Custom hooks (often wrapping RTK Query hooks)
    ├── components/             # UI components
    ├── pages/                  # Page components (lazy-loaded)
    └── constants/              # Feature-specific constants
```

**⚠️ Import Rule (partially enforced — expand `no-restricted-imports` in `eslint.config.js`):**
Never import directly into internal paths of a feature (e.g., `@domains/qms/features/counter/services/...`). Only use the public API via the domain's `index.js` and feature's `index.js` barrel exports. The same restriction applies to relative imports across features (`../*/services/*`, `../*/hooks/*`, `../*/store/*`).

**Current ESLint enforcement:** Only `@domains/system/features/*` and `@domains/qms/features/*` explicit path patterns are blocked, plus relative `../*/services/*`, `../*/hooks/*`, `../*/store/*` patterns. New domains need their explicit path patterns added to the `no-restricted-imports` rule in `eslint.config.js`.**Violations fail CI lint.**

**Available Domains:**
- `system` — Organization, branch, area, role, user, permission management (5 features)
- `qms` — Queue management: counters and evaluation-contents (2 features). Only `counters` and `evaluation-contents` have routes; dashboard, services, and config pages are not yet implemented.
- `qna` — Q&A management (no routes or features implemented yet — only navigation structure exists)
- `evaluation` — Evaluation and reviews. Recently restructured from a monolithic `evaluationManagement` feature into separate features: `topics`, `targets`, `actions`, `contents`. The legacy `evaluationManagement` feature still exists but only exports `recordService`.
- `lookup` — Search and lookup (no routes or features implemented yet — only navigation structure exists)
- `auth` — Authentication (login feature only; no domain `routes.jsx` — the login route is hardcoded in `src/core/routes/router.jsx`)
- `kiosk` — Kiosk-specific features (not yet implemented)

### Core Structure

The `src/core/` directory contains shared infrastructure:

- **`config/`** - Application configuration (`VITE_BASE_URL` → `config.baseUrl`, defaults to `http://localhost:8080`)
- **`services/`** - Axios instance (with interceptors) and `axiosBaseQuery` wrapper
  - `axios.js` — Axios instance with request/response interceptors (Bearer token, token refresh with queuing)
  - `axiosBaseQuery.js` — RTK Query wrapper adding `X-Organization-Id` and `X-Device-Id` headers
  - `allRTKServices.js` — Registry of all RTK Query services for auto-registration in the store
- **`store/`** - Redux store configuration (auto-registers all RTK Query services + app slices)
  - RTK Query services auto-register via `allRTKServices` iteration
  - App state slices (e.g., `domainSlice`) are manually registered alongside — use this pattern for state that must survive HMR
- **`routes/`** - Centralized routing config with guards (`ProtectedRoute`, `RequireOrgGuard`, `ErrorBoundary`, `RouteTitleSync`)
- **`navigation/`** - Navigation aggregation from all domains (`DOMAIN_MODULES` array)
- **`providers/`** - Context providers (`AuthProvider`, `SidebarProvider`, `TranslateProvider`)
- **`layouts/`** - Layout components (`MainLayout` → renders `Sidebar` + `Header` + `<Outlet />`)
- **`hooks/`** - Shared hooks (`useModal`, `usePermission`, `useSelect`, `useTable`)

### Provider Hierarchy

Defined in `src/main.jsx`, from outer to inner:

1. Redux `<Provider store={store}>`
2. `AuthProvider` — token, user, org, domainActive, logout
3. `TranslateProvider` — i18n via JSON namespace files
4. Ant Design `<ConfigProvider>` — theme token (`colorPrimary: "#5865f2"`)
5. `SidebarProvider` — sidebar expand/hover/mobile state
6. Ant Design `<App>` — required for Ant Design 6's `message`, `notification`, `modal` static methods
7. `<App />` — renders `<RouterProvider router={router} />`

### State Management: RTK Query + Redux Slices

The Redux store combines two patterns:

**RTK Query services** — all API interactions. Auto-registered by iterating `allRTKServices` values. Each service is registered as both a reducer and middleware automatically.

**Redux slices** — for app-level state that must survive HMR (e.g., `domainActive` via `domainSlice`). Manually registered in the store alongside RTK Query reducers. Use `createSlice` from `@reduxjs/toolkit` for any state that should persist across hot reloads during development.

#### Adding a new RTK Query Service (5-step checklist)

1. **Define service** in `src/domains/{domain}/features/{feature}/services/{feature}Service.js` using `createApi` with `axiosBaseQuery()`
2. **Export service** from feature's `index.js`, then from domain's `index.js`
3. **Register service** in `src/core/services/allRTKServices.js` (a plain object mapping service names to service definitions)
4. **Store auto-configures** itself — no manual store updates needed
5. **Use exported hooks** in components (e.g., `useGetCountersQuery`, `useCreateCounterMutation`)

**Service naming convention:** Each service uses `reducerPath` matching its variable name (e.g., `counterService` → `reducerPath: "counterService"`). Tag types use PascalCase singular nouns (e.g., `"Counter"`, `"EmployeeEvaluationContent"`).

**Endpoint naming convention (auto-generated hooks):**
| Endpoint | Hook |
|---|---|
| `getXxx: builder.query(...)` | `useGetXxxQuery` |
| `getXxxById: builder.query(...)` | `useGetXxxByIdQuery` |
| `createXxx: builder.mutation(...)` | `useCreateXxxMutation` |
| `updateXxx: builder.mutation(...)` | `useUpdateXxxMutation` |
| `deleteXxx: builder.mutation(...)` | `useDeleteXxxMutation` |

**Lazy query pattern:** For on-demand fetching (e.g., in the Header's org selector), use `useLazyGetXxxQuery()` which returns a `[trigger, results]` tuple.

**Tag invalidation pattern (list + detail):**
```js
// List query — provides LIST tag + individual item tags
getCounters: builder.query({
  query: () => ({ url: "/counters", method: "GET" }),
  providesTags: (result) =>
    result
      ? [
          { type: "Counter", id: "LIST" },
          ...result.map((r) => ({ type: "Counter", id: r.id })),
        ]
      : [{ type: "Counter", id: "LIST" }],
}),

// Mutation — invalidates LIST (and optionally the specific item)
updateCounter: builder.mutation({
  query: ({ id, ...patch }) => ({
    url: `/counters/${id}`,
    method: "PATCH",
    body: patch,
  }),
  invalidatesTags: (result, error, { id }) => [
    { type: "Counter", id },
    { type: "Counter", id: "LIST" },
  ],
}),
```

### Axios Interceptors & Token Refresh

The Axios instance (`src/core/services/axios.js`) handles:

- **Request interceptor:** Attaches `Bearer` token from `localStorage(ACCESS_TOKEN)` to every request
- **Response interceptor:** On 401 errors, automatically attempts token refresh via `/auth/refresh-token`. Failed refresh requests are queued and retried once the new token arrives. If refresh fails, clears localStorage and redirects to login.

### Custom Base Query for RTK Query

`axiosBaseQuery()` (`src/core/services/axiosBaseQuery.js`) wraps Axios for use with RTK Query. It automatically:

- Attaches `X-Organization-Id` header from `localStorage(ORG_ID)` (unless `skipOrgId` param is set on the query params)
- Attaches `X-Device-Id` header from `localStorage(DEVICE_ID)` (sent as Bearer token in the header)
- Wraps responses in `{ data }` or `{ error }` format expected by RTK Query

### Route Path Constants

All route paths are centralized in `src/shared/constants/systemConstants.js` under the `PATH` object, organized by domain:

```js
PATH.SYSTEM.BASE         → "system"
PATH.SYSTEM.ORG_MANAGEMENT → "organizations"
PATH.QMS.BASE           → "qms"
PATH.QMS.COUNTERS       → "counters"
```

Routes and navigation both reference these constants — never hardcode path strings in components. Navigation paths are constructed as `/${PATH.QMS.BASE}/${PATH.QMS.COUNTERS}`.

### LocalStorage Key Constants

All localStorage keys are defined as constants in `src/shared/constants/systemConstants.js`:

```js
ACCESS_TOKEN  → "access_token"
REFRESH_TOKEN → "refresh_token"
USER_INFO     → "user_info"
ORG_ID        → "org_id"        // Stored in localStorage, sent as X-Organization-Id
DEVICE_ID     → "device_id"     // Stored in localStorage, sent as X-Device-Id
LANGUAGE      → "delo_language" // "vi" or "en"
```

### Routing Pattern

Routes are defined per domain in `routes.jsx` as plain arrays of route objects. Each route can have:

- `path` — route path relative to the domain prefix (references `PATH` constants)
- `handle: { title }` — page title (used by `RouteTitleSync` to update `document.title`)
- `requireOrg: boolean` — controls whether `RequireOrgGuard` enforces organization selection
- `element` — lazy-loaded page component (imported with `lazy()`)

Routes are aggregated in `src/core/routes/router.jsx`, where each domain's routes are wrapped with a shared `RouteGuard` component:

```jsx
function RouteGuard({ route }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRoute>
          <RequireOrgGuard required={route.requireOrg}>
            {route.element}
          </RequireOrgGuard>
        </ProtectedRoute>
      </Suspense>
    </ErrorBoundary>
  );
}
```

Each domain route array is spread inside its parent path with the `RouteGuard` wrapper:

```jsx
...systemRoutes.map((route) => ({
  ...route,
  element: <RouteGuard route={route} />,
})),
```

The guard stack (from outermost to innermost):
1. **ErrorBoundary** — Catches rendering errors
2. **Suspense** — Handles lazy-loaded components (fallback: `<div>Loading...</div>`)
3. **ProtectedRoute** — Checks `isAuthenticated` from `AuthProvider`; redirects to login if missing
4. **RequireOrgGuard** — Shows warning if `requireOrg` is true and `selectedOrg` is falsy

The default root redirect is `/system/organizations`. The login page at `/auth/login` sits outside `MainLayout`.

### RouteGuard Pattern

Route wrapping logic is centralized in a `RouteGuard` component in `router.jsx` rather than duplicated per domain. This component composes `ErrorBoundary` → `Suspense` → `ProtectedRoute` → `RequireOrgGuard`. Each domain route array is mapped through `RouteGuard`:

```jsx
...systemRoutes.map((route) => ({
  ...route,
  element: <RouteGuard route={route} />,
})),
```

This avoids repeating the guard stack for each of the 5 domain groups. The 404 catch-all route at the end of `MainLayout` children uses its own `ErrorBoundary` + `Suspense` since it doesn't need the other guards.

### RouteTitleSync

A component rendered at the root route level that uses `useMatches()` from React Router to find the deepest matched route with a `handle.title` property, then sets `document.title` to that value. Routes without a `handle.title` keep `document.title` as `APP_NAME` ("DELO SYSTEM").

### Sidebar & Navigation Model

Navigation is defined as module objects in each domain's `navigation.jsx`:

```js
{
  id: "qms",
  label: "Quản lý hàng đợi",       // Sidebar section header
  shortLabel: "QMS",               // Abbreviated label
  alwaysVisible: false,            // If true, always shown regardless of domainActive
  colorClass: "text-emerald-700 bg-emerald-100",
  dotColor: "bg-emerald-500",
  items: [                         // Nav links within this domain
    { label, path, icon },
  ],
}
```

Modules are aggregated in `src/core/navigation/domainModules.jsx` and rendered by the `Sidebar` component. Visibility is controlled by `AuthProvider`'s hardcoded `domainActive` array (`["qms", "lookup", "evaluation", "qna"]`) — only modules whose `id` is included (or `alwaysVisible: true`) are shown. The Redux `domainSlice` has a matching initial state and a `setDomainActive` reducer, but `AuthProvider` does not currently use it. To support dynamic sidebar visibility from an API response, wire `setDomainActive()` dispatching into `AuthProvider`.

**SidebarProvider** manages responsive sidebar state: `isExpanded` (desktop toggle), `isMobileOpen` (mobile overlay), `isHovered` (expand-on-hover for collapsed sidebar), `openSubmenu` (submenu accordion). Uses a `1024px` breakpoint to distinguish mobile vs desktop.

### Auth & Authorization

- **AuthProvider** manages: token, user, selectedOrg, domainActive, loading state
- On mount, reads token from localStorage and fetches current user via `useLazyGetCurrentUserQuery` (only if token exists)
- **HMR safety:** The `triggerGetCurrentUser` ref is stabilized with `useRef` to prevent the init effect from re-running when HMR replaces the RTK Query service. A `called` flag guard ensures the init function runs only once even under React StrictMode double-invocation.
- **Error resilience:** If `getCurrentUser` fails (network glitch, HMR timing, server restart), the catch block only logs the error — it does **not** clear the token or user state. Token refresh is handled by the Axios response interceptor, not by AuthProvider.
- `domainActive` is currently hardcoded as `["qms", "lookup", "evaluation", "qna"]` in `AuthProvider.jsx` (the Redux `domainSlice` has `setDomainActive` but it is not dispatched by `AuthProvider` — update both if dynamic domain activation is needed).
- **saveToken** accepts either a string or an object with `accessToken`/`access_token` and `refreshToken`/`refresh_token` properties
- **saveSelectedOrg** updates org in localStorage AND iterates over ALL registered RTK services to invalidate cache tags (`Area`, `Branch`, `Role`) — this ensures all domain data refreshes when the org changes
- **updateUser** merges a partial object into the current user state
- **logout** clears token, user, and org state
- **useAuth** provides a safe fallback (returns defaults) when used outside `AuthProvider`
- **usePermission** hook checks `user.userPermissions` for specific permission names (superadmin bypass)
- **PermissionGuard** and **RoleGate** route guards exist but currently pass through children without checks (legacy commented-out implementations)
- Tokens: `access_token`, `refresh_token` in localStorage
- Org ID: `org_id` in localStorage, sent as `X-Organization-Id` header

### Translation System

- Uses JSON files under `src/assets/locales/{lang}/` (e.g., `vi/branch.json`, `en/branch.json`)
- Files are auto-loaded via Vite's `import.meta.glob` in `TranslateProvider.jsx`:
  ```js
  const viNamespaceModules = import.meta.glob("@assets/locales/vi/*.json", { eager: true });
  // Each file becomes a namespace keyed by its filename (without .json)
  ```
- The `toNamespaceObject` utility (`src/shared/utils/translateHelper.js`) processes glob results into a nested object. It handles both top-level JSON objects and objects with a single wrapper key matching the namespace name
- `getNamespaceNameFromPath` extracts the namespace name from a file path (e.g., `../vi/branch.json` → `branch`)
- Each JSON file is a namespace (its filename without extension becomes the top-level key)
- Accessed via dot-notation: `translate("common.button.save")` — resolves by splitting on `.` and walking the nested object
- `translateWithParams(translate, key, params)` supports `{param}` replacement via regex:
  ```js
  // Translation: "Are you sure you want to delete {name}?"
  translateWithParams(translate, "common.confirm.delete", { name: "Counter #1" })
  ```
- **Default language is Vietnamese** (`vi`)
- `translate()` falls back to the key itself if the lookup path doesn't exist
- Language is toggled via a `Select` in the Header (VI/EN), stored in localStorage(`delo_language`)

### Shared Hooks & Components

- **`useModal`** (`src/core/hooks/useModal.js`) — Manages modal open/close state and carries optional record data
- **`useTable`** (`src/core/hooks/useTable.js`) — Manages pagination, filters, sorters, searchTerm; auto-resets on `resetKey` change. Typically used with `buildParams()` from `queryHelper.js` to construct API query parameters from Ant Design Table state
- **`useSelect`** (`src/core/hooks/useSelect.js`) — Manages infinite-scroll select options (dedup, load-more, reset)
- **`usePermission`** (`src/core/hooks/usePermission.js`) — Checks `user.userPermissions` for a given permission name (superadmin bypass)
- **`ModalShared`** (`src/shared/components/ModalShared.jsx`) — Wraps Ant Design `Modal` with permission-aware save button, `forceRender` enabled (do not remove — ensures Form instances mount even when closed), and translated OK/Cancel buttons
- **`SelectShared`** (`src/shared/components/SelectShared.jsx`) — Reusable async select with infinite scroll, debounced search, default-value preload via `fetchItemById`, extra options (e.g., current user as org option in Header), and `resetKey` for external reset
- **`TableShared`** (`src/shared/components/TableShared.jsx`) — Wraps Ant Design `Table` with: shimmer loading skeleton, search toolbar, custom empty state, stable loading timer to prevent flicker. Props: `search = { useSearch, hint, handleSearch }`, `topLeftComponent`, `topRightComponent`, standard Ant Table props
- **`DeleteButton`** (`src/shared/components/DeleteButton.jsx`) — Ant Design danger button inside a `Popconfirm` with translated confirmation text
- **`EditButton`** (`src/shared/components/EditButton.jsx`) — Ant Design edit icon button
- **`buildParams`** (`src/shared/utils/queryHelper.js`) — Builds API query params from pagination/filters/sort state. Converts nested filter objects to dot-notation (e.g., `{ branch: { id: 5 } }` → `{ "branch.id": 5 }`). Call signature: `buildParams({ keyword, search, sort, order, filters, pagination })`. Pagination is converted to `offset`/`limit` (not page-based)
- **`eventBus`** (`src/shared/utils/eventBus.js`) — Lightweight event emitter built on [mitt](https://github.com/developit/mitt), used for cross-component communication without Redux/context. Usage: `import { eventBus } from "@shared/utils/eventBus"; eventBus.emit("event-name", payload); eventBus.on("event-name", handler);`
- **`toVNTime` / `isTodayVN`** (`src/shared/utils/formatTime.js`) — Timezone-aware helpers for Vietnamese time (UTC+7)

### Path Aliases

Import paths use aliases defined in `vite.config.js` and `jsconfig.json`:

- `@shared/*` → `src/shared/*`
- `@domains/system` → `src/domains/system/index.js`
- `@domains/qms` → `src/domains/qms/index.js`
- `@domains/qna` → `src/domains/qna/index.js`
- `@domains/evaluation` → `src/domains/evaluation/index.js`
- `@domains/lookup` → `src/domains/lookup/index.js`
- `@domains/auth` → `src/domains/auth/index.js`
- `@assets/*` → `src/assets/*`
- `@core/*` → `src/core/*`

Always use these aliases instead of relative paths for cross-domain imports.

### Tailwind CSS Theme

The project uses Tailwind CSS v4 with an extensive custom theme defined in `src/index.css` via the `@theme` directive:

- **Custom color palette:** brand (blue-based), blue-light, gray, orange, success (green), error (red), warning (amber), theme-pink, theme-purple
- **Custom breakpoints:** 2xsm (375px), xsm (425px), 3xl (2000px), plus standard sm through 2xl
- **Custom font:** `Be Vietnam Pro, sans-serif` (disables Tailwind defaults)
- **Custom text sizes:** `text-title-2xl` (72px) through `text-theme-xs` (12px)
- **Custom CSS utilities:** `menu-item`, `menu-item-active`, `menu-dropdown-item`, `no-scrollbar`, `custom-scrollbar`
- Use Tailwind utility classes and these custom utilities for all styling

## Environment Configuration

Environment variables are prefixed with `VITE_` and accessed via `import.meta.env`:

- `VITE_BASE_URL` — API base URL (defaults to `http://localhost:8080`)

Environment files:
- `.env.development` — Development environment (used by `npm run dev`): `VITE_BASE_URL=http://localhost:3000/api`
- `.env.production` — Production environment: `VITE_BASE_URL=http://localhost:3000/api`

## Adding a New Feature

To add a new feature to an existing domain:

1. **Create feature directory**: `src/domains/{domain}/features/{feature}/`
2. **Create service**: Define RTK Query endpoints in `services/{feature}Service.js`
3. **Create hooks**: Custom hooks in `hooks/` (often wrapping RTK Query hooks)
4. **Create components**: UI components in `components/`
5. **Create page**: Main page component in `pages/`
6. **Export from feature**: Export from `features/{feature}/index.js`
7. **Export from domain**: Export from `domains/{domain}/index.js`
8. **Register service**: Add to `src/core/services/allRTKServices.js`
9. **Add route**: Add to `domains/{domain}/routes.jsx`
10. **Add navigation**: Add to `domains/{domain}/navigation.jsx` if needed

## Adding a New Domain

To add a completely new domain:

1. **Create domain directory**: `src/domains/{domain}/`
2. **Create structure**: Follow the domain structure pattern above
3. **Create exports**: Create `index.js`, `routes.jsx`, `navigation.jsx`
4. **Add path alias**: Add to `vite.config.js` resolve.alias AND `jsconfig.json` compilerOptions.paths
5. **Add path constants**: Add to `src/shared/constants/systemConstants.js`
6. **Register routes**: Import and add to `src/core/routes/router.jsx`
7. **Register navigation**: Import and add to `src/core/navigation/domainModules.jsx`
8. **Register services**: Add domain services to `src/core/services/allRTKServices.js`

## Important Notes

- **React Compiler** is configured via `@vitejs/plugin-react`'s `babel` option (not `@rolldown/plugin-babel`). It is **production-only** (`process.env.NODE_ENV === "production"`) to avoid conflicts with React Refresh (HMR) during development. The `babel-plugin-react-compiler` plugin is used directly.
- **HMR note:** If you experience sidebar domains disappearing or page stuck on "Loading..." after saving a file, this is typically caused by React Compiler conflicting with React Refresh during HMR. The fix is to ensure the compiler runs only in production (see `vite.config.js`).
- **All routes require authentication** by default (via ProtectedRoute)
- **Some routes require org selection** (controlled by `requireOrg` flag on the route definition)
- **The application uses Vietnamese by default** — translation JSON files are in `src/assets/locales/`
- **No test framework** is currently configured in the project
- **Code style:** functional components with hooks, Ant Design + Tailwind CSS, camelCase variables/functions, PascalCase components
- **ESLint config** is at `eslint.config.js` (flat config format), extending `@eslint/js` recommended + `react-hooks` + `react-refresh`
- **Ant Design's `App` component** wraps the app in `main.jsx` — use `App.useApp()` for `message`, `notification`, `modal` static methods instead of importing them directly
- **`ModalShared` uses `forceRender`** — do not remove it, as it ensures child Form instances are mounted even when the modal is closed, preventing "useForm not connected" warnings
- **Axios timeout** is 15 seconds (configured in `src/core/services/axios.js`)
- **Agent skills** are installed under `.agents/skills/` (4 Vercel skills: composition-patterns, react-best-practices, react-view-transitions, web-design-guidelines). These are referenced by their `/skill-name` in chat commands. The lockfile at `skills-lock.json` pins their versions.
