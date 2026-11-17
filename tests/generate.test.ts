import assert from "node:assert/strict";
import { test } from "node:test";
import {
	generateCssTokens,
	generateThemeCss,
	resolveStaticOverrides,
	resolveStaticTokens,
	toCssString,
} from "../src/generate.ts";
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

test("generateCssTokens - returns expected intent keys", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(tokens["my-color-primary"]);
	assert.ok(tokens["my-color-primary-hover"]);
	assert.ok(tokens["my-color-primary-active"]);
	assert.ok(tokens["my-color-primary-foreground"]);
	assert.ok(tokens["my-color-primary-foreground-hover"]);
	assert.ok(tokens["my-color-primary-foreground-active"]);
});

test("generateCssTokens - uses provided prefix", () => {
	const tokens = generateCssTokens(minimalSchema, "site-");
	assert.ok(tokens["site-color-primary"]);
	assert.ok(!tokens["my-color-primary"]);
});

test("generateCssTokens - empty prefix is valid", () => {
	const tokens = generateCssTokens(minimalSchema, "");
	assert.ok(tokens["color-primary"]);
	assert.deepStrictEqual(tokens["color-primary"], "#27272a");
});

test("generateCssTokens - intent colors derive hover/active toward black in light mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(tokens["my-color-primary-hover"].includes("color-mix(in oklab,"));
	assert.ok(tokens["my-color-primary-hover"].includes("var(--my-color-primary)"));
	assert.ok(tokens["my-color-primary-hover"].includes("black 10%"));
	assert.ok(tokens["my-color-primary-active"].includes("black 20%"));
});

test("generateCssTokens - intent colors derive hover/active toward white in dark mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert.ok(tokens["my-color-primary-hover"].includes("white 10%"));
	assert.ok(tokens["my-color-primary-active"].includes("white 20%"));
});

test("generateCssTokens - role paired colors derive hover/active toward foreground", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(
		tokens["my-color-muted-hover"].includes("var(--my-color-foreground) 10%"),
	);
	assert.ok(
		tokens["my-color-muted-active"].includes("var(--my-color-foreground) 20%"),
	);
});

test("generateCssTokens - role paired colors stay foreground-targeted in dark mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert.ok(
		tokens["my-color-muted-hover"].includes("var(--my-color-foreground) 10%"),
	);
	// Role bucket must never use black/white targets — guards against
	// accidental cross-bucket regression.
	assert.ok(!tokens["my-color-muted-hover"].includes("black"));
	assert.ok(!tokens["my-color-muted-hover"].includes("white"));
});

test("generateCssTokens - role single object colors derive toward foreground", () => {
	const schema: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			role: {
				...minimalSchema.colors.role,
				single: {
					...minimalSchema.colors.role.single,
					// Override the fixture's `input` (which has explicit hover) so
					// hover is auto-derived.
					input: { DEFAULT: "#fafafa" },
				},
			},
		},
	};
	const tokens = generateCssTokens(schema, PREFIX);
	assert.ok(
		tokens["my-color-input-hover"].includes("var(--my-color-foreground) 10%"),
	);
	assert.ok(
		tokens["my-color-input-active"].includes("var(--my-color-foreground) 20%"),
	);
});

test("generateCssTokens - uses explicit hover/active when provided", () => {
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
	assert.deepStrictEqual(tokens["my-color-primary-hover"], "#custom-hover");
	assert.deepStrictEqual(tokens["my-color-primary-active"], "#custom-active");
});

test("generateCssTokens - generates surface-intent tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(tokens["my-color-surface-primary"]);
	assert.ok(tokens["my-color-surface-primary-foreground"]);
	assert.ok(tokens["my-color-surface-primary-border"]);
	// Verify surface tokens reference the prefix correctly
	assert.ok(
		tokens["my-color-surface-primary"].includes(
			"var(--my-color-primary)",
		),
	);
	assert.ok(
		tokens["my-color-surface-primary"].includes(
			"var(--my-color-background)",
		),
	);
});

test("generateCssTokens - generates role paired tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.deepStrictEqual(tokens["my-color-background"], "#fafafa");
	assert.deepStrictEqual(tokens["my-color-background-foreground"], "#18181b");
	assert.deepStrictEqual(tokens["my-color-muted"], "#f4f4f5");
});

test("generateCssTokens - background has no auto-derived hover/active", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	// Background pair has no hover/active defined, so they default to DEFAULT
	assert.deepStrictEqual(tokens["my-color-background-hover"], "#fafafa");
	assert.deepStrictEqual(tokens["my-color-background-active"], "#fafafa");
});

test("generateCssTokens - generates role single tokens", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.deepStrictEqual(tokens["my-color-foreground"], "#18181b");
	assert.deepStrictEqual(tokens["my-color-border"], "#d4d4d8");
	assert.deepStrictEqual(tokens["my-color-input"], "#fafafa");
	assert.deepStrictEqual(tokens["my-color-input-hover"], "#f4f4f5");
	assert.deepStrictEqual(
		tokens["my-color-ring"],
		"color-mix(in srgb, #27272a 20%, transparent)",
	);
});

// --- toCssString ---

test("toCssString - returns valid CSS block with selector", () => {
	const tokens = { "my-color-primary": "#27272a" };
	const css = toCssString(tokens);
	assert.ok(css.startsWith(":root {"));
	assert.ok(css.includes("--my-color-primary:"));
	assert.ok(css.includes("#27272a;"));
	assert.ok(css.endsWith("}\n"));
});

test("toCssString - uses custom selector", () => {
	const tokens = { "my-color-primary": "#27272a" };
	const css = toCssString(tokens, ":root.dark");
	assert.ok(css.startsWith(":root.dark {"));
});

test("toCssString - groups tokens with blank lines between groups", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	const css = toCssString(tokens);
	// There should be blank lines between color groups
	assert.ok(css.includes("\n\n"));
});

// --- generateThemeCss ---

test("generateThemeCss - generates :root for light mode", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert.ok(css.includes(":root {"));
	assert.ok(!css.includes(":root.dark"));
});

test("generateThemeCss - generates :root.dark for dark mode", () => {
	const schema: ThemeSchema = {
		light: minimalSchema,
		dark: minimalSchema,
	};
	const css = generateThemeCss(schema, PREFIX);
	assert.ok(css.includes(":root {"));
	assert.ok(css.includes(":root.dark {"));
});

test("generateThemeCss - only light mode when dark is undefined", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { fallback: "none" });
	const rootCount = css.split(":root").length - 1;
	assert.deepStrictEqual(rootCount, 1);
});

// --- prefix normalization (I3) ---

test("generateCssTokens - prefix without trailing dash is normalized", () => {
	const tokens = generateCssTokens(minimalSchema, "app");
	assert.deepStrictEqual(tokens["app-color-primary"], "#27272a");
	assert.ok(!tokens["appcolor-primary"]);
});

test("generateCssTokens - prefix with trailing dash is preserved", () => {
	const tokens = generateCssTokens(minimalSchema, "app-");
	assert.deepStrictEqual(tokens["app-color-primary"], "#27272a");
});

test("generateCssTokens - empty prefix produces unprefixed tokens", () => {
	const tokens = generateCssTokens(minimalSchema, "");
	assert.ok(tokens["color-primary"]);
	assert.ok(!tokens["-color-primary"]);
});

// --- deriveStates option (I1) ---

test("generateCssTokens - deriveStates=false makes states fall back to DEFAULT", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		deriveStates: false,
	});
	assert.deepStrictEqual(tokens["my-color-primary-hover"], "#27272a");
	assert.deepStrictEqual(tokens["my-color-primary-active"], "#27272a");
	assert.ok(!tokens["my-color-primary-hover"].includes("color-mix"));
});

test("generateCssTokens - deriveStates=true (default) produces color-mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		deriveStates: true,
	});
	assert.ok(tokens["my-color-primary-hover"].includes("color-mix"));
});

test("generateCssTokens - mode string shorthand still works", () => {
	// Dark mode flips the surface-intent foreground contrast mix from black to white.
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert.ok(tokens["my-color-surface-primary-foreground"].includes("white"));
});

// --- surfaceForegroundContrast (D2) ---

test("generateCssTokens - default surface-intent-foreground uses 50% mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(tokens["my-color-surface-primary-foreground"].includes("50%"));
});

test("generateCssTokens - surface-intent-foreground contrast is configurable", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, {
		surfaceForegroundContrast: 75,
	});
	assert.ok(tokens["my-color-surface-primary-foreground"].includes("75%"));
});

// --- foregroundHover/foregroundActive (D1) ---

test("generateCssTokens - foregroundHover/Active default to foreground", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.deepStrictEqual(tokens["my-color-primary-foreground-hover"], "#ffffff");
	assert.deepStrictEqual(tokens["my-color-primary-foreground-active"], "#ffffff");
});

test("generateCssTokens - explicit foregroundHover/Active are respected", () => {
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
	assert.deepStrictEqual(tokens["my-color-primary-foreground-hover"], "#eeeeee");
	assert.deepStrictEqual(tokens["my-color-primary-foreground-active"], "#dddddd");
});

// --- surface-1 support (B1) ---

test("generateCssTokens - surface-1 paired token is auto-derived", () => {
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
	assert.deepStrictEqual(tokens["my-color-surface-1"], "#d4d4d8");
	assert.ok(tokens["my-color-surface-1-hover"].includes("color-mix"));
});

// --- token grouping (B7) ---

test("toCssString - surface-1 and surface group together", () => {
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
	assert.ok(surfaceIdx > 0 && surface1Idx > 0 && surfacePrimaryIdx > 0);
	const block = css.substring(
		Math.min(surfaceIdx, surface1Idx, surfacePrimaryIdx),
		Math.max(surfaceIdx, surface1Idx, surfacePrimaryIdx) + 50,
	);
	assert.ok(
		!block.includes("\n\n"),
		"surface-* tokens should not be separated by blank lines",
	);
});

// --- cssLayer option (I8) ---

test("generateThemeCss - cssLayer wraps output in @layer", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { cssLayer: "tokens" });
	assert.ok(css.startsWith("@layer tokens {"));
	assert.ok(css.trimEnd().endsWith("}"));
	assert.ok(css.includes(":root"));
});

test("generateThemeCss - no cssLayer by default", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert.ok(!css.includes("@layer"));
});

// --- prettierIgnore option ---

test("generateThemeCss - prettierIgnore prepends pragma comment", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { prettierIgnore: true });
	assert.ok(css.startsWith("/* prettier-ignore */\n"));
	assert.ok(css.includes(":root"));
});

test("generateThemeCss - prettierIgnore sits outside @layer wrapper", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		cssLayer: "tokens",
	});
	assert.ok(css.startsWith("/* prettier-ignore */\n@layer tokens {"));
});

test("generateThemeCss - no prettier-ignore comment by default", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert.ok(!css.includes("prettier-ignore"));
});

test("generateThemeCss - prettierIgnore marks each :root block separately when no cssLayer", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		fallback: "none",
	});
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assert.deepStrictEqual(pragmas.length, 2);
	assert.ok(css.startsWith("/* prettier-ignore */\n:root {"));
	assert.ok(css.includes("/* prettier-ignore */\n:root.dark {"));
});

test("generateThemeCss - prettierIgnore also marks the @supports fallback block", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { prettierIgnore: true });
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assert.deepStrictEqual(pragmas.length, 3);
	assert.ok(css.includes("/* prettier-ignore */\n@supports not "));
});

test("generateThemeCss - prettierIgnore with cssLayer + dark still emits a single pragma", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		cssLayer: "tokens",
	});
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assert.deepStrictEqual(pragmas.length, 1);
	assert.ok(css.startsWith("/* prettier-ignore */\n@layer tokens {"));
});

// --- legacy fallback (color-mix support) ---

/** Every `--x: value;` declaration in a CSS string, as a [name, value] list. */
function declarations(css: string): [string, string][] {
	return [...css.matchAll(/^\s*--([\w-]+):\s*(.+);$/gm)].map((
		m,
	) => [m[1], m[2].trim()]);
}

/** The declarations inside the `@supports not (...)` block, if present. */
function supportsBlock(css: string): string | null {
	const i = css.indexOf("@supports not ");
	return i === -1 ? null : css.slice(i);
}

const themeSchema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };

test("generateThemeCss - fallback defaults to 'supports'", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	assert.ok(css.includes("@supports not (color: color-mix(in oklab, red, blue))"));
});

// A bare `@supports (color-mix(...))` is the <general-enclosed> production,
// which the spec requires to evaluate to false in every browser — it would
// hand the fallback to modern engines too. The guard must be a declaration
// test, and must be negated so the base block stays the modern one.
test("generateThemeCss - the @supports guard is a negated declaration test", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const guard = css.match(/@supports[^{]*/)![0].trim();
	assert.deepStrictEqual(guard, "@supports not (color: color-mix(in oklab, red, blue))");
});

test("generateThemeCss - fallback 'none' leaves output byte-identical to the pre-fallback generator", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { fallback: "none" });
	assert.ok(!css.includes("@supports"));
	assert.ok(css.includes("color-mix("));
});

test("generateThemeCss - fallback 'supports' keeps the base blocks identical to 'none'", () => {
	const none = generateThemeCss(themeSchema, PREFIX, { fallback: "none" });
	const supports = generateThemeCss(themeSchema, PREFIX, { fallback: "supports" });
	// Purely additive: the modern output must not shift at all.
	assert.ok(supports.startsWith(none));
});

test("generateThemeCss - fallback 'static' emits zero color-mix", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { fallback: "static" });
	assert.deepStrictEqual(css.includes("color-mix("), false);
	assert.ok(!css.includes("@supports"));
});

// The assertion that would have caught the original bug: deriveStates:false
// was documented as the escape hatch for engines without color-mix(), but two
// sources survive it — the surface-{intent} trio (derived regardless, since it
// is not a *state*) and author-supplied color-mix() values, which flow through
// verbatim and even propagate into the derived states of that token.
test("generateCssTokens - deriveStates=false does NOT remove color-mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, { deriveStates: false });
	const withMix = Object.entries(tokens)
		.filter(([, v]) => v.includes("color-mix("))
		.map(([k]) => k);

	const surfaceIntent = withMix.filter((k) => /^my-color-surface-[a-z]+/.test(k));
	const authorSupplied = withMix.filter((k) => k.startsWith("my-color-ring"));

	// 5 intents x { surface, -foreground, -border }
	assert.deepStrictEqual(surfaceIntent.length, 15);
	// The schema's own `ring` literal, inherited by its flattened states.
	assert.deepStrictEqual(authorSupplied.length, 3);
	assert.deepStrictEqual(withMix.length, 18);
});

test("generateCssTokens - fallback 'static' removes every color-mix, including surface-intent", () => {
	for (const deriveStates of [true, false]) {
		const tokens = generateCssTokens(minimalSchema, PREFIX, {
			deriveStates,
			fallback: "static",
		});
		const withMix = Object.values(tokens).filter((v) => v.includes("color-mix("));
		assert.deepStrictEqual(withMix, [], `deriveStates: ${deriveStates}`);
	}
});

test("generateCssTokens - fallback defaults to 'none' on the record API", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert.ok(tokens["my-color-primary-hover"].includes("color-mix("));
});

// The two halves must not drift: every token the base block declares with a
// color-mix() value needs a literal in the fallback block, or it stays broken.
test("generateThemeCss - the @supports block covers every color-mix token, and nothing else", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	const base = css.slice(0, css.indexOf("@supports not "));

	const mixTokens = new Set(
		declarations(base).filter(([, v]) => v.includes("color-mix(")).map(([k]) => k),
	);
	const fallbackTokens = new Set(declarations(block).map(([k]) => k));

	assert.deepStrictEqual([...mixTokens].filter((k) => !fallbackTokens.has(k)), []);
	assert.deepStrictEqual([...fallbackTokens].filter((k) => !mixTokens.has(k)), []);
	assert.ok(mixTokens.size > 0);
});

test("generateThemeCss - the @supports block itself contains no color-mix", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	assert.deepStrictEqual(block.slice(block.indexOf("{")).includes("color-mix("), false);
});

test("generateThemeCss - the @supports block covers both :root and :root.dark", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	assert.ok(block.includes(":root {"));
	assert.ok(block.includes(":root.dark {"));
});

// Source order is what makes the fallback win — @supports adds no specificity.
test("generateThemeCss - the @supports block is emitted last", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	assert.ok(
		css.indexOf("@supports not ") >
			css.lastIndexOf(":root.dark {\n\t--my-color-primary:"),
	);
});

test("generateThemeCss - fallback and cssLayer compose (supports block nests inside the layer)", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { cssLayer: "tokens" });
	assert.ok(css.startsWith("@layer tokens {"));
	assert.ok(css.includes("\t@supports not (color: color-mix(in oklab, red, blue)) {"));
	assert.ok(css.trimEnd().endsWith("}"));
});

test("generateThemeCss - light-only theme still gets a fallback block", () => {
	const css = generateThemeCss({ light: minimalSchema }, PREFIX);
	const block = supportsBlock(css)!;
	assert.ok(block.includes(":root {"));
	assert.ok(!block.includes(":root.dark"));
});

// An author-supplied value the resolver can't evaluate must not silently
// become an approximation — it is simply absent from the fallback block.
test("generateThemeCss - unresolvable author values are omitted from the fallback, not approximated", () => {
	const exotic: TokenSchema = {
		...minimalSchema,
		colors: {
			...minimalSchema.colors,
			role: {
				...minimalSchema.colors.role,
				single: {
					...minimalSchema.colors.role.single,
					ring: "color-mix(in oklch, currentColor, black)",
				},
			},
		},
	};
	const css = generateThemeCss({ light: exotic }, PREFIX);
	const block = supportsBlock(css)!;
	assert.ok(css.includes("--my-color-ring:"));
	assert.ok(!block.includes("--my-color-ring:"));
	// …and the rest of the theme is still covered.
	assert.ok(block.includes("--my-color-primary-hover:"));
});

test("resolveStaticTokens - preserves plain var() indirection", () => {
	const resolved = resolveStaticTokens({
		"my-color-primary": "#27272a",
		"bs-primary": "var(--my-color-primary)",
		"my-color-primary-hover":
			"color-mix(in oklab, var(--my-color-primary), black 10%)",
	});
	assert.deepStrictEqual(resolved["bs-primary"], "var(--my-color-primary)");
	assert.deepStrictEqual(resolved["my-color-primary"], "#27272a");
	assert.ok(!resolved["my-color-primary-hover"].includes("color-mix("));
});

test("resolveStaticOverrides - returns only the tokens that carried a color-mix", () => {
	const overrides = resolveStaticOverrides({
		a: "#27272a",
		b: "color-mix(in srgb, #ff0000, #0000ff)",
		c: "color-mix(in oklch, red, blue)",
	});
	assert.deepStrictEqual(Object.keys(overrides), ["b"]);
	assert.deepStrictEqual(overrides.b, "#800080");
});
