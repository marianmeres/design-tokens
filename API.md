# API

## Functions

### `generateCssTokens(schema, prefix, options?)`

Generate CSS token key-value pairs from a single-mode token schema.

**Parameters:**

- `schema` (`TokenSchema`) — Color definitions for intent, role paired, and role single colors
- `prefix` (`string`) — CSS variable prefix. Auto-normalized: `"my"` and `"my-"` are equivalent. `""` produces unprefixed tokens.
- `options` (`GenerateOptions | "light" | "dark"`, optional) — A mode string for quick switching, or an options object. Default: `{}`
  - `mode` (`"light" | "dark"`, optional) — Affects auto-derivation direction. Light darkens with black, dark lightens with white. Default: `"light"`
  - `deriveStates` (`boolean`, optional) — When `false`, missing hover/active fall back to DEFAULT instead of being derived via `color-mix()`. Useful for environments without `color-mix()` support. Default: `true`
  - `surfaceForegroundContrast` (`number`, optional) — Mix percentage (0–100) used to derive the `surface-{intent}-foreground` token. Higher values increase contrast against the tinted surface background. Default: `50`

**Returns:** `GeneratedTokens` — Key-value record of token names to CSS values (keys without the `--` prefix)

**Example:**

```typescript
import { generateCssTokens } from "@marianmeres/design-tokens";

// Shorthand mode string
const tokens = generateCssTokens(schema.light, "app-", "dark");

// Full options object
const flat = generateCssTokens(schema.light, "app", {
	mode: "light",
	deriveStates: false,
	surfaceForegroundContrast: 70,
});
// { "app-color-primary": "#2563eb", "app-color-primary-hover": "#2563eb", ... }
```

---

### `toCssString(tokens, selector?)`

Convert a tokens record to a formatted CSS declaration block, grouped by base color name (e.g. all `surface-*` tokens cluster together).

**Parameters:**

- `tokens` (`GeneratedTokens`) — Key-value token pairs (from `generateCssTokens`)
- `selector` (`string`, optional) — CSS selector for the block. Default: `":root"`

**Returns:** `string` — Formatted CSS string

**Example:**

```typescript
import { generateCssTokens, toCssString } from "@marianmeres/design-tokens";

const css = toCssString(tokens, ":root.dark");
// :root.dark {
//     --app-color-primary: #2563eb;
//     ...
// }
```

---

### `generateThemeCss(schema, prefix, options?)`

Generate complete CSS for a theme with light mode and optional dark mode.

**Parameters:**

- `schema` (`ThemeSchema`) — Theme with required `light` and optional `dark` token schemas
- `prefix` (`string`) — CSS variable prefix (trailing dash optional)
- `options` (`GenerateThemeOptions`, optional) — Accepts all `GenerateOptions` (except `mode`, which is set per section) plus:
  - `cssLayer` (`string`, optional) — Wrap the output in `@layer {name} { ... }`. Useful for CSS cascade control.

**Returns:** `string` — Complete CSS with `:root` for light and `:root.dark` for dark mode, optionally wrapped in `@layer`.

**Example:**

```typescript
import { generateThemeCss } from "@marianmeres/design-tokens";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemeCss(zinc, "app-", { cssLayer: "tokens" });
// @layer tokens {
//     :root { ... }
//     :root.dark { ... }
// }
```

---

### `hexToRgb(hex)`

Parse a hex color string to RGB components. Supports 3-digit (`#abc`) and 6-digit (`#aabbcc`) formats, with or without `#` prefix.

**Parameters:**

- `hex` (`string`) — Hex color string

**Returns:** `[number, number, number] | null` — RGB tuple, or `null` if invalid

**Example:**

```typescript
import { hexToRgb } from "@marianmeres/design-tokens";

hexToRgb("#2563eb"); // → [37, 99, 235]
hexToRgb("fff"); // → [255, 255, 255]
hexToRgb("nope"); // → null
```

---

### `hexToRgbTriplet(hex)`

Convert a hex color to an `"r, g, b"` triplet string suitable for CSS `rgb()` usage.

**Parameters:**

- `hex` (`string`) — Hex color string

**Returns:** `string | null` — Comma-separated RGB triplet, or `null` if invalid

**Example:**

```typescript
import { hexToRgbTriplet } from "@marianmeres/design-tokens";

hexToRgbTriplet("#2563eb"); // → "37, 99, 235"
```

---

### `generateRebootBridge(tokens, prefix)`

_Import from `@marianmeres/design-tokens/reboot`_

Map design tokens to Bootstrap Reboot `--bs-*` CSS variables. Automatically generates `-rgb` triplet companions for hex color values.

**Parameters:**

- `tokens` (`GeneratedTokens`) — Generated token pairs (from `generateCssTokens`)
- `prefix` (`string`) — The same prefix used in `generateCssTokens` (trailing dash optional)

**Returns:** `GeneratedTokens` — Bootstrap bridge variables (`bs-body-bg`, `bs-link-color`, etc.)

**Note on `-rgb` companions:** Bootstrap's alpha-blended rules (e.g. `rgba(var(--bs-link-color-rgb), 0.5)`) require raw RGB triplets. This bridge emits `--bs-*-rgb` only when the underlying token resolves to a literal hex color. Auto-derived hover/active tokens are `color-mix()` expressions and cannot produce triplets — the companions are omitted, and Reboot rules that rely on them fall back to defaults. Provide explicit hex `hover` / `active` values on your `ColorPair`s if you need full alpha-blend support.

---

### `generateThemedCss(schema, prefix, options?)`

_Import from `@marianmeres/design-tokens/reboot`_

Generate complete themed CSS including both design tokens AND the Bootstrap Reboot bridge.

**Parameters:**

- `schema` (`ThemeSchema`) — Theme schema with light and optional dark modes
- `prefix` (`string`) — CSS variable prefix (trailing dash optional)
- `options` (`Omit<GenerateThemeOptions, "cssLayer">`, optional) — Forwarded to `generateCssTokens` for each mode (see `generateCssTokens`)

**Returns:** `string` — Combined CSS with token variables and `--bs-*` bridge variables

**Example:**

```typescript
import { generateThemedCss } from "@marianmeres/design-tokens/reboot";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemedCss(zinc, "app-");
// → :root { --app-color-primary: ...; --bs-body-bg: ...; --bs-link-color: ...; }
```

---

### `getBundledTheme(name)`

_Import from `@marianmeres/design-tokens/themes`_

Look up a bundled theme by its camelCase name. Returns `undefined` if the name is not a known theme.

**Parameters:**

- `name` (`string`) — Theme name (camelCase, e.g. `"blueOrange"`)

**Returns:** `ThemeSchema | undefined`

**Example:**

```typescript
import { getBundledTheme } from "@marianmeres/design-tokens/themes";

const theme = getBundledTheme("mauveTeal");
if (theme) { /* use theme */ }
```

---

## Types

### `ThemeSchema`

```typescript
type ThemeSchema = {
	light: TokenSchema;
	dark?: TokenSchema;
};
```

Complete theme definition with required light mode and optional dark mode.

---

### `TokenSchema`

```typescript
type TokenSchema = {
	colors: {
		intent: WithRequired<IntentColorKey, ColorPair>;
		role: {
			paired: WithKnown<RolePairedKey, RolePairedOptionalKey, ColorPair>;
			single: WithRequired<RoleSingleKey, SingleColor>;
		};
	};
};
```

Single-mode token schema. Intent colors define primary UI actions; role colors define structural UI elements. Arbitrary string keys are allowed on every collection (for custom additions).

---

### `ColorPair`

```typescript
type ColorPair = {
	DEFAULT: string;
	foreground: string;
	hover?: string;
	active?: string;
	foregroundHover?: string;
	foregroundActive?: string;
};
```

Color with a foreground companion. Hover/active are auto-derived when omitted. `foregroundHover` and `foregroundActive` default to `foreground` — provide them if your foreground should change on interaction.

---

### `ColorValue`

```typescript
type ColorValue = {
	DEFAULT: string;
	hover?: string;
	active?: string;
};
```

Color with optional pseudo states.

---

### `SingleColor`

```typescript
type SingleColor = string | ColorValue;
```

Either a plain CSS color string or an object with optional hover/active states.

---

### `GenerateOptions`

```typescript
type GenerateOptions = {
	mode?: "light" | "dark";
	deriveStates?: boolean;
	surfaceForegroundContrast?: number;
};
```

Options passed to `generateCssTokens`. See the function docs above for field meanings.

---

### `GenerateThemeOptions`

```typescript
type GenerateThemeOptions = Omit<GenerateOptions, "mode"> & {
	cssLayer?: string;
};
```

Options passed to `generateThemeCss`. Omits `mode` (set automatically per section) and adds `cssLayer` for optional `@layer` wrapping.

---

### `GeneratedTokens`

```typescript
type GeneratedTokens = Record<string, string>;
```

Generated CSS token key-value pairs (keys without the `--` prefix).

---

### `IntentColorKey`

```typescript
type IntentColorKey = "primary" | "accent" | "destructive" | "warning" | "success";
```

---

### `RolePairedKey`

```typescript
type RolePairedKey = "background" | "muted" | "surface";
```

Required paired role keys.

---

### `RolePairedOptionalKey`

```typescript
type RolePairedOptionalKey = "surface-1";
```

Optional paired role keys. Conventional but not required — all bundled themes define `surface-1` as an additional elevation layer. Additional arbitrary string keys are also allowed.

---

### `RoleSingleKey`

```typescript
type RoleSingleKey = "foreground" | "border" | "input" | "ring";
```

---

### `WithRequired` / `WithOptional` / `WithKnown`

Helper types for schema collections:

```typescript
type WithRequired<K extends string, V> =
	& Record<K, V>
	& Record<string, V>;

type WithOptional<K extends string, V> =
	& Partial<Record<K, V>>
	& Record<string, V>;

type WithKnown<Req extends string, Opt extends string, V> =
	& Record<Req, V>
	& Partial<Record<Opt, V>>
	& Record<string, V>;
```

---

## Constants

### `colors`

Tailwind CSS color palette as hex values. Contains `black`, `white`, and 26 color scales each with shades 50–950:

- **Neutrals**: slate, gray, zinc, neutral, stone
- **Earthy/muted (v4.2)**: taupe, mauve, mist, olive
- **Warm**: red, orange, amber, yellow
- **Cool**: lime, green, emerald, teal, cyan, sky, blue, indigo
- **Vibrant**: violet, purple, fuchsia, pink, rose

```typescript
import { colors } from "@marianmeres/design-tokens";

colors.blue[600]; // → "#2563eb"
colors.mauve[500]; // → "#79697b"
colors.white; // → "#ffffff"
```

---

### `bundledThemes`

_Import from `@marianmeres/design-tokens/themes`_

Map of all bundled themes keyed by their camelCase name. Safe to iterate — the non-theme exports (`themeNames`, `ThemeSchema`) are filtered out.

```typescript
import { bundledThemes } from "@marianmeres/design-tokens/themes";

Object.keys(bundledThemes); // → ["amberOliveSafari", "blueOrange", ...]
```

---

### `bundledThemeNames`

_Import from `@marianmeres/design-tokens/themes`_

Array of all bundled theme names (camelCase), discovered at runtime from `bundledThemes`.

---

### `themeNames`

_Import from `@marianmeres/design-tokens/themes`_

Kebab-case theme name strings matching the generated CSS filenames (without extension). Typed as a `readonly` tuple.

```typescript
import { themeNames } from "@marianmeres/design-tokens/themes";

themeNames; // → ["amber-olive-safari", "blue-orange", ..., "zinc"]
```

---

## Bundled Themes

_Import from `@marianmeres/design-tokens/themes`_

43 pre-built `ThemeSchema` definitions, each with light + dark mode:

`amberOliveSafari`, `blueOrange`, `cyanRed`, `cyanSlate`, `emeraldAmberForest`, `emeraldPink`, `fuchsiaEmerald`, `gray`, `indigoAmber`, `limeFuchsiaNeon`, `mauve`, `mauveLimeElectric`, `mauveTeal`, `mist`, `mistIndigoFjord`, `mistVioletAurora`, `monokaiCyan`, `monokaiGreen`, `monokaiPink`, `olive`, `oliveAmberSafari`, `orangePinkSunset`, `pinkEmerald`, `pinkTeal`, `purpleYellow`, `rainbow`, `redBlue`, `redCyan`, `redSky`, `redSkySlate`, `roseTeal`, `skyAmber`, `slateCyan`, `slateTealOcean`, `stone`, `stoneOrangeEarth`, `taupe`, `taupeOliveClay`, `taupeRoseBlush`, `tealRose`, `violetLime`, `violetRoseDusk`, `zinc`

All bundled themes include a `surface-1` paired role (on top of the required `background`, `muted`, `surface`) as a conventional extra elevation.

---

## Pre-built CSS

_npm only — JSR does not support directory exports, so the pre-built CSS files are not available via JSR._

All bundled themes are also distributed as pre-built CSS files. Import via `@marianmeres/design-tokens/css/{theme-name}.css`.

```typescript
import "@marianmeres/design-tokens/css/mauve-teal.css";
```

The default prefix on the published files is `stuic-` (i.e. tokens are named `--stuic-color-primary`, etc.). To regenerate the CSS files locally with a different prefix, set the `CSS_PREFIX` environment variable before running the build:

```bash
CSS_PREFIX=app- deno task css:build
```

Available files: `amber-olive-safari.css`, `blue-orange.css`, `cyan-red.css`, `mauve-teal.css`, `mist-indigo-fjord.css`, `taupe-rose-blush.css`, etc. (one per bundled theme).
