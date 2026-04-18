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
	foregroundHover?: string;
	foregroundActive?: string;
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

/** Known role color keys (paired, required) */
export type RolePairedKey = "background" | "muted" | "surface";

/**
 * Known role color keys (paired, optional). These are recommended conventions
 * — all bundled themes ship `surface-1` as an extra elevation — but not
 * required. Additional arbitrary string keys are also allowed via the
 * {@link WithKnown} escape hatch.
 */
export type RolePairedOptionalKey = "surface-1";

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
 * Helper: require some known keys, offer others as optional, and allow any
 * additional string keys. Used for collections like role.paired where certain
 * keys are mandatory and others are conventional but not required.
 */
export type WithKnown<TRequired extends string, TOptional extends string, TValue> =
	& Record<TRequired, TValue>
	& Partial<Record<TOptional, TValue>>
	& Record<string, TValue>;

/**
 * Complete token schema for a single mode (light or dark).
 *
 * Defines intent colors (primary, accent, destructive, warning, success),
 * role paired colors (background, muted, surface required; surface-1 optional
 * — each with a foreground), and role single colors (foreground, border,
 * input, ring).
 */
export type TokenSchema = {
	colors: {
		intent: WithRequired<IntentColorKey, ColorPair>;
		role: {
			paired: WithKnown<RolePairedKey, RolePairedOptionalKey, ColorPair>;
			single: WithRequired<RoleSingleKey, SingleColor>;
		};
	};
};

/** Generated CSS token key-value pairs (without the `--` prefix on keys). */
export type GeneratedTokens = Record<string, string>;

/** A complete theme definition with required light mode and optional dark mode */
export type ThemeSchema = { light: TokenSchema; dark?: TokenSchema };
