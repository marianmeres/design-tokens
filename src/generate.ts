import type {
	ColorPair,
	ColorValue,
	GeneratedTokens,
	SingleColor,
	ThemeSchema,
	TokenSchema,
} from "./types.ts";

/** Options for token generation. */
export type GenerateOptions = {
	/**
	 * Light or dark mode. Affects the direction of auto-derived hover/active
	 * states (darkens in light mode, lightens in dark mode).
	 *
	 * @default "light"
	 */
	mode?: "light" | "dark";

	/**
	 * Whether to auto-derive missing hover/active via `color-mix()`. When
	 * `false`, tokens without explicit hover/active simply fall back to the
	 * DEFAULT value (useful for environments without `color-mix()` support,
	 * or for consumers who want flat tokens).
	 *
	 * @default true
	 */
	deriveStates?: boolean;

	/**
	 * Contrast mix percentage used to derive the `surface-{intent}-foreground`
	 * token. Higher values produce more legible foreground text on the tinted
	 * surface background. Valid range: 0–100.
	 *
	 * @default 50
	 */
	surfaceForegroundContrast?: number;
};

/** Options for {@link generateThemeCss}. */
export type GenerateThemeOptions = Omit<GenerateOptions, "mode"> & {
	/**
	 * Wrap the output in `@layer {name} { ... }`. Pass a layer name to enable.
	 */
	cssLayer?: string;
};

/**
 * Normalize a CSS variable prefix so callers can pass either `"my"` or
 * `"my-"` — we always ensure a single trailing dash. Empty string is
 * preserved (produces unprefixed variables).
 */
function normalizePrefix(prefix: string): string {
	if (prefix === "") return "";
	return prefix.endsWith("-") ? prefix : prefix + "-";
}

/** Check if a single color is an object with states or a plain string */
function isSingleColorObject(value: SingleColor): value is ColorValue {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		"DEFAULT" in value
	);
}

/**
 * Derive hover/active using color-mix (pure CSS, no Tailwind).
 * Light mode: darken. Dark mode: lighten.
 */
function deriveColorMixStates(
	cssVarRef: string,
	mode: "light" | "dark",
): { hover: string; active: string } {
	const mix = mode === "light" ? "black" : "white";
	return {
		hover: `color-mix(in oklch, ${cssVarRef}, ${mix} 10%)`,
		active: `color-mix(in oklch, ${cssVarRef}, ${mix} 20%)`,
	};
}

/** Fill missing hover/active on a ColorPair (when deriveStates is true) */
function fillPairStates(
	pair: ColorPair,
	prefix: string,
	key: string,
	mode: "light" | "dark",
): ColorPair {
	if (pair.hover !== undefined && pair.active !== undefined) return pair;
	const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, mode);
	return {
		...pair,
		hover: pair.hover ?? derived.hover,
		active: pair.active ?? derived.active,
	};
}

/** Fill missing hover/active on a ColorValue (when deriveStates is true) */
function fillColorValueStates(
	color: ColorValue,
	prefix: string,
	key: string,
	mode: "light" | "dark",
): ColorValue {
	if (color.hover !== undefined && color.active !== undefined) return color;
	const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, mode);
	return {
		...color,
		hover: color.hover ?? derived.hover,
		active: color.active ?? derived.active,
	};
}

/** Generate color tokens for a paired color (with foreground) */
function generatePairedColorTokens(
	tokens: GeneratedTokens,
	key: string,
	pair: ColorPair,
	prefix: string,
): void {
	tokens[`${prefix}color-${key}`] = pair.DEFAULT;
	tokens[`${prefix}color-${key}-hover`] = pair.hover ?? pair.DEFAULT;
	tokens[`${prefix}color-${key}-active`] = pair.active ?? pair.DEFAULT;
	tokens[`${prefix}color-${key}-foreground`] = pair.foreground;
	tokens[`${prefix}color-${key}-foreground-hover`] = pair.foregroundHover ??
		pair.foreground;
	tokens[`${prefix}color-${key}-foreground-active`] = pair.foregroundActive ??
		pair.foreground;
}

/** Generate color tokens for a single color */
function generateSingleColorTokens(
	tokens: GeneratedTokens,
	key: string,
	color: SingleColor,
	prefix: string,
): void {
	if (isSingleColorObject(color)) {
		tokens[`${prefix}color-${key}`] = color.DEFAULT;
		tokens[`${prefix}color-${key}-hover`] = color.hover ?? color.DEFAULT;
		tokens[`${prefix}color-${key}-active`] = color.active ?? color.DEFAULT;
	} else {
		tokens[`${prefix}color-${key}`] = color;
		tokens[`${prefix}color-${key}-hover`] = color;
		tokens[`${prefix}color-${key}-active`] = color;
	}
}

/**
 * Generate CSS token key-value pairs from a {@link TokenSchema}.
 *
 * The `prefix` is normalized so callers may pass `"my"` or `"my-"` — a single
 * trailing dash is always ensured. An empty prefix produces unprefixed tokens
 * (e.g. `--color-primary`).
 *
 * @param schema - The token schema
 * @param prefix - CSS variable prefix (e.g. `"my"`, `"my-"`, or `""`)
 * @param options - Generation options, or a shorthand `"light"`/`"dark"` mode string
 */
export function generateCssTokens(
	schema: TokenSchema,
	prefix: string,
	options: GenerateOptions | "light" | "dark" = {},
): GeneratedTokens {
	const opts: GenerateOptions = typeof options === "string"
		? { mode: options }
		: options;
	const mode = opts.mode ?? "light";
	const deriveStates = opts.deriveStates ?? true;
	const surfaceContrast = opts.surfaceForegroundContrast ?? 50;

	const p = normalizePrefix(prefix);
	const tokens: GeneratedTokens = {};

	// Intent colors (auto-derive hover/active via color-mix when enabled)
	for (const [key, pair] of Object.entries(schema.colors.intent)) {
		const filled = deriveStates ? fillPairStates(pair, p, key, mode) : pair;
		generatePairedColorTokens(tokens, key, filled, p);
	}

	// Surface-intent tokens (auto-derived from intent colors using color-mix)
	const contrastMix = mode === "light" ? "black" : "white";
	for (const key of Object.keys(schema.colors.intent)) {
		tokens[`${p}color-surface-${key}`] =
			`color-mix(in srgb, var(--${p}color-${key}) 15%, var(--${p}color-background))`;
		tokens[`${p}color-surface-${key}-foreground`] =
			`color-mix(in srgb, var(--${p}color-${key}), ${contrastMix} ${surfaceContrast}%)`;
		tokens[`${p}color-surface-${key}-border`] =
			`color-mix(in srgb, var(--${p}color-${key}) 30%, var(--${p}color-background))`;
	}

	// Role colors (paired) — auto-derive except "background"
	for (const [key, pair] of Object.entries(schema.colors.role.paired)) {
		const filled = key === "background" || !deriveStates
			? pair
			: fillPairStates(pair, p, key, mode);
		generatePairedColorTokens(tokens, key, filled, p);
	}

	// Role colors (single)
	for (const [key, color] of Object.entries(schema.colors.role.single)) {
		if (isSingleColorObject(color) && deriveStates) {
			generateSingleColorTokens(
				tokens,
				key,
				fillColorValueStates(color, p, key, mode),
				p,
			);
		} else {
			generateSingleColorTokens(tokens, key, color, p);
		}
	}

	return tokens;
}

/**
 * Extract the grouping base of a token key.
 *
 * Groups tokens by their top-level color name so related tokens cluster in
 * the output. `surface-1`, `surface-2` group with `surface`; `surface-primary`
 * (a surface-intent token) also groups with `surface`.
 */
function getBaseColor(key: string): string {
	const match = key.match(/color-([a-z]+)/);
	return match ? match[1] : key;
}

/**
 * Convert a tokens record to a CSS declaration block string.
 *
 * Tokens are grouped by their base color name and separated by blank lines
 * for readability.
 */
export function toCssString(
	tokens: GeneratedTokens,
	selector = ":root",
): string {
	const keys = Object.keys(tokens);
	if (keys.length === 0) return `${selector} {\n}\n`;

	const maxLen = Math.max(...keys.map((k) => `--${k}`.length));

	const groups = new Map<string, [string, string][]>();
	for (const [key, value] of Object.entries(tokens)) {
		const base = getBaseColor(key);
		if (!groups.has(base)) groups.set(base, []);
		groups.get(base)!.push([key, value]);
	}

	const formatVar = ([key, value]: [string, string]): string => {
		const cssKey = `--${key}:`;
		return `\t${cssKey.padEnd(maxLen + 1)} ${value};`;
	};

	const parts: string[] = [];
	for (const entries of groups.values()) {
		parts.push(entries.map(formatVar).join("\n"));
	}

	return `${selector} {\n${parts.join("\n\n")}\n}\n`;
}

/**
 * Generate complete CSS for a theme (light + optional dark mode).
 *
 * @param schema - Theme schema with required light and optional dark mode
 * @param prefix - CSS variable prefix (auto-normalized)
 * @param options - Generation + output options
 */
export function generateThemeCss(
	schema: ThemeSchema,
	prefix: string,
	options: GenerateThemeOptions = {},
): string {
	const { cssLayer, ...genOptions } = options;

	let css = toCssString(
		generateCssTokens(schema.light, prefix, { ...genOptions, mode: "light" }),
	);
	if (schema.dark) {
		css += "\n" +
			toCssString(
				generateCssTokens(schema.dark, prefix, {
					...genOptions,
					mode: "dark",
				}),
				":root.dark",
			);
	}

	if (cssLayer) {
		const indented = css.split("\n").map((l) => (l ? "\t" + l : l)).join(
			"\n",
		);
		css = `@layer ${cssLayer} {\n${indented}}\n`;
	}

	return css;
}
