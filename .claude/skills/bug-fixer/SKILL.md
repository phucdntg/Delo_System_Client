---
name: bug-fixer
description: Systematic debugging approach for the Delo System Client — common failure patterns, diagnostic steps, and fix strategies
---

# Bug Fixer

## When to use

Use this skill when investigating runtime errors, UI bugs, data inconsistencies, or build failures in the Delo System Client.

## Systematic debugging approach

### 1. Classify the bug

| Category | Symptoms | Likely cause |
|---|---|---|
| **Auth/401** | Redirect to login, blank page, API returning 401 | Expired token, refresh failure, org context missing |
| **Stale data** | List doesn't update after mutation | Missing `invalidatesTags` or wrong tag type in RTK Query service |
| **HMR crash** | "Loading..." stuck, sidebar domains disappear | React Compiler running in dev mode (should be production-only) |
| **Form issues** | Validation fails silently, form won't submit, stale initial values | `ModalShared.forceRender` removed, `useLayoutEffect` cleanup missing |
| **Route issues** | 404, wrong page, blank route | Missing route registration in `router.jsx`, wrong `PATH` constant |
| **Import errors** | ESLint error, module not found | Violation of `no-restricted-imports`, alias not in `jsconfig.json` |
| **Translation missing** | Keys shown instead of text | Missing locale JSON entry, wrong namespace/dot-path |
| **Table empty** | "No data" when data exists | Wrong `dataSource` path (`data?.data` vs `data`), pagination mismatch |

### 2. Check the obvious first

- **Console errors?** Check browser DevTools console
- **Network tab?** Check the API response status, payload, and whether the request was sent with correct headers
- **Is the service registered?** Check `allRTKServices.js`
- **Is the route registered?** Check `router.jsx` has the domain route group
- **Is the import path correct?** Use the `@domains/{domain}` alias, not internal paths

### 3. Common RTK Query bugs

**"Data not refreshing after mutation"**
- Check `invalidatesTags` on the mutation — does it include `{ type: "X", id: "LIST" }`?
- Check the list query's `providesTags` — does it return individual item tags?
- Verify the tag type string matches exactly (case-sensitive) between query and mutation

**"Query returns stale data after org switch"**
- Check if the service's LIST tag is in the org-change invalidation list in `AuthProvider.jsx`

**"useLazyQuery not triggering"**
- The lazy query returns `[trigger, results]` — make sure `trigger` is being called, not just destructured

### 4. Common HMR / build bugs

**"Stuck on Loading... after save"**
→ React Compiler is conflicting with React Refresh. Ensure it's production-only in `vite.config.js`:
```js
babel: process.env.NODE_ENV === "production"
  ? { plugins: [["babel-plugin-react-compiler", {}]] }
  : undefined,
```

**"Build fails with import error"**
→ Check `no-restricted-imports` in `eslint.config.js`. If the import is valid, you may need to add the domain pattern to the allowed list.

### 5. Common form bugs

**"Modal form shows stale data from previous edit"**
→ The modal must be conditionally mounted: `{open && <Modal />}`. This ensures `useLayoutEffect` runs fresh each time. Check `form.resetFields()` in the cleanup function.

**"Form validation errors not showing"**
→ In `handleOk`, catch block should check `if (error?.errorFields) return;` to avoid treating Ant Design validation errors as API errors.

### 6. Data flow debugging

Trace the data flow for any UI issue:
1. **API call** → check Network tab for request/response
2. **RTK Query cache** → check Redux DevTools for the service's cache state
3. **Component** → check if the hook is receiving data (`data?.data`)
4. **Render** → check column definitions match data shape

### 7. Translation debugging

If keys show instead of translated text:
- Check `src/assets/locales/{lang}/{namespace}.json` for the key
- Verify the namespace filename matches the first segment of the dot-path
- Check that the JSON file either wraps in `{ namespace: { ... } }` or is top-level

### 8. Quick fix reference

| Bug | Fix |
|---|---|
| Sidebar module not showing | Add to `DOMAIN_MODULES` in `domainModules.jsx` |
| Route giving 404 | Add route group in `router.jsx` with `RouteGuard` |
| API not sending org header | Either add `X-Organization-Id` to request or pass `skipOrgId: true` param |
| Infinite re-render | Check for missing deps in `useCallback`/`useEffect` or inline objects in context values |
| Wrong document title | Add `handle: { title }` to the route definition |
