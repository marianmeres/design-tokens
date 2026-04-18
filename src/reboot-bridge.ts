/**
 * Bootstrap Reboot CSS variable bridge.
 *
 * Maps design tokens to the `--bs-*` variables that Bootstrap Reboot's
 * CSS rules consume, enabling drop-in theming of Reboot-styled pages.
 *
 * @module
 */

import type { GeneratedTokens, ThemeSchema } from "./types.ts";
import { generateCssTokens, type GenerateThemeOptions, toCssString } from "./generate.ts";
import { hexToRgbTriplet } from "./utils.ts";

/**
 * Normalize a CSS variable prefix to always end with a single dash (empty
 * prefix passes through).
 */
function normalizePrefix(prefix: string): string {
	if (prefix === "") return "";
	return prefix.endsWith("-") ? prefix : prefix + "-";
}

/**
 * Generate Bootstrap Reboot bridge CSS variables from design tokens.
 *
 * Maps design tokens to the --bs-* variables that Reboot's CSS rules actually use.
 *
 * ### About `-rgb` companion variables
 *
 * Bootstrap derives alpha-blended colors via `rgba(var(--bs-foo-rgb), 0.5)` —
 * which requires a raw `r, g, b` triplet, not a `var()` reference. This bridge
 * generates `--bs-*-rgb` companions ONLY when the underlying token resolves
 * to a literal hex color. For auto-derived tokens (e.g. the implicit
 * `primary-hover` when no explicit hover is given) the value is a
 * `color-mix()` expression, which cannot be decomposed into an RGB triplet at
 * build time — those companions are omitted, and any Reboot rule that needs
 * them (notably `rgba(var(--bs-link-color-rgb), …)` alpha variants) will fall
 * back to Reboot's defaults.
 *
 * If you need complete alpha-blend support, provide explicit hex `hover` /
 * `active` values on your `ColorPair`s.
 *
 * @param tokens - Generated token key-value pairs (from generateCssTokens)
 * @param prefix - The same prefix used in generateCssTokens (trailing dash optional)
 */
export function generateRebootBridge(
	tokens: GeneratedTokens,
	prefix: string,
): GeneratedTokens {
	const p = normalizePrefix(prefix);
	const bridge: GeneratedTokens = {};
	const get = (key: string) => tokens[`${p}color-${key}`];
	const ref = (key: string) => `var(--${p}color-${key})`;

	// Helper: set a --bs-* var to a var() reference
	const set = (bsKey: string, tokenKey: string) => {
		if (get(tokenKey) === undefined) return;
		bridge[`bs-${bsKey}`] = ref(tokenKey);
	};

	// Helper: set a --bs-* var to a var() reference and its -rgb companion
	// to a raw triplet (CSS cannot derive r,g,b from a var() reference)
	const setWithRgb = (bsKey: string, tokenKey: string) => {
		const value = get(tokenKey);
		if (value === undefined) return;
		bridge[`bs-${bsKey}`] = ref(tokenKey);
		const triplet = hexToRgbTriplet(value);
		if (triplet) bridge[`bs-${bsKey}-rgb`] = triplet;
	};

	// Body
	setWithRgb("body-bg", "background");
	setWithRgb("body-color", "background-foreground");

	// Links
	setWithRgb("link-color", "primary");

	// Link hover — use primary-hover token
	if (tokens[`${p}color-primary-hover`]) {
		bridge[`bs-link-hover-color`] = ref("primary-hover");
		const triplet = hexToRgbTriplet(
			tokens[`${p}color-primary-hover`],
		);
		if (triplet) bridge[`bs-link-hover-color-rgb`] = triplet;
	}

	// Border
	set("border-color", "border");

	// Heading
	set("heading-color", "background-foreground");

	// Code
	if (get("accent")) set("code-color", "accent");

	// Semantic colors
	set("primary", "primary");
	set("danger", "destructive");
	set("warning", "warning");
	set("success", "success");

	// Secondary (muted)
	set("secondary-color", "muted-foreground");
	set("secondary-bg", "muted");

	// Highlight
	set("highlight-color", "background-foreground");
	set("highlight-bg", "warning");

	return bridge;
}

/**
 * Generate complete themed CSS including both design tokens AND reboot bridge.
 *
 * @param schema - Theme schema with light (required) and dark (optional) modes
 * @param prefix - CSS variable prefix (trailing dash optional)
 * @param options - Forwarded to {@link generateCssTokens} for each mode
 */
export function generateThemedCss(
	schema: ThemeSchema,
	prefix: string,
	options: Omit<GenerateThemeOptions, "cssLayer"> = {},
): string {
	// Light mode
	const lightTokens = generateCssTokens(schema.light, prefix, {
		...options,
		mode: "light",
	});
	const lightBridge = generateRebootBridge(lightTokens, prefix);
	let css = toCssString({ ...lightTokens, ...lightBridge });

	// Reboot's default `a` rules use `rgba(var(--bs-link-color-rgb), …)` for
	// alpha variants. When the underlying token is a `color-mix()` expression
	// the -rgb companion doesn't exist — these overrides force the plain
	// `var()` path so links still render correctly.
	css += "\na { color: var(--bs-link-color); }";
	css += "\na:hover { color: var(--bs-link-hover-color); }";

	// Dark mode
	if (schema.dark) {
		const darkTokens = generateCssTokens(schema.dark, prefix, {
			...options,
			mode: "dark",
		});
		const darkBridge = generateRebootBridge(darkTokens, prefix);
		css += "\n" +
			toCssString(
				{ ...darkTokens, ...darkBridge },
				":root.dark",
			);
		css += "\n:root.dark a { color: var(--bs-link-color); }";
		css += "\n:root.dark a:hover { color: var(--bs-link-hover-color); }";
	}

	return css;
}
