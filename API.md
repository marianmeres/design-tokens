# API

## Functions

### `generateCssTokens(schema, prefix, mode?)`

Generate CSS token key-value pairs from a single-mode token schema.

**Parameters:**
- `schema` (`TokenSchema`) — Color definitions for intent, role paired, and role single colors
- `prefix` (`string`) — CSS variable prefix (e.g. `"my-"` produces `--my-color-primary`)
- `mode` (`"light" | "dark"`, optional) — Affects auto-derivation direction. Light darkens with black, dark lightens with white. Default: `"light"`

**Returns:** `GeneratedTokens` — Key-value record of token names to CSS values (keys without the `--` prefix)

**Example:**
```typescript
import { generateCssTokens } from "@marianmeres/design-tokens";

const tokens = generateCssTokens(schema.light, "app-", "light");
// { "app-color-primary": "#2563eb", "app-color-primary-hover": "color-mix(...)", ... }
```

---

### `toCssString(tokens, selector?)`

Convert a tokens record to a formatted CSS declaration block, grouped by base color name.

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

### `generateThemeCss(schema, prefix)`

Generate complete CSS for a theme with light mode and optional dark mode.

**Parameters:**
- `schema` (`ThemeSchema`) — Theme with required `light` and optional `dark` token schemas
- `prefix` (`string`) — CSS variable prefix

**Returns:** `string` — Complete CSS with `:root` for light and `:root.dark` for dark mode

**Example:**
```typescript
import { generateThemeCss } from "@marianmeres/design-tokens";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemeCss(zinc, "app-");
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
hexToRgb("fff");     // → [255, 255, 255]
hexToRgb("nope");    // → null
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

*Import from `@marianmeres/design-tokens/reboot`*

Map design tokens to Bootstrap Reboot `--bs-*` CSS variables. Automatically generates `-rgb` triplet companions for hex color values.

**Parameters:**
- `tokens` (`GeneratedTokens`) — Generated token pairs (from `generateCssTokens`)
- `prefix` (`string`) — The same prefix used in `generateCssTokens`

**Returns:** `GeneratedTokens` — Bootstrap bridge variables (`bs-body-bg`, `bs-link-color`, etc.)

---

### `generateThemedCss(schema, prefix)`

*Import from `@marianmeres/design-tokens/reboot`*

Generate complete themed CSS including both design tokens AND the Bootstrap Reboot bridge.

**Parameters:**
- `schema` (`ThemeSchema`) — Theme schema with light and optional dark modes
- `prefix` (`string`) — CSS variable prefix

**Returns:** `string` — Combined CSS with token variables and `--bs-*` bridge variables

**Example:**
```typescript
import { generateThemedCss } from "@marianmeres/design-tokens/reboot";
import { zinc } from "@marianmeres/design-tokens/themes";

const css = generateThemedCss(zinc, "app-");
// → :root { --app-color-primary: ...; --bs-body-bg: ...; --bs-link-color: ...; }
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
            paired: WithRequired<RolePairedKey, ColorPair>;
            single: WithRequired<RoleSingleKey, SingleColor>;
        };
    };
};
```

Single-mode token schema. Intent colors define primary UI actions; role colors define structural UI elements.

---

### `ColorPair`

```typescript
type ColorPair = {
    DEFAULT: string;
    foreground: string;
    hover?: string;
    active?: string;
};
```

Color with a foreground companion. Hover/active are auto-derived when omitted.

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

---

### `RoleSingleKey`

```typescript
type RoleSingleKey = "foreground" | "border" | "input" | "ring";
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

colors.blue[600]   // → "#2563eb"
colors.mauve[500]  // → "#79697b"
colors.white       // → "#ffffff"
```

---

## Bundled Themes

*Import from `@marianmeres/design-tokens/themes`*

42 pre-built `ThemeSchema` definitions, each with light + dark mode:

`blueOrange`, `cyanRed`, `cyanSlate`, `emeraldAmberForest`, `emeraldPink`, `fuchsiaEmerald`, `gray`, `indigoAmber`, `limeFuchsiaNeon`, `mauve`, `mauveLimeElectric`, `mauveTeal`, `mist`, `mistIndigoFjord`, `mistVioletAurora`, `monokaiCyan`, `monokaiGreen`, `monokaiPink`, `olive`, `oliveAmberSafari`, `orangePinkSunset`, `pinkEmerald`, `pinkTeal`, `purpleYellow`, `rainbow`, `redBlue`, `redCyan`, `redSky`, `redSkySlate`, `roseTeal`, `skyAmber`, `slateCyan`, `slateTealOcean`, `stone`, `taupe`, `taupeOliveClay`, `taupeRoseBlush`, `stoneOrangeEarth`, `tealRose`, `violetLime`, `violetRoseDusk`, `zinc`

---

## Pre-built CSS

*npm only — not available on JSR*

All bundled themes are also distributed as pre-built CSS files using the `stuic-` prefix. Import via `@marianmeres/design-tokens/css/{theme-name}.css`.

```typescript
import "@marianmeres/design-tokens/css/mauve-teal.css";
```

Available files: `blue-orange.css`, `cyan-red.css`, `mauve-teal.css`, `mist-indigo-fjord.css`, `taupe-rose-blush.css`, etc. (one per bundled theme)
