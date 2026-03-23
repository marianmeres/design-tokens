import { assert, assertEquals } from "@std/assert";
import { generateCssTokens, generateThemeCss, toCssString } from "../src/generate.ts";
import type { ThemeSchema, TokenSchema } from "../src/types.ts";

const minimalSchema: TokenSchema = {
	colors: {
		intent: {
			primary: { DEFAULT: "#27272a", foreground: "#ffffff" },
			accent: { DEFAULT: "#71717a", foreground: "#ffffff" },
			destructive: { DEFAULT: "#e11d48", foreground: "#ffffff" },
			warning: { DEFAULT: "#f59e0b", foreground: "#000000" },
			success: { DEFAULT: "#059669", foreground: "#ffffff" },
		},
		role: {
			paired: {
				background: {
					DEFAULT: "#fafafa",
					foreground: "#18181b",
				},
				muted: { DEFAULT: "#f4f4f5", foreground: "#71717a" },
				surface: { DEFAULT: "#e4e4e7", foreground: "#18181b" },
			},
			single: {
				foreground: "#18181b",
				border: { DEFAULT: "#d4d4d8" },
				input: { DEFAULT: "#fafafa", hover: "#f4f4f5" },
				ring: "color-mix(in srgb, #27272a 20%, transparent)",
			},
		},
	},
};

const PREFIX = "my-";

// --- generateCssTokens ---

Deno.test("generateCssTokens - returns expected intent keys", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(tokens["my-color-primary"]);
	assert(tokens["my-color-primary-hover"]);
	assert(tokens["my-color-primary-active"]);
	assert(tokens["my-color-primary-foreground"]);
	assert(tokens["my-color-primary-foreground-hover"]);
	assert(tokens["my-color-primary-foreground-active"]);
});

Deno.test("generateCssTokens - uses provided prefix", () => {
	const tokens = generateCssTokens(minimalSchema, "site-");
	assert(tokens["site-color-primary"]);
	assert(!tokens["my-color-primary"]);
});

Deno.test("generateCssTokens - empty prefix is valid", () => {
	const tokens = generateCssTokens(minimalSchema, "");
	assert(tokens["color-primary"]);
	assertEquals(tokens["color-primary"], "#27272a");
});

Deno.test("generateCssTokens - derives hover/active with color-mix when not provided", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(
		tokens["my-color-primary-hover"].includes("color-mix(in oklch,"),
	);
	assert(
		tokens["my-color-primary-hover"].includes(
			"var(--my-color-primary)",
		),
	);
	assert(
		tokens["my-color-primary-hover"].includes("black 10%"),
	);
	assert(
		tokens["my-color-primary-active"].includes("black 20%"),
	);
});

Deno.test("generateCssTokens - dark mode derives with white instead of black", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert(
		tokens["my-color-primary-hover"].includes("white 10%"),
	);
	assert(
		tokens["my-color-primary-active"].includes("white 20%"),
	);
});

Deno.test("generateCssTokens - uses explicit hover/active when provided", () => {
	const schema: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			intent: {
				...minimalSchema.colors.intent,
				primary: {
					DEFAULT: "#27272a",
					foreground: "#ffffff",
					hover: "#custom-hover",
					active: "#custom-active",
				},
			},
		},
	};
	const tokens = generateCssTokens(schema, PREFIX);
	assertEquals(tokens["my-color-primary-hover"], "#custom-hover");
	assertEquals(tokens["my-color-primary-active"], "#custom-active");
});

Deno.test("generateCssTokens - generates surface-intent tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(tokens["my-color-surface-primary"]);
	assert(tokens["my-color-surface-primary-foreground"]);
	assert(tokens["my-color-surface-primary-border"]);
	// Verify surface tokens reference the prefix correctly
	assert(
		tokens["my-color-surface-primary"].includes(
			"var(--my-color-primary)",
		),
	);
	assert(
		tokens["my-color-surface-primary"].includes(
			"var(--my-color-background)",
		),
	);
});

Deno.test("generateCssTokens - generates role paired tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assertEquals(tokens["my-color-background"], "#fafafa");
	assertEquals(tokens["my-color-background-foreground"], "#18181b");
	assertEquals(tokens["my-color-muted"], "#f4f4f5");
});

Deno.test("generateCssTokens - background has no auto-derived hover/active", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	// Background pair has no hover/active defined, so they default to DEFAULT
	assertEquals(tokens["my-color-background-hover"], "#fafafa");
	assertEquals(tokens["my-color-background-active"], "#fafafa");
});

Deno.test("generateCssTokens - generates role single tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assertEquals(tokens["my-color-foreground"], "#18181b");
	assertEquals(tokens["my-color-border"], "#d4d4d8");
	assertEquals(tokens["my-color-input"], "#fafafa");
	assertEquals(tokens["my-color-input-hover"], "#f4f4f5");
	assertEquals(
		tokens["my-color-ring"],
		"color-mix(in srgb, #27272a 20%, transparent)",
	);
});

// --- toCssString ---

Deno.test("toCssString - returns valid CSS block with selector", () => {
	const tokens = { "my-color-primary": "#27272a" };
	const css = toCssString(tokens);
	assert(css.startsWith(":root {"));
	assert(css.includes("--my-color-primary:"));
	assert(css.includes("#27272a;"));
	assert(css.endsWith("}\n"));
});

Deno.test("toCssString - uses custom selector", () => {
	const tokens = { "my-color-primary": "#27272a" };
	const css = toCssString(tokens, ":root.dark");
	assert(css.startsWith(":root.dark {"));
});

Deno.test("toCssString - groups tokens with blank lines between groups", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	const css = toCssString(tokens);
	// There should be blank lines between color groups
	assert(css.includes("\n\n"));
});

// --- generateThemeCss ---

Deno.test("generateThemeCss - generates :root for light mode", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert(css.includes(":root {"));
	assert(!css.includes(":root.dark"));
});

Deno.test("generateThemeCss - generates :root.dark for dark mode", () => {
	const schema: ThemeSchema = {
		light: minimalSchema,
		dark: minimalSchema,
	};
	const css = generateThemeCss(schema, PREFIX);
	assert(css.includes(":root {"));
	assert(css.includes(":root.dark {"));
});

Deno.test("generateThemeCss - only light mode when dark is undefined", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	const rootCount = css.split(":root").length - 1;
	assertEquals(rootCount, 1);
});
