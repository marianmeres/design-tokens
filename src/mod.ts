/**
 * CSS custom property generator for design token systems.
 *
 * Takes a structured color token schema and produces CSS variables for
 * light and dark modes, with automatic hover/active state derivation
 * using `color-mix()`.
 *
 * @module
 */

export { generateCssTokens, generateThemeCss, toCssString } from "./generate.ts";

export type {
	ColorPair,
	ColorValue,
	GeneratedTokens,
	IntentColorKey,
	RolePairedKey,
	RoleSingleKey,
	SingleColor,
	ThemeSchema,
	TokenSchema,
	WithOptional,
	WithRequired,
} from "./types.ts";

export { hexToRgb, hexToRgbTriplet } from "./utils.ts";

export { colors } from "./colors.ts";
