/**
 * CSS custom property generator for design token systems.
 *
 * Takes a structured color token schema and produces CSS variables for
 * light and dark modes, with automatic hover/active state derivation
 * using `color-mix()`.
 *
 * @module
 */

/** Generate CSS token key-value pairs from a {@link TokenSchema}. */
export { generateCssTokens } from "./generate.ts";

/** Generate complete CSS for a theme (light + optional dark mode). */
export { generateThemeCss } from "./generate.ts";

/** Convert a tokens record to a CSS declaration block string. */
export { toCssString } from "./generate.ts";

/** Options accepted by {@link generateCssTokens}. */
export type { GenerateOptions } from "./generate.ts";

/** Options accepted by {@link generateThemeCss}. */
export type { GenerateThemeOptions } from "./generate.ts";

/** Base color value with optional hover/active pseudo states. */
export type { ColorPair } from "./types.ts";

/** Color value: a hex string or an object with DEFAULT and optional pseudo states. */
export type { ColorValue } from "./types.ts";

/** Generated CSS token key-value pairs (without the `--` prefix on keys). */
export type { GeneratedTokens } from "./types.ts";

/** Known intent color keys: primary, accent, destructive, warning, success. */
export type { IntentColorKey } from "./types.ts";

/** Known role color keys (paired with foreground, required): background, muted, surface. */
export type { RolePairedKey } from "./types.ts";

/** Known role color keys (paired with foreground, optional): surface-1. */
export type { RolePairedOptionalKey } from "./types.ts";

/** Known role color keys (single value): foreground, border, input, ring. */
export type { RoleSingleKey } from "./types.ts";

/** Single color: either a plain hex string or a {@link ColorValue} object. */
export type { SingleColor } from "./types.ts";

/** A complete theme definition with required light mode and optional dark mode. */
export type { ThemeSchema } from "./types.ts";

/** Complete token schema for a single mode (light or dark). */
export type { TokenSchema } from "./types.ts";

/** Helper: partial known keys, allow additional. */
export type { WithOptional } from "./types.ts";

/** Helper: require known keys, allow additional. */
export type { WithRequired } from "./types.ts";

/** Helper: mix required + optional known keys, allow additional. */
export type { WithKnown } from "./types.ts";

/** Parse a hex color string to an `[r, g, b]` tuple. */
export { hexToRgb } from "./utils.ts";

/** Convert a hex color to an `"r, g, b"` triplet string. */
export { hexToRgbTriplet } from "./utils.ts";

/** Complete Tailwind CSS v3 color palette as hex values. */
export { colors } from "./colors.ts";
