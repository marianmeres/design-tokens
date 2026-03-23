import type {
	ColorPair,
	ColorValue,
	GeneratedTokens,
	SingleColor,
	ThemeSchema,
	TokenSchema,
} from "./types.ts";


/** Check if a single color is an object with states or a plain string */
function isSingleColorObject(value: SingleColor): value is ColorValue {
	return typeof value === "object" && "DEFAULT" in value;
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

/** Fill missing hover/active on a ColorPair */
function fillPairStates(
	pair: ColorPair,
	prefix: string,
	key: string,
	mode: "light" | "dark",
): ColorPair {
	if (pair.hover !== undefined && pair.active !== undefined) {
		return pair;
	}
	const derived = deriveColorMixStates(
		`var(--${prefix}color-${key})`,
		mode,
	);
	return {
		...pair,
		hover: pair.hover ?? derived.hover,
		active: pair.active ?? derived.active,
	};
}

/** Fill missing hover/active on a ColorValue */
function fillColorValueStates(
	color: ColorValue,
	prefix: string,
	key: string,
	mode: "light" | "dark",
): ColorValue {
	if (color.hover !== undefined && color.active !== undefined) {
		return color;
	}
	const derived = deriveColorMixStates(
		`var(--${prefix}color-${key})`,
		mode,
	);
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
	tokens[`${prefix}color-${key}-foreground-hover`] = pair.foreground;
	tokens[`${prefix}color-${key}-foreground-active`] = pair.foreground;
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
 * Generate CSS token key-value pairs from a TokenSchema.
 *
 * @param schema - The token schema
 * @param prefix - Required CSS variable prefix (e.g. "my-", "site-")
 * @param mode - Light or dark mode (affects auto-derivation direction)
 */
export function generateCssTokens(
	schema: TokenSchema,
	prefix: string,
	mode: "light" | "dark" = "light",
): GeneratedTokens {
	const tokens: GeneratedTokens = {};

	// Intent colors (auto-derive hover/active via color-mix)
	for (const [key, pair] of Object.entries(schema.colors.intent)) {
		generatePairedColorTokens(
			tokens,
			key,
			fillPairStates(pair, prefix, key, mode),
			prefix,
		);
	}

	// Surface-intent tokens (auto-derived from intent colors using color-mix)
	const contrastMix = mode === "light" ? "black" : "white";
	for (const key of Object.keys(schema.colors.intent)) {
		tokens[`${prefix}color-surface-${key}`] =
			`color-mix(in srgb, var(--${prefix}color-${key}) 15%, var(--${prefix}color-background))`;
		tokens[`${prefix}color-surface-${key}-foreground`] =
			`color-mix(in srgb, var(--${prefix}color-${key}), ${contrastMix} 10%)`;
		tokens[`${prefix}color-surface-${key}-border`] =
			`color-mix(in srgb, var(--${prefix}color-${key}) 30%, var(--${prefix}color-background))`;
	}

	// Role colors (paired) — auto-derive except "background"
	for (
		const [key, pair] of Object.entries(
			schema.colors.role.paired,
		)
	) {
		const filled = key === "background"
			? pair
			: fillPairStates(pair, prefix, key, mode);
		generatePairedColorTokens(tokens, key, filled, prefix);
	}

	// Role colors (single)
	for (
		const [key, color] of Object.entries(
			schema.colors.role.single,
		)
	) {
		if (isSingleColorObject(color)) {
			generateSingleColorTokens(
				tokens,
				key,
				fillColorValueStates(color, prefix, key, mode),
				prefix,
			);
		} else {
			generateSingleColorTokens(tokens, key, color, prefix);
		}
	}

	return tokens;
}

/** Convert tokens object to a CSS declaration block */
export function toCssString(
	tokens: GeneratedTokens,
	selector = ":root",
): string {
	const maxLen = Math.max(
		...Object.keys(tokens).map((k) => `--${k}`.length),
	);

	// Group tokens by base color name (preserving order)
	// Extract base: "{prefix}color-{base}-..." → "{base}"
	const getBaseColor = (key: string): string => {
		const match = key.match(/color-([a-z]+-?\d*)/);
		return match ? match[1] : key;
	};

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

/** Generate complete CSS for a theme (light + optional dark mode) */
export function generateThemeCss(
	schema: ThemeSchema,
	prefix: string,
): string {
	let css = toCssString(
		generateCssTokens(schema.light, prefix, "light"),
	);
	if (schema.dark) {
		css += "\n" +
			toCssString(
				generateCssTokens(schema.dark, prefix, "dark"),
				":root.dark",
			);
	}
	return css;
}
