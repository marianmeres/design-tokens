import type {
	ThemeSchema,
	ThemeSchemaOverrides,
	TokenSchema,
	TokenSchemaOverrides,
} from "./types.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Reject override keys outside `allowed` — the runtime analogue of the
 * excess-property check the {@link ThemeSchemaOverrides} type performs on
 * literals, for overrides that arrive as JSON (MCP, config files). */
function assertKnownKeys(obj: object, allowed: string[], path: string): void {
	for (const key of Object.keys(obj)) {
		if (!allowed.includes(key)) {
			throw new Error(
				`Invalid ThemeSchemaOverrides: unknown key "${path}.${key}" ` +
					`(expected ${allowed.map((a) => `"${a}"`).join(", ")}).`,
			);
		}
	}
}

/**
 * Replace whole leaves in `target` with clones from `source`. A key the base
 * does not already have is an error, not an addition — the most likely cause
 * is a typo, and merging a typo'd key would silently mint junk tokens while
 * the intended token keeps its base value.
 */
function replaceLeaves<T>(
	target: Record<string, T>,
	source: Partial<Record<string, T>>,
	path: string,
): void {
	if (!isPlainObject(source)) {
		throw new Error(
			`Invalid ThemeSchemaOverrides: "${path}" must be an object.`,
		);
	}
	for (const [key, leaf] of Object.entries(source)) {
		if (!(key in target)) {
			throw new Error(
				`Invalid ThemeSchemaOverrides: "${path}.${key}" does not exist ` +
					`in the base theme (base has: ${
						Object.keys(target).join(", ")
					}). Overrides replace existing keys only — to introduce a ` +
					`new key, author it on the base schema object.`,
			);
		}
		if (leaf === undefined) continue;
		target[key] = structuredClone(leaf) as T;
	}
}

/** Merge one mode: clone the base, then replace overridden leaves. */
function mergeMode(
	baseMode: TokenSchema,
	overrides: TokenSchemaOverrides | undefined,
	path: string,
): TokenSchema {
	const merged = structuredClone(baseMode);
	if (overrides == null) return merged;
	if (!isPlainObject(overrides)) {
		throw new Error(`Invalid ThemeSchemaOverrides: "${path}" must be an object.`);
	}
	assertKnownKeys(overrides, ["colors"], path);
	const colors = overrides.colors;
	if (colors == null) return merged;
	if (!isPlainObject(colors)) {
		throw new Error(
			`Invalid ThemeSchemaOverrides: "${path}.colors" must be an object.`,
		);
	}
	assertKnownKeys(colors, ["intent", "role"], `${path}.colors`);
	if (colors.intent != null) {
		replaceLeaves(merged.colors.intent, colors.intent, `${path}.colors.intent`);
	}
	const role = colors.role;
	if (role != null) {
		if (!isPlainObject(role)) {
			throw new Error(
				`Invalid ThemeSchemaOverrides: "${path}.colors.role" must be an object.`,
			);
		}
		assertKnownKeys(role, ["paired", "single"], `${path}.colors.role`);
		if (role.paired != null) {
			replaceLeaves(
				merged.colors.role.paired,
				role.paired,
				`${path}.colors.role.paired`,
			);
		}
		if (role.single != null) {
			replaceLeaves(
				merged.colors.role.single,
				role.single,
				`${path}.colors.role.single`,
			);
		}
	}
	return merged;
}

/**
 * Merge sparse overrides over a complete base theme, returning a new complete
 * {@link ThemeSchema} — the supported way to express "bundled theme X, but
 * primary is indigo". The base is never mutated; an absent or empty override
 * mode yields the base mode unchanged.
 *
 * The merge recurses through the containers (`light`/`dark` → `colors` →
 * `intent`/`role` → `paired`/`single`) and **replaces whole leaves** — a
 * `ColorPair` or `SingleColor` override supersedes the base entry entirely,
 * never merges into it. Deliberate: merging inside a leaf would let a changed
 * `DEFAULT` silently inherit a stale explicit `hover`/`active` or a
 * `foreground` that no longer contrasts. To keep parts of a base leaf, spread
 * it yourself: `{ ...base.light.colors.intent.primary, DEFAULT: "#4f46e5" }`.
 *
 * Override keys must already exist in the base (typo protection); dark
 * overrides require the base to have a dark mode. To change the key set,
 * author it on the base schema object.
 *
 * @param base - A complete theme (e.g. a bundled theme from `./themes`)
 * @param overrides - Sparse overrides; see {@link ThemeSchemaOverrides}
 *
 * @example
 * ```ts
 * import { amberOliveSafari } from "@marianmeres/design-tokens/themes";
 * import { generateThemeCss, mergeThemeSchema } from "@marianmeres/design-tokens";
 *
 * const theme = mergeThemeSchema(amberOliveSafari, {
 * 	light: {
 * 		colors: {
 * 			intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
 * 		},
 * 	},
 * });
 * const css = generateThemeCss(theme, "app-");
 * ```
 */
export function mergeThemeSchema(
	base: ThemeSchema,
	overrides: ThemeSchemaOverrides,
): ThemeSchema {
	if (!isPlainObject(base) || !isPlainObject(base.light)) {
		throw new Error(
			`mergeThemeSchema: "base" must be a complete ThemeSchema with a ` +
				`"light" mode (e.g. a bundled theme).`,
		);
	}
	const o: ThemeSchemaOverrides = overrides ?? {};
	if (!isPlainObject(o)) {
		throw new Error(`Invalid ThemeSchemaOverrides: expected an object.`);
	}
	assertKnownKeys(o, ["light", "dark"], "overrides");
	if (o.dark != null && base.dark == null) {
		throw new Error(
			`Invalid ThemeSchemaOverrides: "dark" overrides were given but the ` +
				`base theme has no dark mode — author the dark mode on the base ` +
				`schema object instead.`,
		);
	}
	return {
		light: mergeMode(base.light, o.light, "light"),
		...(base.dark ? { dark: mergeMode(base.dark, o.dark, "dark") } : {}),
	};
}
