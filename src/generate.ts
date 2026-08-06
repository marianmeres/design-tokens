import type {
	ColorPair,
	ColorValue,
	GeneratedTokens,
	SingleColor,
	ThemeSchema,
	TokenSchema,
} from "./types.ts";
import { evaluateColorExpression, formatColor, type VarLookup } from "./color.ts";

/**
 * How to serve engines that lack `color-mix()` (Chrome/Edge < 111,
 * Safari < 16.2, Firefox < 113) at the token-record level.
 *
 * - `"none"` — emit `color-mix()` expressions as-is.
 * - `"static"` — evaluate every `color-mix()` at build time and emit literal
 *   colors instead. The output contains no `color-mix()` for statically
 *   resolvable values; expressions whose operands cannot be resolved at build
 *   time (e.g. author-supplied `var()` refs to variables declared elsewhere)
 *   pass through unchanged.
 */
export type TokenFallback = "none" | "static";

/**
 * How to serve engines that lack `color-mix()` at the stylesheet level. Adds
 * one mode on top of {@link TokenFallback}:
 *
 * - `"supports"` — emit the `color-mix()` values normally, then repeat the
 *   affected tokens as precomputed literals inside
 *   `@supports not (color: color-mix(in oklab, red, blue))`. Modern engines
 *   are unaffected; older ones get working colors.
 */
export type ThemeFallback = TokenFallback | "supports";

/**
 * The guard wrapping the static fallback block. Note the declaration test
 * (`color: …`) — a bare `@supports (color-mix(…))` is the `<general-enclosed>`
 * production, which the spec requires to evaluate to false *everywhere*, so it
 * would silently hand the fallback to modern browsers too.
 *
 * The probe uses `in oklab` because that is the strictly stronger capability
 * of the two spaces the generator emits: an engine that somehow supported
 * `srgb` mixing but not `oklab` would fall back for both, which is safe.
 */
const COLOR_MIX_GUARD = "@supports not (color: color-mix(in oklab, red, blue))";

/**
 * Rewrite a single token value to a literal color, or return null to leave it
 * alone.
 *
 * Only values that actually contain `color-mix()` are touched. Plain `var()`
 * indirection is deliberately preserved — flattening it would defeat the
 * reboot bridge (whose `--bs-*` vars are references by design) and would
 * freeze consumer overrides for no benefit, since `var()` itself needs no
 * fallback.
 */
function staticValue(value: string, lookup: VarLookup): string | null {
	if (!value.includes("color-mix(")) return null;
	const resolved = evaluateColorExpression(value, lookup);
	return resolved ? formatColor(resolved) : null;
}

/**
 * The subset of `tokens` whose `color-mix()` values could be precomputed,
 * mapped to their literal equivalents. Tokens without `color-mix()`, and those
 * whose operands are not statically resolvable, are absent.
 *
 * Useful on its own to audit which tokens carry a `color-mix()` browser
 * requirement, and which of those the generator can cover.
 *
 * @param tokens - Generated token key-value pairs (from {@link generateCssTokens})
 */
export function resolveStaticOverrides(tokens: GeneratedTokens): GeneratedTokens {
	const lookup: VarLookup = (name) => tokens[name];
	const out: GeneratedTokens = {};
	for (const [key, value] of Object.entries(tokens)) {
		const literal = staticValue(value, lookup);
		if (literal !== null) out[key] = literal;
	}
	return out;
}

/**
 * Evaluate every `color-mix()` expression in a token record at build time,
 * returning a record of the same shape with literal colors in their place.
 *
 * Values whose operands cannot be resolved statically — an author-supplied
 * `oklch`/`hsl` interpolation space, `currentColor`, an undefined variable —
 * pass through unchanged. This is intentional: emitting an approximation would
 * be worse than emitting the original expression.
 *
 * @param tokens - Generated token key-value pairs (from {@link generateCssTokens})
 */
export function resolveStaticTokens(tokens: GeneratedTokens): GeneratedTokens {
	return { ...tokens, ...resolveStaticOverrides(tokens) };
}

/** Options for token generation. */
export type GenerateOptions = {
	/**
	 * Light or dark mode. Affects two things:
	 *
	 * 1. The direction of intent hover/active derivation (mixes toward `black`
	 *    in light mode, `white` in dark mode), so saturated brand colors stay
	 *    clean.
	 * 2. The `surface-{intent}-foreground` contrast mix (same black/white
	 *    direction).
	 *
	 * Role color hover/active is mode-independent — it always mixes toward
	 * `--{prefix}color-foreground`, which itself flips per mode.
	 *
	 * @default "light"
	 */
	mode?: "light" | "dark";

	/**
	 * Whether to auto-derive missing hover/active via `color-mix()`. When
	 * `false`, tokens without explicit hover/active simply fall back to the
	 * DEFAULT value — i.e. flat tokens with no visual state change.
	 *
	 * This is a *design* knob, not a compatibility one. It does not remove
	 * `color-mix()` from the output: the `surface-{intent}` tokens are derived
	 * regardless, and author-supplied `color-mix()` values pass through
	 * verbatim. For `color-mix()`-free output use {@link GenerateOptions.fallback}
	 * (`"static"`), or `"supports"` on {@link generateThemeCss} to keep
	 * `color-mix()` for modern engines while still serving older ones.
	 *
	 * @default true
	 */
	deriveStates?: boolean;

	/**
	 * How to handle engines without `color-mix()` support (Chrome/Edge < 111,
	 * Safari < 16.2, Firefox < 113). See {@link TokenFallback}.
	 *
	 * `generateCssTokens` returns a flat record, so it cannot express the
	 * `"supports"` dual emission — pass that to {@link generateThemeCss}
	 * instead.
	 *
	 * @default "none"
	 */
	fallback?: TokenFallback;

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
export type GenerateThemeOptions = Omit<GenerateOptions, "mode" | "fallback"> & {
	/**
	 * How to handle engines without `color-mix()` support (Chrome/Edge < 111,
	 * Safari < 16.2, Firefox < 113). See {@link ThemeFallback}.
	 *
	 * Defaults to `"supports"`, which is safe by construction: the `:root`
	 * block is byte-for-byte what `"none"` produces, and older engines pick up
	 * precomputed literals from a trailing `@supports not (...)` block. This
	 * matters because `color-mix()` used as a *token value* has no consumer-side
	 * remedy — the declaration parses everywhere and only fails at substitution
	 * time, which makes it invalid at computed-value time and resolves the
	 * property to `unset` (transparent backgrounds, inherited text color). A
	 * `var(--token, #fallback)` in consumer CSS does not help, because the
	 * custom property is defined; its value is just unusable.
	 *
	 * @default "supports"
	 */
	fallback?: ThemeFallback;

	/**
	 * Wrap the output in `@layer {name} { ... }`. Pass a layer name to enable.
	 *
	 * Note that `@layer` itself needs Chrome 99+, Safari 15.4+, Firefox 97+.
	 * On older engines the whole block is dropped, which leaves the tokens
	 * *undefined* — that at least makes `var(--token, #fallback)` fire in
	 * consumer CSS, so it degrades more gracefully than the `color-mix()` case.
	 */
	cssLayer?: string;

	/**
	 * Prepend a `/* prettier-ignore *\/` comment so Prettier preserves the
	 * generated whitespace alignment when the output is written to a file that
	 * later gets formatted. Has no runtime effect; only meaningful for build
	 * pipelines that pass the result through Prettier.
	 *
	 * @default false
	 */
	prettierIgnore?: boolean;
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

/**
 * Thrown when a schema would generate broken output. Internal — the message
 * (which always names the offending schema path) is the public contract.
 */
class TokenSchemaError extends Error {
	override name = "TokenSchemaError";
}

const MERGE_HINT =
	"To override parts of an existing theme, merge your overrides over a " +
	"complete base first: mergeThemeSchema(base, overrides).";

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Guard the five container objects the generator dereferences, with an error
 * naming the missing path instead of `Cannot read properties of undefined`.
 */
function assertSchemaContainers(schema: TokenSchema): void {
	const bad = (path: string, got: unknown): never => {
		throw new TokenSchemaError(
			`Invalid TokenSchema: "${path}" is ${
				got === undefined ? "missing" : "not an object"
			} — a complete schema has the shape ` +
				`{ colors: { intent, role: { paired, single } } }. ${MERGE_HINT}`,
		);
	};
	if (!isPlainObject(schema)) bad("(schema)", schema);
	if (!isPlainObject(schema.colors)) bad("colors", schema.colors);
	if (!isPlainObject(schema.colors.intent)) bad("colors.intent", schema.colors.intent);
	if (!isPlainObject(schema.colors.role)) bad("colors.role", schema.colors.role);
	if (!isPlainObject(schema.colors.role.paired)) {
		bad("colors.role.paired", schema.colors.role.paired);
	}
	if (!isPlainObject(schema.colors.role.single)) {
		bad("colors.role.single", schema.colors.role.single);
	}
}

/**
 * A `ColorPair` entry must carry string `DEFAULT` and `foreground` — anything
 * else would be written into the token record verbatim (`--x: undefined;`,
 * `--x: 5;`) and only fail at CSS substitution time, far from the mistake.
 */
function assertColorPair(value: unknown, path: string): void {
	if (!isPlainObject(value)) {
		throw new TokenSchemaError(
			`Invalid TokenSchema: "${path}" must be an object with string ` +
				`"DEFAULT" and "foreground" (got ${describe(value)}). ${MERGE_HINT}`,
		);
	}
	for (const key of ["DEFAULT", "foreground"] as const) {
		if (typeof value[key] !== "string") {
			throw new TokenSchemaError(
				`Invalid TokenSchema: "${path}" must declare a string "${key}" ` +
					`(got ${describe(value[key])}). ${MERGE_HINT}`,
			);
		}
	}
	assertOptionalStates(
		value,
		["hover", "active", "foregroundHover", "foregroundActive"],
		path,
	);
}

/**
 * Optional state fields must be strings when carried — a non-string value
 * would flow verbatim into the token record (`--x: 5;`, `--x: [object
 * Object];`) or crash the static resolver three frames from the mistake.
 * `null` is exempt: every consumer of these fields degrades it via `??`.
 */
function assertOptionalStates(
	value: Record<string, unknown>,
	keys: readonly string[],
	path: string,
): void {
	for (const key of keys) {
		const v = value[key];
		if (v !== undefined && v !== null && typeof v !== "string") {
			throw new TokenSchemaError(
				`Invalid TokenSchema: "${path}.${key}" must be a string when ` +
					`present (got ${describe(v)}). ${MERGE_HINT}`,
			);
		}
	}
}

/** A `SingleColor` entry must be a string or an object with a string `DEFAULT`. */
function assertSingleColor(value: unknown, path: string): void {
	if (typeof value === "string") return;
	if (!isPlainObject(value) || typeof value.DEFAULT !== "string") {
		throw new TokenSchemaError(
			`Invalid TokenSchema: "${path}" must be a string or an object with ` +
				`a string "DEFAULT" (got ${describe(value)}). ${MERGE_HINT}`,
		);
	}
	assertOptionalStates(value, ["hover", "active"], path);
}

function describe(value: unknown): string {
	if (value === null) return "null";
	if (Array.isArray(value)) return "an array";
	if (typeof value === "object") {
		return `an object with keys [${Object.keys(value).join(", ")}]`;
	}
	return typeof value === "string" ? JSON.stringify(value) : String(value);
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
 * Strategy for deriving hover/active via color-mix.
 *
 * - `contrast` mixes toward pure `black`/`white` (mode-aware). Used for the
 *   saturated intent bucket where neutral darkening/lightening reads cleanly.
 * - `foreground` mixes toward a theme color reference (typically
 *   `--{prefix}color-foreground`). Used for role colors as a softer,
 *   theme-tinted darken/lighten than pure black/white.
 *
 * Both mix `in oklab` (rectangular), NOT `oklch` (polar): polar hue
 * interpolation collapses to a powerless (`none`) hue when a low-chroma color
 * is mixed toward an achromatic endpoint like black/white, which browsers
 * paint as hue 0 — a visible red/mauve shift on near-neutral colors (e.g. the
 * neutral-primary themes). `oklab` scales the a/b axes toward the target and
 * preserves hue for both neutral and saturated colors.
 */
type MixStrategy =
	| { kind: "contrast"; mode: "light" | "dark" }
	| { kind: "foreground"; ref: string };

function deriveColorMixStates(
	cssVarRef: string,
	strategy: MixStrategy,
): { hover: string; active: string } {
	const target = strategy.kind === "contrast"
		? strategy.mode === "light" ? "black" : "white"
		: strategy.ref;
	return {
		hover: `color-mix(in oklab, ${cssVarRef}, ${target} 10%)`,
		active: `color-mix(in oklab, ${cssVarRef}, ${target} 20%)`,
	};
}

/** Fill missing hover/active on a ColorPair (when deriveStates is true) */
function fillPairStates(
	pair: ColorPair,
	prefix: string,
	key: string,
	strategy: MixStrategy,
): ColorPair {
	if (pair.hover !== undefined && pair.active !== undefined) return pair;
	const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, strategy);
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
	strategy: MixStrategy,
): ColorValue {
	if (color.hover !== undefined && color.active !== undefined) return color;
	const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, strategy);
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
	const fallback = opts.fallback ?? "none";

	assertSchemaContainers(schema);

	const p = normalizePrefix(prefix);
	const tokens: GeneratedTokens = {};

	// Set when a role hover/active derivation actually fires — those derived
	// values reference `--{p}color-foreground`, which the output must declare.
	let referencesForeground = false;

	// Intent colors (auto-derive hover/active via color-mix when enabled).
	// Saturated brand colors mix toward black/white (mode-aware) — neutral
	// darken/lighten keeps the hue clean.
	const intentStrategy: MixStrategy = { kind: "contrast", mode };
	for (const [key, pair] of Object.entries(schema.colors.intent)) {
		assertColorPair(pair, `colors.intent.${key}`);
		const filled = deriveStates ? fillPairStates(pair, p, key, intentStrategy) : pair;
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

	// Role colors mix toward `--<prefix>color-foreground` for a softer,
	// theme-tinted hover/active than the saturated bucket's pure black/white.
	const roleStrategy: MixStrategy = {
		kind: "foreground",
		ref: `var(--${p}color-foreground)`,
	};

	// Role colors (paired) — auto-derive except "background"
	for (const [key, pair] of Object.entries(schema.colors.role.paired)) {
		assertColorPair(pair, `colors.role.paired.${key}`);
		const derive = key !== "background" && deriveStates;
		if (derive && (pair.hover === undefined || pair.active === undefined)) {
			referencesForeground = true;
		}
		const filled = derive ? fillPairStates(pair, p, key, roleStrategy) : pair;
		generatePairedColorTokens(tokens, key, filled, p);
	}

	// Role colors (single)
	for (const [key, color] of Object.entries(schema.colors.role.single)) {
		assertSingleColor(color, `colors.role.single.${key}`);
		if (isSingleColorObject(color) && deriveStates) {
			if (color.hover === undefined || color.active === undefined) {
				referencesForeground = true;
			}
			generateSingleColorTokens(
				tokens,
				key,
				fillColorValueStates(color, p, key, roleStrategy),
				p,
			);
		} else {
			generateSingleColorTokens(tokens, key, color, p);
		}
	}

	// The two derived operands: reject a schema whose output would reference a
	// token it never declares. Everything else — including a schema with fewer
	// keys than TokenSchema requires — generates a stylesheet that stands
	// alone, so it is not the generator's business to refuse it.
	if (
		Object.keys(schema.colors.intent).length > 0 &&
		tokens[`${p}color-background`] === undefined
	) {
		throw new TokenSchemaError(
			`Invalid TokenSchema: "colors.role.paired.background" is required ` +
				`when intent colors are present — every surface-{intent} token ` +
				`references var(--${p}color-background), which this schema's ` +
				`output would never declare. ${MERGE_HINT}`,
		);
	}
	if (referencesForeground && tokens[`${p}color-foreground`] === undefined) {
		throw new TokenSchemaError(
			`Invalid TokenSchema: "colors.role.single.foreground" is required ` +
				`when role hover/active states are derived — derived values ` +
				`reference var(--${p}color-foreground), which this schema's ` +
				`output would never declare. Declare it, or pass ` +
				`deriveStates: false. ${MERGE_HINT}`,
		);
	}

	return fallback === "static" ? resolveStaticTokens(tokens) : tokens;
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

/** Indent every non-empty line by one tab. */
function indent(css: string): string {
	return css
		.split("\n")
		.map((l) => (l ? "\t" + l : l))
		.join("\n");
}

/**
 * Build the `@supports not (color: color-mix(...))` block holding precomputed
 * literals for every `color-mix()`-valued token in `entries`.
 *
 * Emit it *after* the blocks it backs up: `@supports` adds no specificity, so
 * source order is what makes it win on engines that match the guard.
 *
 * @param entries - Selector / token-record pairs, in the same order they are emitted
 * @returns The CSS block, or null when nothing needs a fallback
 */
export function staticFallbackCss(
	entries: { selector: string; tokens: GeneratedTokens }[],
): string | null {
	const inner = entries
		.map(({ selector, tokens }) => ({
			selector,
			overrides: resolveStaticOverrides(tokens),
		}))
		.filter(({ overrides }) => Object.keys(overrides).length > 0)
		.map(({ selector, overrides }) => toCssString(overrides, selector));

	return inner.length ? `${COLOR_MIX_GUARD} {\n${indent(inner.join("\n"))}}\n` : null;
}

/**
 * Generate complete CSS for a theme (light + optional dark mode).
 *
 * With the default `fallback: "supports"` the output is the plain token
 * block(s) followed by a `@supports not (...)` block repeating the
 * `color-mix()`-valued tokens as precomputed literals. Source order matters
 * there: the fallback block comes last so it wins the cascade on engines that
 * match it, and `:root.dark` keeps beating `:root` on specificity either way.
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
	const { cssLayer, prettierIgnore, fallback = "supports", ...genOptions } = options;
	const PRETTIER_IGNORE_PREFIX = "/* prettier-ignore */\n";

	if (!isPlainObject(schema) || schema.light === undefined) {
		throw new TokenSchemaError(
			`Invalid ThemeSchema: expected { light: TokenSchema, dark?: TokenSchema }` +
				` (got ${describe(schema)}). ${MERGE_HINT}`,
		);
	}

	// Re-throw schema validation errors with the mode they came from — the
	// same path exists in both modes, so an unqualified path is ambiguous.
	const modeTokens = (mode: "light" | "dark", tokenSchema: TokenSchema) => {
		try {
			return generateCssTokens(tokenSchema, prefix, {
				...genOptions,
				mode,
				fallback: fallback === "static" ? "static" : "none",
			});
		} catch (e) {
			if (e instanceof TokenSchemaError) {
				throw new TokenSchemaError(`[${mode}] ${e.message}`);
			}
			throw e;
		}
	};

	const modes: { selector: string; tokens: GeneratedTokens }[] = [
		{ selector: ":root", tokens: modeTokens("light", schema.light) },
	];
	if (schema.dark) {
		modes.push({ selector: ":root.dark", tokens: modeTokens("dark", schema.dark) });
	}

	const blocks = modes.map(({ selector, tokens }) => toCssString(tokens, selector));

	if (fallback === "supports") {
		const fallbackBlock = staticFallbackCss(modes);
		if (fallbackBlock) blocks.push(fallbackBlock);
	}

	let css =
		(!cssLayer && prettierIgnore
			? blocks.map((b) => PRETTIER_IGNORE_PREFIX + b)
			: blocks).join("\n");

	if (cssLayer) {
		css = `@layer ${cssLayer} {\n${indent(css)}}\n`;
		if (prettierIgnore) {
			css = PRETTIER_IGNORE_PREFIX + css;
		}
	}

	return css;
}
