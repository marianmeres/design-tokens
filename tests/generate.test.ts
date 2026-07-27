import { assert, assertEquals } from "@std/assert";
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

Deno.test("generateCssTokens - intent colors derive hover/active toward black in light mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(tokens["my-color-primary-hover"].includes("color-mix(in oklab,"));
	assert(tokens["my-color-primary-hover"].includes("var(--my-color-primary)"));
	assert(tokens["my-color-primary-hover"].includes("black 10%"));
	assert(tokens["my-color-primary-active"].includes("black 20%"));
});

Deno.test("generateCssTokens - intent colors derive hover/active toward white in dark mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert(tokens["my-color-primary-hover"].includes("white 10%"));
	assert(tokens["my-color-primary-active"].includes("white 20%"));
});

Deno.test("generateCssTokens - role paired colors derive hover/active toward foreground", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(
		tokens["my-color-muted-hover"].includes("var(--my-color-foreground) 10%"),
	);
	assert(
		tokens["my-color-muted-active"].includes("var(--my-color-foreground) 20%"),
	);
});

Deno.test("generateCssTokens - role paired colors stay foreground-targeted in dark mode", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert(
		tokens["my-color-muted-hover"].includes("var(--my-color-foreground) 10%"),
	);
	// Role bucket must never use black/white targets — guards against
	// accidental cross-bucket regression.
	assert(!tokens["my-color-muted-hover"].includes("black"));
	assert(!tokens["my-color-muted-hover"].includes("white"));
});

Deno.test("generateCssTokens - role single object colors derive toward foreground", () => {
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
	assert(
		tokens["my-color-input-hover"].includes("var(--my-color-foreground) 10%"),
	);
	assert(
		tokens["my-color-input-active"].includes("var(--my-color-foreground) 20%"),
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
	const css = generateThemeCss(schema, PREFIX, { fallback: "none" });
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
	// Dark mode flips the surface-intent foreground contrast mix from black to white.
	const tokens = generateCssTokens(minimalSchema, PREFIX, "dark");
	assert(tokens["my-color-surface-primary-foreground"].includes("white"));
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

// --- prettierIgnore option ---

Deno.test("generateThemeCss - prettierIgnore prepends pragma comment", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { prettierIgnore: true });
	assert(css.startsWith("/* prettier-ignore */\n"));
	assert(css.includes(":root"));
});

Deno.test("generateThemeCss - prettierIgnore sits outside @layer wrapper", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		cssLayer: "tokens",
	});
	assert(css.startsWith("/* prettier-ignore */\n@layer tokens {"));
});

Deno.test("generateThemeCss - no prettier-ignore comment by default", () => {
	const schema: ThemeSchema = { light: minimalSchema };
	const css = generateThemeCss(schema, PREFIX);
	assert(!css.includes("prettier-ignore"));
});

Deno.test("generateThemeCss - prettierIgnore marks each :root block separately when no cssLayer", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		fallback: "none",
	});
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assertEquals(pragmas.length, 2);
	assert(css.startsWith("/* prettier-ignore */\n:root {"));
	assert(css.includes("/* prettier-ignore */\n:root.dark {"));
});

Deno.test("generateThemeCss - prettierIgnore also marks the @supports fallback block", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, { prettierIgnore: true });
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assertEquals(pragmas.length, 3);
	assert(css.includes("/* prettier-ignore */\n@supports not "));
});

Deno.test("generateThemeCss - prettierIgnore with cssLayer + dark still emits a single pragma", () => {
	const schema: ThemeSchema = { light: minimalSchema, dark: minimalSchema };
	const css = generateThemeCss(schema, PREFIX, {
		prettierIgnore: true,
		cssLayer: "tokens",
	});
	const pragmas = css.match(/\/\* prettier-ignore \*\//g) ?? [];
	assertEquals(pragmas.length, 1);
	assert(css.startsWith("/* prettier-ignore */\n@layer tokens {"));
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

Deno.test("generateThemeCss - fallback defaults to 'supports'", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	assert(css.includes("@supports not (color: color-mix(in oklab, red, blue))"));
});

// A bare `@supports (color-mix(...))` is the <general-enclosed> production,
// which the spec requires to evaluate to false in every browser — it would
// hand the fallback to modern engines too. The guard must be a declaration
// test, and must be negated so the base block stays the modern one.
Deno.test("generateThemeCss - the @supports guard is a negated declaration test", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const guard = css.match(/@supports[^{]*/)![0].trim();
	assertEquals(guard, "@supports not (color: color-mix(in oklab, red, blue))");
});

Deno.test("generateThemeCss - fallback 'none' leaves output byte-identical to the pre-fallback generator", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { fallback: "none" });
	assert(!css.includes("@supports"));
	assert(css.includes("color-mix("));
});

Deno.test("generateThemeCss - fallback 'supports' keeps the base blocks identical to 'none'", () => {
	const none = generateThemeCss(themeSchema, PREFIX, { fallback: "none" });
	const supports = generateThemeCss(themeSchema, PREFIX, { fallback: "supports" });
	// Purely additive: the modern output must not shift at all.
	assert(supports.startsWith(none));
});

Deno.test("generateThemeCss - fallback 'static' emits zero color-mix", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { fallback: "static" });
	assertEquals(css.includes("color-mix("), false);
	assert(!css.includes("@supports"));
});

// The assertion that would have caught the original bug: deriveStates:false
// was documented as the escape hatch for engines without color-mix(), but two
// sources survive it — the surface-{intent} trio (derived regardless, since it
// is not a *state*) and author-supplied color-mix() values, which flow through
// verbatim and even propagate into the derived states of that token.
Deno.test("generateCssTokens - deriveStates=false does NOT remove color-mix", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX, { deriveStates: false });
	const withMix = Object.entries(tokens)
		.filter(([, v]) => v.includes("color-mix("))
		.map(([k]) => k);

	const surfaceIntent = withMix.filter((k) => /^my-color-surface-[a-z]+/.test(k));
	const authorSupplied = withMix.filter((k) => k.startsWith("my-color-ring"));

	// 5 intents x { surface, -foreground, -border }
	assertEquals(surfaceIntent.length, 15);
	// The schema's own `ring` literal, inherited by its flattened states.
	assertEquals(authorSupplied.length, 3);
	assertEquals(withMix.length, 18);
});

Deno.test("generateCssTokens - fallback 'static' removes every color-mix, including surface-intent", () => {
	for (const deriveStates of [true, false]) {
		const tokens = generateCssTokens(minimalSchema, PREFIX, {
			deriveStates,
			fallback: "static",
		});
		const withMix = Object.values(tokens).filter((v) => v.includes("color-mix("));
		assertEquals(withMix, [], `deriveStates: ${deriveStates}`);
	}
});

Deno.test("generateCssTokens - fallback defaults to 'none' on the record API", () => {
	const tokens = generateCssTokens(minimalSchema, PREFIX);
	assert(tokens["my-color-primary-hover"].includes("color-mix("));
});

// The two halves must not drift: every token the base block declares with a
// color-mix() value needs a literal in the fallback block, or it stays broken.
Deno.test("generateThemeCss - the @supports block covers every color-mix token, and nothing else", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	const base = css.slice(0, css.indexOf("@supports not "));

	const mixTokens = new Set(
		declarations(base).filter(([, v]) => v.includes("color-mix(")).map(([k]) => k),
	);
	const fallbackTokens = new Set(declarations(block).map(([k]) => k));

	assertEquals([...mixTokens].filter((k) => !fallbackTokens.has(k)), []);
	assertEquals([...fallbackTokens].filter((k) => !mixTokens.has(k)), []);
	assert(mixTokens.size > 0);
});

Deno.test("generateThemeCss - the @supports block itself contains no color-mix", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	assertEquals(block.slice(block.indexOf("{")).includes("color-mix("), false);
});

Deno.test("generateThemeCss - the @supports block covers both :root and :root.dark", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	const block = supportsBlock(css)!;
	assert(block.includes(":root {"));
	assert(block.includes(":root.dark {"));
});

// Source order is what makes the fallback win — @supports adds no specificity.
Deno.test("generateThemeCss - the @supports block is emitted last", () => {
	const css = generateThemeCss(themeSchema, PREFIX);
	assert(
		css.indexOf("@supports not ") >
			css.lastIndexOf(":root.dark {\n\t--my-color-primary:"),
	);
});

Deno.test("generateThemeCss - fallback and cssLayer compose (supports block nests inside the layer)", () => {
	const css = generateThemeCss(themeSchema, PREFIX, { cssLayer: "tokens" });
	assert(css.startsWith("@layer tokens {"));
	assert(css.includes("\t@supports not (color: color-mix(in oklab, red, blue)) {"));
	assert(css.trimEnd().endsWith("}"));
});

Deno.test("generateThemeCss - light-only theme still gets a fallback block", () => {
	const css = generateThemeCss({ light: minimalSchema }, PREFIX);
	const block = supportsBlock(css)!;
	assert(block.includes(":root {"));
	assert(!block.includes(":root.dark"));
});

// An author-supplied value the resolver can't evaluate must not silently
// become an approximation — it is simply absent from the fallback block.
Deno.test("generateThemeCss - unresolvable author values are omitted from the fallback, not approximated", () => {
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
	assert(css.includes("--my-color-ring:"));
	assert(!block.includes("--my-color-ring:"));
	// …and the rest of the theme is still covered.
	assert(block.includes("--my-color-primary-hover:"));
});

Deno.test("resolveStaticTokens - preserves plain var() indirection", () => {
	const resolved = resolveStaticTokens({
		"my-color-primary": "#27272a",
		"bs-primary": "var(--my-color-primary)",
		"my-color-primary-hover":
			"color-mix(in oklab, var(--my-color-primary), black 10%)",
	});
	assertEquals(resolved["bs-primary"], "var(--my-color-primary)");
	assertEquals(resolved["my-color-primary"], "#27272a");
	assert(!resolved["my-color-primary-hover"].includes("color-mix("));
});

Deno.test("resolveStaticOverrides - returns only the tokens that carried a color-mix", () => {
	const overrides = resolveStaticOverrides({
		a: "#27272a",
		b: "color-mix(in srgb, #ff0000, #0000ff)",
		c: "color-mix(in oklch, red, blue)",
	});
	assertEquals(Object.keys(overrides), ["b"]);
	assertEquals(overrides.b, "#800080");
});
