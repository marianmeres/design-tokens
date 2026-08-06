# API

## Functions

### `generateCssTokens(schema, prefix, options?)`

Generate CSS token key-value pairs from a complete single-mode token schema.

The schema must be complete — the generator throws an error naming the offending schema path when a container or required value is missing, or when the output would reference a token it never declares (`colors.role.paired.background` when intent colors are present; `colors.role.single.foreground` when role hover/active states are derived). To override parts of an existing theme, use [`mergeThemeSchema`](#mergethemeschemabase-overrides) instead of passing a partial schema.

**Parameters:**

- `schema` (`TokenSchema`) — Color definitions for intent, role paired, and role single colors
- `prefix` (`string`) — CSS variable prefix. Auto-normalized: `"my"` and `"my-"` are equivalent. `""` produces unprefixed tokens.
- `options` (`GenerateOptions | "light" | "dark"`, optional) — A mode string for quick switching, or an options object. Default: `{}`
  - `mode` (`"light" | "dark"`, optional) — Controls two things: (a) the `surface-{intent}-foreground` contrast mix (toward `black` in light, `white` in dark), and (b) the direction of **intent** hover/active derivation (toward `black` in light, `white` in dark). **Role** hover/active is mode-independent — it always mixes toward `--{prefix}color-foreground`, which itself flips per mode. Default: `"light"`
  - `deriveStates` (`boolean`, optional) — When `false`, missing hover/active fall back to DEFAULT instead of being derived via `color-mix()` — i.e. flat tokens with no visual state change. This is a _design_ knob, **not** a compatibility one: it does not remove `color-mix()` from the output, because `surface-{intent}` tokens are derived regardless and author-supplied `color-mix()` values pass through verbatim. Use `fallback` for that. Default: `true`
  - `fallback` (`TokenFallback`, optional) — `"static"` evaluates statically resolvable `color-mix()` expressions at build time and emits literal colors; expressions whose operands cannot be resolved at build time (e.g. author-supplied `var()` refs to variables declared elsewhere) pass through unchanged. `"none"` emits them as-is. Default: `"none"`
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
  - `fallback` (`ThemeFallback`, optional) — How to serve engines without `color-mix()` (Chrome/Edge < 111, Safari < 16.2, Firefox < 113). `"supports"` emits normal output plus a trailing `@supports not (color: color-mix(in oklab, red, blue))` block holding precomputed literals; `"static"` precomputes everything and emits no `color-mix()` at all; `"none"` is the raw output. Default: `"supports"`
  - `cssLayer` (`string`, optional) — Wrap the output in `@layer {name} { ... }`. Useful for CSS cascade control. Note `@layer` itself needs Chrome 99+, Safari 15.4+, Firefox 97+.
  - `prettierIgnore` (`boolean`, optional) — Prepend a `/* prettier-ignore */` comment so Prettier preserves the generated whitespace alignment when the output is written to a file that later gets formatted. Default: `false`.

**Returns:** `string` — Complete CSS with `:root` for light and `:root.dark` for dark mode, a trailing `@supports not (...)` fallback block unless disabled, optionally wrapped in `@layer`.

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

### `mergeThemeSchema(base, overrides)`

Merge sparse overrides over a complete base theme, returning a new complete `ThemeSchema` — the supported way to express "bundled theme X, but primary is indigo". The base is never mutated; an absent or empty override mode yields the base mode unchanged.

The merge recurses through the containers (`light`/`dark` → `colors` → `intent`/`role` → `paired`/`single`) and **replaces whole entries** — an overridden `ColorPair` or `SingleColor` supersedes the base entry entirely, never merges into it, so a changed `DEFAULT` cannot silently inherit a stale explicit `hover` or a `foreground` that no longer contrasts. To keep parts of a base entry, spread it yourself: `{ ...base.light.colors.intent.primary, DEFAULT: "#4f46e5" }`.

**Parameters:**

- `base` (`ThemeSchema`) — A complete theme, e.g. a bundled theme from `./themes`
- `overrides` (`ThemeSchemaOverrides`) — Sparse overrides. Keys must already exist in the base (typo protection — a key the base does not have throws instead of minting junk tokens); non-empty `dark` overrides require the base to have a dark mode (an empty `dark: {}` is a no-op against any base). To change the key set, author it on the base schema object.

**Returns:** `ThemeSchema` — A new complete theme, ready for `generateThemeCss`

**Example:**

```typescript
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

### `rgba(color, alpha)`

Build an `rgba()` string from a color and an alpha value — the `color-mix()`-free way to write a translucent tint in a schema.

Exactly equivalent to `color-mix(in srgb, <color> <alpha*100>%, transparent)`: mixing with `transparent` interpolates premultiplied, so only alpha changes. Unlike the `color-mix()` form it carries no browser requirement.

**Parameters:**

- `color` (`string`) — Any color `parseColor` understands
- `alpha` (`number`) — Alpha in `0..1`

**Returns:** `string` — `rgba(r, g, b, a)`, or `#rrggbb` when the result is opaque

**Throws:** `TypeError` if `color` cannot be parsed

**Example:**

```typescript
import { colors, rgba } from "@marianmeres/design-tokens";

rgba(colors.blue[600], 0.25); // → "rgba(37, 99, 235, 0.25)"
```

---

### `parseColor(value)`

Parse a CSS color into an `Rgba`. Supports hex (3/4/6/8 digit), `rgb()`/`rgba()`, `hsl()`/`hsla()`, `oklab()`, `oklch()`, and the basic color keywords, in both legacy comma and modern space/slash syntax.

Values that depend on inherited or computed state (`currentColor`, `var()`, system colors) return `null` — they are not statically resolvable.

**Returns:** `Rgba | null`

---

### `formatColor(color)`

Serialize an `Rgba` to the most compatible CSS form: `#rrggbb` when opaque, legacy `rgba(r, g, b, a)` otherwise. Out-of-gamut components are clamped.

**Returns:** `string`

---

### `mixColors(space, c1, p1, c2, p2)`

Mix two colors the way `color-mix()` does, following CSS Color 5 percentage normalization (an omitted percentage is `100 - other`; both omitted is 50/50; a sum below 100 scales the result alpha) and premultiplied-alpha interpolation.

**Parameters:**

- `space` (`MixSpace`) — `"srgb"`, `"srgb-linear"`, or `"oklab"`
- `c1`, `c2` (`Rgba`) — The colors
- `p1`, `p2` (`number | null`) — Percentages `0..100`, or `null` when omitted

**Returns:** `Rgba | null` — `null` when both percentages are zero (invalid per spec)

---

### `evaluateColorExpression(expr, lookup?)`

Evaluate a CSS color expression to a literal color, resolving `var()` references through `lookup` and computing nested `color-mix()` calls.

Returns `null` when any operand is not statically resolvable — an undefined variable with no fallback, an unsupported interpolation space (`oklch`, `hsl`, `lab`, …), `currentColor`, or a reference cycle. Treat `null` as "leave the original expression alone": approximating a mix that isn't modelled exactly would be worse than omitting the fallback.

**Parameters:**

- `expr` (`string`) — e.g. `color-mix(in oklab, var(--x), black 10%)`
- `lookup` (`VarLookup`, optional) — Resolves custom property names (without `--`) to their declared values

**Returns:** `Rgba | null`

**Example:**

```typescript
import { evaluateColorExpression, formatColor } from "@marianmeres/design-tokens";

const tokens: Record<string, string> = { "app-color-primary": "#27272a" };
const c = evaluateColorExpression(
	"color-mix(in oklab, var(--app-color-primary), black 10%)",
	(name) => tokens[name],
);
formatColor(c!); // → "#202023"
```

---

### `resolveStaticTokens(tokens)`

Evaluate every `color-mix()` expression in a token record at build time, returning a record of the same shape with literal colors in their place.

Only values containing `color-mix()` are rewritten — plain `var()` indirection is preserved, since it needs no fallback and flattening it would defeat the Reboot bridge. Values whose operands cannot be resolved statically pass through unchanged.

**Returns:** `GeneratedTokens`

---

### `resolveStaticOverrides(tokens)`

The subset of `tokens` whose `color-mix()` values could be precomputed, mapped to their literal equivalents. Tokens without `color-mix()`, and those whose operands are not statically resolvable, are absent.

Useful on its own to audit which tokens carry a `color-mix()` browser requirement, and which of those the generator can cover.

**Returns:** `GeneratedTokens`

**Example:**

```typescript
import { generateCssTokens, resolveStaticOverrides } from "@marianmeres/design-tokens";
import { zinc } from "@marianmeres/design-tokens/themes";

const tokens = generateCssTokens(zinc.light, "app-");
Object.keys(resolveStaticOverrides(tokens)); // every token needing color-mix support
```

---

### `staticFallbackCss(entries)`

Build the `@supports not (color: color-mix(in oklab, red, blue))` block holding precomputed literals for every `color-mix()`-valued token in `entries`. Emit it _after_ the blocks it backs up — `@supports` adds no specificity, so source order is what makes it win.

**Parameters:**

- `entries` (`{ selector: string; tokens: GeneratedTokens }[]`) — Selector / token-record pairs, in the order they are emitted

**Returns:** `string | null` — The CSS block, or `null` when nothing needs a fallback

---

### `generateRebootBridge(tokens, prefix)`

_Import from `@marianmeres/design-tokens/reboot`_

Map design tokens to Bootstrap Reboot `--bs-*` CSS variables. Automatically generates `-rgb` triplet companions for hex color values.

Bootstrap derives alpha variants via `rgba(var(--bs-foo-rgb), α)`, which needs a raw `r, g, b` triplet rather than a `var()` reference — so companions are omitted for tokens whose value is a `color-mix()` expression. Generating the tokens with `fallback: "static"` makes every value a literal and closes that gap.

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
- `options` (`Omit<GenerateThemeOptions, "cssLayer">`, optional) — Forwarded to `generateCssTokens` for each mode (see `generateCssTokens`). `fallback` defaults to `"supports"`, as in `generateThemeCss`; `"static"` additionally completes the `--bs-*-rgb` companions.

**Returns:** `string` — Combined CSS with token variables and `--bs-*` bridge variables, plus a trailing `@supports not (...)` fallback block unless disabled

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

Complete single-mode token schema. Intent colors define primary UI actions; role colors define structural UI elements. Arbitrary string keys are allowed on every collection (for custom additions).

Completeness is load-bearing, not ceremonial: the generator derives tokens whose values reference `--{prefix}color-background` (every `surface-{intent}` token) and `--{prefix}color-foreground` (role hover/active derivation), and only `role.paired.background` / `role.single.foreground` declare those. A sparse schema would generate a stylesheet that references tokens it never declares, so the generator rejects it. To override parts of an existing theme, use [`mergeThemeSchema`](#mergethemeschemabase-overrides) with a `ThemeSchemaOverrides`.

---

### `ThemeSchemaOverrides`

```typescript
type ThemeSchemaOverrides = {
	light?: TokenSchemaOverrides;
	dark?: TokenSchemaOverrides;
};
```

Sparse theme overrides for `mergeThemeSchema` — **not** accepted by `generateThemeCss`; merge it over a complete `ThemeSchema` first. An absent or empty mode leaves the base mode unchanged.

---

### `TokenSchemaOverrides`

```typescript
type TokenSchemaOverrides = {
	colors?: {
		intent?: Partial<Record<IntentColorKey, ColorPair>>;
		role?: {
			paired?: Partial<Record<RolePairedKey | RolePairedOptionalKey, ColorPair>>;
			single?: Partial<Record<RoleSingleKey, SingleColor>>;
		};
	};
};
```

Sparse single-mode overrides for `mergeThemeSchema` — **not** accepted by `generateCssTokens`. Deliberately carries no index signatures (unlike `TokenSchema`), so a typo'd key in an override literal is a compile error instead of a silently minted junk token. To introduce a genuinely new key, author it on the base schema object (e.g. `{ ...base.light.colors.intent, info: … }`).

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
	fallback?: TokenFallback;
	surfaceForegroundContrast?: number;
};
```

Options passed to `generateCssTokens`. See the function docs above for field meanings.

---

### `GenerateThemeOptions`

```typescript
type GenerateThemeOptions = Omit<GenerateOptions, "mode" | "fallback"> & {
	fallback?: ThemeFallback;
	cssLayer?: string;
	prettierIgnore?: boolean;
};
```

Options passed to `generateThemeCss`. Omits `mode` (set automatically per section), widens `fallback` to include `"supports"`, and adds `cssLayer` for optional `@layer` wrapping plus `prettierIgnore` to prepend a `/* prettier-ignore */` pragma for build pipelines that pass the output through Prettier.

---

### `TokenFallback`

```typescript
type TokenFallback = "none" | "static";
```

Legacy-engine strategy for a token _record_. `"none"` emits `color-mix()` expressions as-is; `"static"` evaluates statically resolvable ones at build time so the record contains literal colors — expressions whose operands cannot be resolved at build time pass through unchanged.

---

### `ThemeFallback`

```typescript
type ThemeFallback = TokenFallback | "supports";
```

Legacy-engine strategy for a _stylesheet_. Adds `"supports"`: emit the `color-mix()` values normally, then repeat the affected tokens as precomputed literals inside `@supports not (color: color-mix(in oklab, red, blue))`. Modern engines are unaffected — the base block is byte-for-byte identical to `"none"` — while older ones get working colors.

The guard is a _negated declaration test_ on purpose. A bare `@supports (color-mix(...))` is the `<general-enclosed>` production, which the spec requires to evaluate to false in every browser, so it would hand the fallback to modern engines too.

---

### `Rgba`

```typescript
type Rgba = { r: number; g: number; b: number; a: number };
```

A color with red/green/blue components in `0..1` (gamma-encoded sRGB) and alpha in `0..1`.

---

### `MixSpace`

```typescript
type MixSpace = "srgb" | "srgb-linear" | "oklab";
```

Interpolation color spaces understood by `mixColors`. Deliberately narrow — these are the spaces the generator emits. Author-supplied `color-mix()` in any other space (`oklch`, `hsl`, `lab`, …) is left unevaluated rather than approximated.

---

### `VarLookup`

```typescript
type VarLookup = (name: string) => string | undefined;
```

Resolves a custom property name (without the leading `--`) to its declared value.

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

Optional paired role keys. Conventional but not required — all bundled themes define `surface-1` as an additional elevation layer. It also serves as the correct **hairline/divider color for content drawn _on_ a `surface`**: it sits one curated step from `surface` in both light and dark, so it always contrasts — unlike `border`, which is calibrated against the page background and can equal a surface step in dark mode. Additional arbitrary string keys are also allowed.

---

### `RoleSingleKey`

```typescript
type RoleSingleKey = "foreground" | "border" | "input" | "ring";
```

Required single-value role keys.

> **`border` is calibrated against the page background / muted layer** (≈ background + one step) and is hand-tuned per theme. It may deliberately coincide with a `surface` step — in several dark themes `border` and `surface` are the same neutral — so it is **not** a reliable divider when drawn _on top of_ a `surface`. Use `border` to outline a card _against_ the page; use [`surface-1`](#rolepairedoptionalkey) for a hairline/divider _on_ a surface. (Note: `surface-{intent}-border` is a separate generated token — the _outer_ edge of an intent-tinted surface seen against the background, not an on-surface divider.)

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

50 pre-built `ThemeSchema` definitions, each with light + dark mode:

`amberOliveSafari`, `blueOrange`, `cyanRed`, `cyanSlate`, `disco`, `electricLemonade`, `emeraldAmberForest`, `emeraldPink`, `fuchsiaEmerald`, `gray`, `hummingbird`, `indigoAmber`, `limeFuchsiaNeon`, `mauve`, `mauveLimeElectric`, `mauveTeal`, `mist`, `mistIndigoFjord`, `mistVioletAurora`, `monokaiCyan`, `monokaiGreen`, `monokaiPink`, `nebula`, `olive`, `oliveAmberSafari`, `orangePinkSunset`, `peacock`, `pinkEmerald`, `pinkTeal`, `purpleYellow`, `rainbow`, `redBlue`, `redCyan`, `redSky`, `redSkySlate`, `roseTeal`, `skyAmber`, `slateCyan`, `slateTealOcean`, `stone`, `stoneOrangeEarth`, `taupe`, `taupeOliveClay`, `taupeRoseBlush`, `tealRose`, `velvet`, `violetLime`, `violetRoseDusk`, `watermelon`, `zinc`

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
