/**
 * Bootstrap Reboot CSS variable bridge.
 *
 * Maps design tokens to the `--bs-*` variables that Bootstrap Reboot's
 * CSS rules consume, enabling drop-in theming of Reboot-styled pages.
 *
 * @module
 */

import type { GeneratedTokens, ThemeSchema } from "./types.ts";
import { generateCssTokens, toCssString } from "./generate.ts";
import { hexToRgbTriplet } from "./utils.ts";

/**
 * Generate Bootstrap Reboot bridge CSS variables from design tokens.
 *
 * Maps design tokens to the --bs-* variables that Reboot's CSS rules actually use.
 * For RGB triplet variables (--bs-*-rgb), hex values are parsed automatically.
 * Non-hex values are passed through for hex fields but cannot produce RGB triplets.
 *
 * @param tokens - Generated token key-value pairs (from generateCssTokens)
 * @param prefix - The same prefix used in generateCssTokens
 */
export function generateRebootBridge(
	tokens: GeneratedTokens,
	prefix: string,
): GeneratedTokens {
	const bridge: GeneratedTokens = {};
	const get = (key: string) => tokens[`${prefix}color-${key}`];
	const ref = (key: string) => `var(--${prefix}color-${key})`;

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
	if (tokens[`${prefix}color-primary-hover`]) {
		bridge[`bs-link-hover-color`] = ref("primary-hover");
		const triplet = hexToRgbTriplet(
			tokens[`${prefix}color-primary-hover`],
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
 * @param prefix - Required CSS variable prefix
 */
export function generateThemedCss(
	schema: ThemeSchema,
	prefix: string,
): string {
	// Light mode
	const lightTokens = generateCssTokens(schema.light, prefix, "light");
	const lightBridge = generateRebootBridge(lightTokens, prefix);
	let css = toCssString({ ...lightTokens, ...lightBridge });

	// Dark mode
	if (schema.dark) {
		const darkTokens = generateCssTokens(
			schema.dark,
			prefix,
			"dark",
		);
		const darkBridge = generateRebootBridge(darkTokens, prefix);
		css += "\n" +
			toCssString(
				{ ...darkTokens, ...darkBridge },
				":root.dark",
			);
	}

	return css;
}
