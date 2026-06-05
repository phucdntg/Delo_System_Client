---
name: react-feature-ddd
description: Domain-Driven Design with React — feature structure, public API boundaries, and composition patterns for the Delo System Client
---

# React Feature DDD

## When to use

Use this skill when creating a new feature, adding files to an existing feature, restructuring domains, or when deciding where code belongs. Also use when you need to import functionality from another feature or domain.

## Domain structure

Every feature lives inside a bounded context (domain) under `src/domains/{domain}/features/{feature}/`:

```
src/domains/{domain}/
├── index.js              # Public API — re-exports from features
├── routes.jsx            # Route definitions (flat array of route objects)
├── navigation.jsx        # Sidebar navigation module object
└── features/{feature}/
    ├── index.js          # Feature public API — exports services, hooks, components
    ├── services/         # RTK Query service definitions (one file per entity)
    ├── hooks/            # Custom hooks wrapping RTK Query or business logic
    ├── components/       # Presentational UI components (no pages)
    ├── pages/            # Page components (lazy-loaded via routes, DO NOT export)
    ├── constants/        # Feature-specific constants
    └── utils/            # Feature-private utilities
```

## Key rules

### Public API boundary
- A feature's `index.js` must only export: service hooks/objects, reusable components, reusable hooks/constants intended for other features.
- Pages are **never** exported — they are lazy-loaded via routes only.
- Do NOT export internal implementation details (private utils, sub-components, store slices).

### Import rules
- Inside the same feature: use relative imports freely.
- Cross-feature within same domain: import only via the **domain's public API** (`@domains/{domain}`), never directly into `features/{feature}/internals`.
- Cross-domain: use `@domains/{domain}` aliases — never relative paths across domains.
- Forbidden patterns (enforced by ESLint):
  - `@domains/{domain}/features/*` direct imports
  - `../*/services/*`, `../*/hooks/*`, `../*/store/*` relative cross-feature imports

### Service ownership
- One service file per entity (e.g., `topicService.js`, `actionService.js`).
- If feature A needs entity B's data, import B's service via the domain public API, not by duplicating endpoints.

## Adding a new feature to an existing domain

1. Create `src/domains/{domain}/features/{feature}/` with subdirectories
2. Create service(s) in `services/`
3. Create hooks in `hooks/` (wrapping RTK Query hooks)
4. Create components in `components/`
5. Create page component in `pages/`
6. Export public API from `features/{feature}/index.js`
7. Re-export from `domains/{domain}/index.js`
8. Register service in `src/core/services/allRTKServices.js`
9. Add route in `domains/{domain}/routes.jsx`
10. Add navigation in `domains/{domain}/navigation.jsx` if it needs a sidebar link

## Adding a new domain

1. Create `src/domains/{domain}/` with `index.js`, `routes.jsx`, `navigation.jsx`
2. Add path alias to both `vite.config.js` (resolve.alias) AND `jsconfig.json` (compilerOptions.paths)
3. Add path constants to `src/shared/constants/systemConstants.js`
4. Register routes in `src/core/routes/router.jsx`
5. Register navigation in `src/core/navigation/domainModules.jsx`
6. Add domain services to `src/core/services/allRTKServices.js`
7. Add import restriction patterns to `eslint.config.js` `no-restricted-imports`
