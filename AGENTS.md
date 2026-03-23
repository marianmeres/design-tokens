# @marianmeres/design-tokens — Agent Guide

## Quick Reference
- **Stack**: Deno / TypeScript
- **Run**: `deno task test` | **Watch**: `deno task test:watch`
- **Build (npm)**: `deno task npm:build`
- **Publish**: `deno task publish` (JSR + npm)
- **Format**: `deno fmt` (tabs, 90 chars, indent 4)

## What This Package Does

CSS custom property generator for design token systems. Takes a structured
`ThemeSchema` (light + optional dark mode) and produces CSS `--custom-property`
declarations with automatic hover/active state derivation via `color-mix()`.

Three entry points:
- `.` — core generation functions, types, color palette
- `./reboot` — Bootstrap Reboot `--bs-*` variable bridge
- `./themes` — 31 pre-built theme definitions

## Project Structure

```
/src
  mod.ts              — main entry: re-exports functions, types, colors
  types.ts            — core type definitions (ThemeSchema, TokenSchema, etc.)
  generate.ts         — token generation + CSS output (generateCssTokens, toCssString, generateThemeCss)
  utils.ts            — hex color parsing (hexToRgb, hexToRgbTriplet)
  colors.ts           — complete Tailwind v3 color palette (hex values)
  reboot-bridge.ts    — Bootstrap Reboot --bs-* variable mapping
  /themes
    mod.ts            — re-exports all theme definitions
    *.ts              — individual theme files (default export: ThemeSchema)
/tests                — test files (deno test --allow-read)
/scripts              — npm build script
/theme-preview-builder — HTML preview tool
```

## Public API Surface

### Functions (from `./src/mod.ts`)
| Function | Purpose |
|----------|---------|
| `generateCssTokens(schema, prefix, mode?)` | Generate token key-value pairs from a TokenSchema |
| `toCssString(tokens, selector?)` | Convert tokens to a CSS declaration block |
| `generateThemeCss(schema, prefix)` | Generate complete CSS for light + optional dark mode |
| `hexToRgb(hex)` | Parse hex to `[r, g, b]` tuple |
| `hexToRgbTriplet(hex)` | Convert hex to `"r, g, b"` string |

### Functions (from `./reboot`)
| Function | Purpose |
|----------|---------|
| `generateRebootBridge(tokens, prefix)` | Map tokens to `--bs-*` variables |
| `generateThemedCss(schema, prefix)` | Combined tokens + reboot bridge CSS |

### Key Types
| Type | Purpose |
|------|---------|
| `ThemeSchema` | `{ light: TokenSchema; dark?: TokenSchema }` |
| `TokenSchema` | Intent colors, role paired/single colors |
| `ColorPair` | `{ DEFAULT, foreground, hover?, active? }` |
| `ColorValue` | `{ DEFAULT, hover?, active? }` |
| `SingleColor` | `string \| ColorValue` |
| `GeneratedTokens` | `Record<string, string>` |

### Constants
| Export | Purpose |
|--------|---------|
| `colors` | Complete Tailwind v3 hex palette (`colors.blue[600]`) |

## Critical Conventions

1. All public functions must have JSDoc and explicit return types (Deno/JSR requirement)
2. Token naming: `--{prefix}color-{key}`, `--{prefix}color-{key}-hover`, etc.
3. Hover/active auto-derived via `color-mix(in oklch, ...)` — light darkens with black, dark lightens with white
4. Surface-intent tokens derived via `color-mix(in srgb, ...)` from intent + background
5. Theme files use `export default` with `ThemeSchema` type annotation
6. Formatting: tabs, 90-char line width, 4-space indent width (`deno fmt`)

## Before Making Changes

- [ ] Read existing patterns in similar files
- [ ] Run `deno task test` — all 37 tests must pass
- [ ] Follow `deno fmt` conventions
- [ ] Ensure new exports have JSDoc + explicit return types
