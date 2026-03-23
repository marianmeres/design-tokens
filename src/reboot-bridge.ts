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

	// Helper: set a --bs-* var and optionally its -rgb triplet companion
	const set = (bsKey: string, value: string | undefined) => {
		if (value === undefined) return;
		bridge[`bs-${bsKey}`] = value;
	};

	const setWithRgb = (bsKey: string, value: string | undefined) => {
		if (value === undefined) return;
		bridge[`bs-${bsKey}`] = value;
		const triplet = hexToRgbTriplet(value);
		if (triplet) bridge[`bs-${bsKey}-rgb`] = triplet;
	};

	// Body
	setWithRgb("body-bg", get("background"));
	setWithRgb("body-color", get("background-foreground"));

	// Links
	setWithRgb("link-color", get("primary"));
	set("link-decoration", undefined); // leave as reboot default

	// Link hover — use primary-hover token value
	const primaryHover = tokens[`${prefix}color-primary-hover`];
	if (primaryHover) {
		setWithRgb("link-hover-color", primaryHover);
	}

	// Border
	set("border-color", get("border"));

	// Heading
	set("heading-color", get("background-foreground"));

	// Code
	const accent = get("accent");
	if (accent) set("code-color", accent);

	// Semantic colors
	set("primary", get("primary"));
	set("danger", get("destructive"));
	set("warning", get("warning"));
	set("success", get("success"));

	// Secondary (muted)
	set("secondary-color", get("muted-foreground"));
	set("secondary-bg", get("muted"));

	// Highlight
	set("highlight-color", get("background-foreground"));
	set("highlight-bg", get("warning"));

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
