## RULES - DELO SYSTEM

## ARCHITECTURE: Domain Driven Design + Feature-Based Structure

1. Project layout

- `src/`
  - `domains/` — Bounded Contexts (BC). Each BC is independent and exposes a single public API via `index.js`.
  - `shared/` — UI components, utils, constants used across BCs. No business logic here.
  - `core/` — app providers, store, hooks, services used to bootstrap the app.
  - `assets/` — images, locales, static files.

2. Bounded Contexts (BC)

- Each BC is a top-level folder under `domains/` (e.g. `system`, `qms`, `auth`).
- BC must have `index.js` that re-exports public APIs from its features.
- Do NOT import internal files of another BC directly.

3. Features inside a BC

- Path: `domains/<bc>/features/<feature>/`
- Required structure (recommended):
  - `components/` — presentational components (no pages)
  - `hooks/` — feature-specific hooks
  - `pages/` — internal pages (DO NOT export)
  - `services/` — API (one entity per service file)
  - `store/` — internal state (DO NOT export)
  - `constants/`, `utils/`
  - `index.js` — public API of the feature (only exports intended public items)

4. Public API rules

- A feature `index.js` should only export:
  - service hooks / service objects (e.g. RTK hooks)
  - reusable components (not pages)
  - reusable hooks/constants intended for others
- BC `index.js` aggregates exports from features.

5. Import rules (enforced by ESLint)

- Allowed:
  - Import internal files inside same feature via relative paths.
  - Import from `@shared/*` and from a BC via `@domains/<bc>` only.
  - Import `@core/*` and `@assets/*` for core/providers/assets.
- Forbidden:
  - Importing `@domains/<bc>/features/<feature>/...` internals.
  - Duplicating service/API calls that already exist in other BCs.

6. Aliases (Vite)

- `@shared` -> `/src/shared`
- `@domains/system` -> `/src/domains/system/index.js` (similarly for other BCs)
- `@core` -> `/src/core`
- `@assets` -> `/src/assets`

7. Services

- One service file per entity (SV-01).
- If feature A needs entity B, import B's service via BC public API.
- No duplicated endpoints across files.

8. Shared

- `shared/components` must be stateless UI (no business logic).
- `shared/utils` contains utilities used across BCs. Feature-private utils stay under feature `utils/`.

9. Routes

- Feature-level `routes.jsx` should export an array of route objects.
- BC `routes.jsx` aggregates feature routes and exports a flat routes array.

10. Linting & enforcement

- `eslint.config.js` includes `no-restricted-imports` to block internal imports.
- Always run `npm run lint` before creating a PR.

11. Checklist before creating a file

- Which BC does this file belong to?
- Which feature does it belong to?
- Internal or public? If public — added to `feature/index.js` and `bc/index.js` if cross-BC.
- Does this duplicate existing logic? If yes, reuse the existing API.

12. Recommended process additions (long-term)

- Add CI to run `lint` and `build` on PRs.
- Add unit tests for `shared/utils` and services.
- Use TS gradually for shared/core code.

---

Follow this file as a minimal checklist in PR descriptions and code reviews.
