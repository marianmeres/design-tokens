/** Base color value with optional pseudo states */
export type ColorValue = {
	DEFAULT: string;
	hover?: string;
	active?: string;
};

/** Color pair enforcing the -foreground convention, with optional pseudo states */
export type ColorPair = {
	DEFAULT: string;
	foreground: string;
	hover?: string;
	active?: string;
};

/** Single color: either a plain string or an object with pseudo states */
export type SingleColor = string | ColorValue;

/** Known intent color keys */
export type IntentColorKey =
	| "primary"
	| "accent"
	| "destructive"
	| "warning"
	| "success";

/** Known role color keys (paired) */
export type RolePairedKey = "background" | "muted" | "surface";

/** Known role color keys (single value) */
export type RoleSingleKey = "foreground" | "border" | "input" | "ring";

/** Helper: require known keys, allow additional */
export type WithRequired<TRequired extends string, TValue> =
	& Record<
		TRequired,
		TValue
	>
	& Record<string, TValue>;

/** Helper: partial known keys, allow additional */
export type WithOptional<TKnown extends string, TValue> =
	& Partial<
		Record<TKnown, TValue>
	>
	& Record<string, TValue>;

/**
 * Complete token schema for a single mode (light or dark).
 *
 * Defines intent colors (primary, accent, destructive, warning, success),
 * role paired colors (background, muted, surface — each with a foreground),
 * and role single colors (foreground, border, input, ring).
 */
export type TokenSchema = {
	colors: {
		intent: WithRequired<IntentColorKey, ColorPair>;
		role: {
			paired: WithRequired<RolePairedKey, ColorPair>;
			single: WithRequired<RoleSingleKey, SingleColor>;
		};
	};
};

/** Generated CSS token key-value pairs (without the `--` prefix on keys). */
export type GeneratedTokens = Record<string, string>;

/** A complete theme definition with required light mode and optional dark mode */
export type ThemeSchema = { light: TokenSchema; dark?: TokenSchema };
