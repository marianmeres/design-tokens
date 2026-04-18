# @marianmeres/design-tokens

[![JSR](https://jsr.io/badges/@marianmeres/design-tokens)](https://jsr.io/@marianmeres/design-tokens)
[![License](https://img.shields.io/github/license/marianmeres/design-tokens)](LICENSE)

A standalone CSS custom property generator for design token systems. Takes a structured
color token schema and produces CSS variables for light and dark modes, with automatic
hover/active state derivation using `color-mix()`. Ships an optional Bootstrap Reboot
bridge that maps tokens to `--bs-*` variables. Same mental model as
[@marianmeres/stuic](https://github.com/marianmeres/stuic)'s token system, but
framework-agnostic — no Tailwind dependency.

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
					// Optional extra elevation (all bundled themes include it):
					"surface-1": { DEFAULT: "#d4d4d4", foreground: "#171717" },
				},
				single: {
					foreground: "#171717",
					border: { DEFAULT: "#d4d4d4" },
					input: { DEFAULT: "#ffffff" },
					ring: "color-mix(in srgb, #2563eb 25%, transparent)",
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

Or via bundler import:

```ts
import "@marianmeres/design-tokens/css/mauve-teal.css";
```

## Creating a custom theme

Use the bundled `colors` map (Tailwind palette including v4.2 additions) to avoid looking up hex values:

```ts
import { colors, generateThemeCss } from "@marianmeres/design-tokens";
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
					ring: `color-mix(in srgb, ${colors.blue[600]} 25%, transparent)`,
				},
			},
		},
	},
	// dark: { ... }  // optional
};

const css = generateThemeCss(myTheme, "my-");
```

Hover/active states are auto-derived via `color-mix(in oklch, ...)` when omitted. You can
provide explicit values to override the derivation.

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
	deriveStates: false, // disable color-mix hover/active derivation
	surfaceForegroundContrast: 70, // stronger contrast on surface-{intent}-foreground
	cssLayer: "tokens", // wrap output in @layer tokens { ... }
});
```

## Reboot bridge

Maps design tokens to Bootstrap Reboot's `--bs-*` CSS variables:

```ts
import { generateThemedCss } from "@marianmeres/design-tokens/reboot";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemedCss(zinc, "app-");
// → :root { --app-color-primary: ...; --bs-body-bg: ...; --bs-link-color: ...; }
```

## API

See [API.md](API.md) for the complete API documentation.

## Types

See [src/types.ts](src/types.ts) for the full type definitions (`TokenSchema`,
`ThemeSchema`, `ColorPair`, `ColorValue`, etc.).

## License

[MIT](LICENSE)
