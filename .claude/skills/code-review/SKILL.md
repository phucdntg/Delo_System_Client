---
name: code-review
description: Code review guidelines for the Delo System Client — architecture compliance, import rules, error handling, and performance checks
---

# Code Review

## When to use

Use this skill when reviewing pull requests, diff output, or proposed changes. Focus on correctness, architecture compliance, and project-specific conventions.

## Check each domain

### 1. Architecture & import rules
- Does the change follow domain-driven structure?
- Are imports going through public API barrels (`@domains/{domain}`) rather than internal paths?
- Check for forbidden patterns: `@domains/{domain}/features/*`, `../*/services/*`, `../*/hooks/*`
- If adding a new domain: are aliases added to BOTH `vite.config.js` AND `jsconfig.json`?

### 2. RTK Query correctness
- Does the service follow the standard pattern (`createApi` + `axiosBaseQuery`)?
- Does `reducerPath` match the export variable name?
- Are tag types PascalCase singular nouns?
- Do list queries provide both LIST + individual item tags?
- Do mutations invalidate LIST (and individual if needed)?
- Is the service registered in `allRTKServices.js`?

### 3. Error handling
- Are mutations called with `.unwrap()` to enable catch-block error handling?
- Are `message.success`/`message.error` called via `App.useApp()` not direct `message` import?
- Do try/catch blocks in form submissions distinguish validation errors (`error.errorFields`) from API errors?

### 4. Translation
- Is `translate("domain")` used for domain-specific text?
- Is `translate("common")` used for shared text (buttons, statuses)?
- Are fallback values provided (`translate("evaluation") || {}`)?
- Are translation keys documented in locale JSON files?

### 5. Shared components
- Is `ModalShared` used instead of raw Ant Design `Modal`?
- Is `TableShared` used for list pages?
- Is `useTable()` managing pagination/filter/search state?
- Is `useModal()` managing modal state?
- Is `buildParams()` constructing API query parameters?

### 6. Code style
- Functional components with hooks (no class components)
- camelCase for variables/functions, PascalCase for components
- No barrel file re-exports that create circular dependencies
- No `forwardRef` wrapper for React 19 (it's no longer needed)

### 7. Performance
- React Compiler is production-only — no manual `useMemo`/`useCallback` needed in most cases
- Lazy load page components with `React.lazy()` in routes
- Avoid inline object/function props in Ant Design table columns (use `useCallback` if they trigger re-renders)
- No raw Axios calls in components — use RTK Query hooks

### 8. Checklist for new files
- Which bounded context does it belong to?
- Which feature does it belong to?
- Is it internal (feature-private) or public (exported via feature/domain index)?
- Does it duplicate existing API endpoints or logic?
