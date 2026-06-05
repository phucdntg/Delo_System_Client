---
name: tailwind-ui
description: Tailwind CSS v4 usage — theme configuration, custom utilities, responsive breakpoints, and styling conventions for the Delo System Client
---

# Tailwind UI

## When to use

Use this skill for all styling decisions. The project uses Tailwind CSS v4 (NOT v3 — there is no `tailwind.config.js`). All configuration is via the `@theme` directive in `src/index.css`.

## Key differences from Tailwind v3

- No `tailwind.config.js` — configuration is entirely in `src/index.css` via `@theme`
- Custom utilities use `@utility` directive (e.g., `@utility menu-item { ... }`)
- Use `@import "tailwindcss"` instead of `@tailwind base/components/utilities`

## Theme tokens

Defined in `src/index.css` under `@theme`:

### Custom breakpoints (Tailwind defaults are reset with `--breakpoint-*: initial`)
| Token | Value |
|---|---|
| `2xsm` | 375px |
| `xsm` | 425px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |
| `3xl` | 2000px |

### Custom text sizes
| Token | Size |
|---|---|
| `text-title-2xl` | 72px |
| `text-title-xl` | 60px |
| `text-title-lg` | 48px |
| `text-title-md` | 36px |
| `text-title-sm` | 30px |
| `text-theme-xl` | 20px |
| `text-theme-sm` | 14px |
| `text-theme-xs` | 12px |

### Color palette
Use these semantic color names instead of hardcoding hex:
- `brand-{25-950}` — Primary brand (blue-based)
- `blue-light-{25-950}` — Light blue accent
- `gray-{25-950}` — Neutrals + `gray-dark`
- `orange-{25-950}` — Warning/accent
- `success-{25-950}` — Green
- `error-{25-950}` — Red
- `warning-{25-950}` — Amber
- `theme-pink-500`, `theme-purple-500` — Accent colors

### Font
The `font-outfit` family is the only font (Tailwind defaults disabled): `Be Vietnam Pro, sans-serif`. Use `font-outfit` class.

### Custom shadows
- `shadow-theme-xs`, `shadow-theme-sm`, `shadow-theme-md`, `shadow-theme-lg`, `shadow-theme-xl`
- `shadow-focus-ring`, `shadow-slider-navigation`, `shadow-tooltip`, `shadow-datepicker`

## Custom utilities (defined in `@utility`)

| Utility | Purpose |
|---|---|
| `menu-item` | Sidebar menu item layout |
| `menu-item-active` | Active sidebar item state |
| `menu-item-inactive` | Inactive sidebar item state |
| `menu-item-icon` / `menu-item-icon-active` / `menu-item-icon-inactive` | Sidebar icon variants |
| `menu-dropdown-item` / `menu-dropdown-item-active` / `menu-dropdown-item-inactive` | Dropdown menu item variants |
| `menu-dropdown-badge` / `menu-dropdown-badge-active` / `menu-dropdown-badge-inactive` | Badge variants |
| `no-scrollbar` | Hide scrollbar cross-browser |
| `custom-scrollbar` | Styled thin scrollbar |

## Best practices

- Use Tailwind utility classes for layout, spacing, typography, and colors
- Use the custom utilities (`menu-item`, `no-scrollbar`, etc.) for sidebar and scrollbar styling — don't duplicate these patterns
- Never add inline styles or separate CSS files for layout (custom Ant Design overrides go in `src/styles/`)
- The `@theme` palette is the source of truth — do not add new raw hex colors in components
- Responsive design: use the custom breakpoints with Tailwind's prefix syntax (e.g., `lg:flex`, `2xsm:text-theme-sm`)
