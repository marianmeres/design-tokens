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

// --- prefix normalization (I3) ---

Deno.test("generateCssTokens - prefix without trailing dash is normalized", () => {
	const tokens = generateCssTokens(minimalSchema, "app");
	assertEquals(tokens["app-color-primary"], "#27272a");
	assert(!tokens["appcolor-primary"]);
});

Deno.test("generateCssTokens - prefix with trailing dash is preserved", () => {
	const tokens = generateCssTokens(minimalSchema, "app-");
	assertEquals(tokens["app-color-primary"], "#27272a");
});

Deno.test("generateCssTokens - empty prefix produces unprefixed tokens", () => {
	const tokens = generateCssTokens(minimalSchema, "");
	assert(tokens["color-primary"]);
	assert(!tokens["-color-primary"]);
});

// --- deriveStates option (I1) ---

Deno.test("generateCssTokens - deriveStates=false makes states fall back to DEFAULT", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		deriveStates: false,
	});
	assertEquals(tokens["my-color-primary-hover"], "#27272a");
	assertEquals(tokens["my-color-primary-active"], "#27272a");
	assert(!tokens["my-color-primary-hover"].includes("color-mix"));
});

Deno.test("generateCssTokens - deriveStates=true (default) produces color-mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		deriveStates: true,
	});
	assert(tokens["my-color-primary-hover"].includes("color-mix"));
});

Deno.test("generateCssTokens - mode string shorthand still works", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert(tokens["my-color-primary-hover"].includes("white"));
});

// --- surfaceForegroundContrast (D2) ---

Deno.test("generateCssTokens - default surface-intent-foreground uses 50% mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(tokens["my-color-surface-primary-foreground"].includes("50%"));
});

Deno.test("generateCssTokens - surface-intent-foreground contrast is configurable", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		surfaceForegroundContrast: 75,
	});
	assert(tokens["my-color-surface-primary-foreground"].includes("75%"));
});

// --- foregroundHover/foregroundActive (D1) ---

Deno.test("generateCssTokens - foregroundHover/Active default to foreground", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assertEquals(tokens["my-color-primary-foreground-hover"], "#ffffff");
	assertEquals(tokens["my-color-primary-foreground-active"], "#ffffff");
});

Deno.test("generateCssTokens - explicit foregroundHover/Active are respected", () => {
	const schema: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			intent: {
				...minimalSchema.colors.intent,
				primary: {
					DEFAULT: "#27272a",
					foreground: "#ffffff",
					foregroundHover: "#eeeeee",
					foregroundActive: "#dddddd",
				},
			},
		},
	};
	const tokens = generateCssTokens(schema, PREFIX);
	assertEquals(tokens["my-color-primary-foreground-hover"], "#eeeeee");
	assertEquals(tokens["my-color-primary-foreground-active"], "#dddddd");
});

// --- surface-1 support (B1) ---

Deno.test("generateCssTokens - surface-1 paired token is auto-derived", () => {
	const schema: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			role: {
				...minimalSchema.colors.role,
				paired: {
					...minimalSchema.colors.role.paired,
					"surface-1": { DEFAULT: "#d4d4d8", foreground: "#18181b" },
				},
			},
		},
	};
	const tokens = generateCssTokens(schema, PREFIX);
	assertEquals(tokens["my-color-surface-1"], "#d4d4d8");
	assert(tokens["my-color-surface-1-hover"].includes("color-mix"));
});

// --- token grouping (B7) ---

Deno.test("toCssString - surface-1 and surface group together", () => {
	const schema: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			role: {
				...minimalSchema.colors.role,
				paired: {
					...minimalSchema.colors.role.paired,
					"surface-1": { DEFAULT: "#d4d4d8", foreground: "#18181b" },
				},
			},
		},
	};
	const tokens = generateCssTokens(schema, PREFIX);
	const css = toCssString(tokens);
	// surface, surface-primary, surface-1 should all be within one contiguous
	// group (no blank line between them).
	const surfaceIdx = css.indexOf("--my-color-surface:");
	const surface1Idx = css.indexOf("--my-color-surface-1:");
	const surfacePrimaryIdx = css.indexOf("--my-color-surface-primary:");
	assert(surfaceIdx > 0 && surface1Idx > 0 && surfacePrimaryIdx > 0);
	const block = css.substring(
		Math.min(surfaceIdx, surface1Idx, surfacePrimaryIdx),
		Math.max(surfaceIdx, surface1Idx, surfacePrimaryIdx) + 50,
	);
	assert(
		!block.includes("\n\n"),
		"surface-* tokens should not be separated by blank lines",
	);
});

// --- cssLayer option (I8) ---

Deno.test("generateThemeCss - cssLayer wraps output in @layer", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { cssLayer: "tokens" });
	assert(css.startsWith("@layer tokens {"));
	assert(css.trimEnd().endsWith("}"));
	assert(css.includes(":root"));
});

Deno.test("generateThemeCss - no cssLayer by default", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert(!css.includes("@layer"));
});
