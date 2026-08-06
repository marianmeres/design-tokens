# @marianmeres/design-tokens

[![JSR](https://jsr.io/badges/@marianmeres/design-tokens)](https://jsr.io/@marianmeres/design-tokens)
[![License](https://img.shields.io/github/license/marianmeres/design-tokens)](LICENSE)

A standalone CSS custom property generator for design token systems. Takes a structured
color token schema and produces CSS variables for light and dark modes, with automatic
hover/active state derivation using `color-mix()`. Ships an optional Bootstrap Reboot
bridge that maps tokens to `--bs-*` variables. Same mental model as
[@marianmeres/stuic](https://github.com/marianmeres/stuic)'s token system, but
framework-agnostic — no Tailwind dependency.

## Browser support

Generated themes work everywhere. Derived tokens use `color-mix()`, which needs
**Chrome/Edge 111+, Safari 16.2+, Firefox 113+** (all early-to-mid 2023) — so
`generateThemeCss` also emits a precomputed fallback for older engines by default. See
[Legacy browsers](#legacy-browsers) if you want to change that, and
[Why the fallback matters](#why-the-fallback-matters) for why it is not something a
consumer could patch downstream.

## Install

```sh
deno add jsr:@marianmeres/design-tokens
```

## Usage

```ts
import { generateThemeCss } from "@marianmeres/design-tokens";
import type { ThemeSchema } from "@marianmeres/design-tokens";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: "#2563eb", foreground: "#ffffff" },
				accent: { DEFAULT: "#8b5cf6", foreground: "#ffffff" },
				destructive: { DEFAULT: "#dc2626", foreground: "#ffffff" },
				warning: { DEFAULT: "#f59e0b", foreground: "#000000" },
				success: { DEFAULT: "#16a34a", foreground: "#ffffff" },
			},
			role: {
				paired: {
					background: { DEFAULT: "#ffffff", foreground: "#171717" },
					muted: { DEFAULT: "#f5f5f5", foreground: "#737373" },
					surface: { DEFAULT: "#e5e5e5", foreground: "#171717" },
					// Optional extra elevation (all bundled themes include it).
					// Also the correct hairline/divider color for content drawn
					// *on* a surface — it sits one step from `surface` in both
					// light and dark, so it always contrasts (unlike `border`).
					"surface-1": { DEFAULT: "#d4d4d4", foreground: "#171717" },
				},
				single: {
					foreground: "#171717",
					// Hairline calibrated against the page background / muted
					// layer. It may deliberately coincide with a `surface` step
					// (in several dark themes `border` == `surface`), so use it to
					// outline a card *against* the page — not as a divider drawn
					// *on* a surface. Use `surface-1` for on-surface dividers.
					border: { DEFAULT: "#d4d4d4" },
					input: { DEFAULT: "#ffffff" },
					ring: "rgba(37, 99, 235, 0.25)",
				},
			},
		},
	},
};

// The prefix's trailing dash is optional — "my" and "my-" are equivalent.
const css = generateThemeCss(theme, "my-");
// → :root { --my-color-primary: #2563eb; ... }
```

## Pre-built CSS

All bundled themes are available as pre-built CSS files with the `stuic-` prefix (npm only):

```html
<link rel="stylesheet" href="node_modules/@marianmeres/design-tokens/css/mauve-teal.css">
```

These are built with the default `fallback: "supports"`, so they render correctly on
pre-2023 engines without any work on your side.

Or via bundler import:

```ts
import "@marianmeres/design-tokens/css/mauve-teal.css";
```

## Creating a custom theme

Use the bundled `colors` map (Tailwind palette including v4.2 additions) to avoid looking up hex values:

```ts
import { colors, generateThemeCss, rgba } from "@marianmeres/design-tokens";
import type { ThemeSchema } from "@marianmeres/design-tokens";

const myTheme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.blue[600], foreground: colors.white },
				accent: { DEFAULT: colors.violet[500], foreground: colors.white },
				destructive: { DEFAULT: colors.red[600], foreground: colors.white },
				warning: { DEFAULT: colors.amber[500], foreground: colors.black },
				success: { DEFAULT: colors.emerald[600], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.slate[50],
						foreground: colors.slate[900],
					},
					muted: {
						DEFAULT: colors.slate[100],
						foreground: colors.slate[500],
					},
					surface: {
						DEFAULT: colors.slate[200],
						foreground: colors.slate[900],
					},
					"surface-1": {
						DEFAULT: colors.slate[300],
						foreground: colors.slate[900],
					},
				},
				single: {
					foreground: colors.slate[900],
					border: { DEFAULT: colors.slate[300] },
					input: { DEFAULT: colors.slate[50], hover: colors.slate[100] },
					ring: rgba(colors.blue[600], 0.25),
				},
			},
		},
	},
	// dark: { ... }  // optional
};

const css = generateThemeCss(myTheme, "my-");
```

Hover/active states are auto-derived via `color-mix(in oklab, ...)` when omitted. You can
provide explicit values to override the derivation.

The `rgba()` helper is the `color-mix()`-free way to write a translucent tint. It is
exactly equivalent to `color-mix(in srgb, <color> 25%, transparent)` — mixing with
`transparent` is premultiplied, so only alpha changes — but it needs no modern-browser
support and it keeps your schema free of expressions the generator has to work around.

## Overriding a bundled theme

To tweak an existing theme rather than author a full schema — "amber-olive-safari,
but primary is indigo" — merge sparse overrides over the bundled base with
`mergeThemeSchema` and generate from the merged result:

```ts
import { generateThemeCss, mergeThemeSchema } from "@marianmeres/design-tokens";
import { amberOliveSafari } from "@marianmeres/design-tokens/themes";

const theme = mergeThemeSchema(amberOliveSafari, {
	light: {
		colors: {
			intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
		},
	},
});

const css = generateThemeCss(theme, "app-");
```

An override replaces the whole entry — the base's explicit `hover`/`active`/`foreground`
for that entry are gone, not inherited (they would no longer match your new `DEFAULT`;
omitted states are auto-derived from it instead). To keep parts of the base entry,
spread it yourself: `{ ...amberOliveSafari.light.colors.intent.primary, DEFAULT: "#4f46e5" }`.
An absent or empty mode (`dark: {}`) leaves the base mode untouched, and a key the
base does not have is an error — both in the `ThemeSchemaOverrides` type and at runtime.

Prefer literal color values (hex, or `colors.indigo[600]` from the bundled palette) over
`var()` references in overrides: a value like `var(--color-indigo-600)` cannot be
resolved at build time, so those tokens lose their precomputed legacy-browser fallback.

Do **not** try to override by layering a second generated stylesheet over a base theme's
CSS — a sparse schema is rejected by the generator, and layered output breaks subtly on
engines without `color-mix()` support even when it looks fine on modern ones. Merge the
schemas, generate one stylesheet.

Since the merged output is derived from the installed base, run the generate step as
part of your build (e.g. a `prebuild` hook) rather than committing its output — that
way upstream theme improvements flow in with every dependency update. If you prefer
committing it, add a CI check that regenerating leaves the file unchanged.

## Bundled themes

```ts
import { gray, stone, zinc } from "@marianmeres/design-tokens/themes";
import { generateThemeCss } from "@marianmeres/design-tokens";

const css = generateThemeCss(zinc, "app-");
```

Dynamic lookup via the registry (useful when the theme name comes from config):

```ts
import { bundledThemeNames, getBundledTheme } from "@marianmeres/design-tokens/themes";

const theme = getBundledTheme("mauveTeal");
if (theme) {
	const css = generateThemeCss(theme, "app-");
}
```

### Options

`generateThemeCss` and `generateCssTokens` accept an options object:

```ts
generateThemeCss(zinc, "app-", {
	fallback: "supports", // legacy-browser strategy (default) — see below
	deriveStates: false, // flat hover/active instead of derived states
	surfaceForegroundContrast: 70, // stronger contrast on surface-{intent}-foreground
	cssLayer: "tokens", // wrap output in @layer tokens { ... }
});
```

Note that `deriveStates: false` is a _design_ knob — it makes hover/active flat, but does
not remove `color-mix()` from the output (`surface-{intent}` tokens are derived regardless,
and author-supplied `color-mix()` values pass through). Use `fallback` for that.

## Legacy browsers

`color-mix()` needs Chrome/Edge 111+, Safari 16.2+, Firefox 113+. The `fallback` option
controls what older engines get:

| `fallback`            | Output                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| `"supports"`(default) | Normal output, plus a trailing `@supports not (...)` block with precomputed literals |
| `"static"`            | Every `color-mix()` evaluated at build time — the output contains none at all        |
| `"none"`              | `color-mix()` only; breaks on older engines                                          |

```css
/* fallback: "supports" */
:root {
	--app-color-primary: #27272a;
	--app-color-primary-hover: color-mix(in oklab, var(--app-color-primary), black 10%);
}
@supports not (color: color-mix(in oklab, red, blue)) {
	:root {
		--app-color-primary-hover: #202023;
	}
}
```

`"supports"` is the default because it is purely additive — the `:root` block is
byte-for-byte what `"none"` produces, so modern rendering cannot shift — at a cost of
roughly +28% output size (about +0.6 KB gzipped per theme).

Pick `"static"` if you want the smallest output (it is ~35% _smaller_ than `"none"`, since
hex literals are shorter than mix expressions) and you don't need derived tokens to track
runtime overrides of their base color. It also completes the Reboot bridge's `--bs-*-rgb`
companions, which can't exist while token values are expressions.

Values the generator cannot evaluate at build time — an author-supplied `oklch`/`hsl`
interpolation space, `currentColor`, an undefined variable — are left as-is rather than
approximated, so they are simply absent from the fallback block.

### Why the fallback matters

`color-mix()` in an ordinary declaration is harmless on old browsers: the declaration is
rejected at parse time and an earlier one wins, which is the standard progressive-
enhancement pattern. As a **token value** it behaves differently. Custom properties accept
almost any token sequence, so the declaration parses everywhere and only fails at
substitution — making the _using_ declaration invalid at computed-value time, which
resolves the property to `unset`: transparent for a background, inherited for `color`.

That failure is unreachable from consumer CSS. It happens after the cascade has picked a
winner, so an earlier declaration is not a fallback, and `var(--token, #333)` doesn't fire
either — the property is defined, its value is just unusable. The result is a control that
keeps its size, position, and hit area and simply stops being visible. Hence the fix lives
here rather than in consumer stylesheets.

## Reboot bridge

Maps design tokens to Bootstrap Reboot's `--bs-*` CSS variables:

```ts
import { generateThemedCss } from "@marianmeres/design-tokens/reboot";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemedCss(zinc, "app-");
// → :root { --app-color-primary: ...; --bs-body-bg: ...; --bs-link-color: ...; }
```

Takes the same `fallback` option, defaulting to `"supports"`. Bootstrap derives alpha
variants via `rgba(var(--bs-foo-rgb), α)`, which needs a raw `r, g, b` triplet — so
`--bs-*-rgb` companions are only emitted for tokens that resolve to a literal color. Pass
`fallback: "static"` if you need them all.

## API

See [API.md](API.md) for the complete API documentation.

## Types

See [src/types.ts](src/types.ts) for the full type definitions (`TokenSchema`,
`ThemeSchema`, `ColorPair`, `ColorValue`, etc.).

## License

[MIT](LICENSE)
