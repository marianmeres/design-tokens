import { assert, assertEquals, assertThrows } from "@std/assert";
import { generateThemeCss } from "../src/generate.ts";
import { mergeThemeSchema } from "../src/merge.ts";
import type { ThemeSchema, ThemeSchemaOverrides } from "../src/types.ts";
import { bundledThemeNames, getBundledTheme } from "../src/themes/mod.ts";

const PREFIX = "my-";

/** A base with *explicit* states, so tests can observe leaf replacement. */
const base: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: {
					DEFAULT: "#27272a",
					foreground: "#ffffff",
					hover: "#3f3f46",
					active: "#52525b",
					foregroundHover: "#fafafa",
				},
				accent: { DEFAULT: "#71717a", foreground: "#ffffff" },
				destructive: { DEFAULT: "#e11d48", foreground: "#ffffff" },
				warning: { DEFAULT: "#f59e0b", foreground: "#000000" },
				success: { DEFAULT: "#059669", foreground: "#ffffff" },
			},
			role: {
				paired: {
					background: { DEFAULT: "#fafafa", foreground: "#18181b" },
					muted: { DEFAULT: "#f4f4f5", foreground: "#71717a" },
					surface: { DEFAULT: "#e4e4e7", foreground: "#18181b" },
				},
				single: {
					foreground: "#18181b",
					border: { DEFAULT: "#d4d4d8", hover: "#a1a1aa" },
					input: { DEFAULT: "#fafafa" },
					ring: "#27272a",
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: "#fafafa", foreground: "#18181b" },
				accent: { DEFAULT: "#a1a1aa", foreground: "#18181b" },
				destructive: { DEFAULT: "#fb7185", foreground: "#18181b" },
				warning: { DEFAULT: "#fbbf24", foreground: "#18181b" },
				success: { DEFAULT: "#34d399", foreground: "#18181b" },
			},
			role: {
				paired: {
					background: { DEFAULT: "#18181b", foreground: "#fafafa" },
					muted: { DEFAULT: "#27272a", foreground: "#a1a1aa" },
					surface: { DEFAULT: "#3f3f46", foreground: "#fafafa" },
				},
				single: {
					foreground: "#fafafa",
					border: { DEFAULT: "#3f3f46" },
					input: { DEFAULT: "#18181b" },
					ring: "#fafafa",
				},
			},
		},
	},
};

function danglingRefs(css: string): string[] {
	const declared = new Set(
		[...css.matchAll(/--([a-z0-9-]+)\s*:/g)].map((m) => m[1]),
	);
	const referenced = new Set(
		[...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]),
	);
	return [...referenced].filter((r) => !declared.has(r));
}

// --- identity / round-trip ---

Deno.test("mergeThemeSchema - empty overrides round-trip all bundled themes byte-identically", () => {
	for (const name of bundledThemeNames) {
		const theme = getBundledTheme(name)!;
		const merged = mergeThemeSchema(theme, {});
		assertEquals(
			generateThemeCss(merged, "stuic-", { prettierIgnore: true }),
			generateThemeCss(theme, "stuic-", { prettierIgnore: true }),
			name,
		);
	}
});

Deno.test("mergeThemeSchema - absent and empty override modes yield the base mode unchanged", () => {
	// The `dark: {}` scaffold shape: harmless here, base dark survives intact.
	const merged = mergeThemeSchema(base, { dark: {} });
	assertEquals(merged.light, base.light);
	assertEquals(merged.dark, base.dark);
});

Deno.test("mergeThemeSchema - never mutates the base", () => {
	const snapshot = JSON.stringify(base);
	const merged = mergeThemeSchema(base, {
		light: {
			colors: {
				intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
			},
		},
	});
	merged.light.colors.intent.primary.DEFAULT = "#000000";
	merged.light.colors.role.paired.muted.DEFAULT = "#000000";
	assertEquals(JSON.stringify(base), snapshot);
});

// --- leaf replacement semantics ---

Deno.test("mergeThemeSchema - replaces a whole ColorPair; base's explicit states are gone, not inherited", () => {
	const merged = mergeThemeSchema(base, {
		light: {
			colors: {
				intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
			},
		},
	});
	const primary = merged.light.colors.intent.primary;
	assertEquals(primary, { DEFAULT: "#4f46e5", foreground: "#ffffff" });
	assertEquals(primary.hover, undefined);
	assertEquals(primary.foregroundHover, undefined);
	// Untouched siblings survive.
	assertEquals(merged.light.colors.intent.accent, base.light.colors.intent.accent);
});

Deno.test("mergeThemeSchema - role.single ColorValue → ColorValue replaces (stale hover gone)", () => {
	const merged = mergeThemeSchema(base, {
		light: { colors: { role: { single: { border: { DEFAULT: "#cccccc" } } } } },
	});
	assertEquals(merged.light.colors.role.single.border, { DEFAULT: "#cccccc" });
});

Deno.test("mergeThemeSchema - role.single string ↔ ColorValue swaps cleanly in both directions", () => {
	const toObject = mergeThemeSchema(base, {
		light: {
			colors: {
				role: {
					single: { foreground: { DEFAULT: "#111111", hover: "#222222" } },
				},
			},
		},
	});
	assertEquals(toObject.light.colors.role.single.foreground, {
		DEFAULT: "#111111",
		hover: "#222222",
	});

	const toString = mergeThemeSchema(base, {
		light: { colors: { role: { single: { border: "#cccccc" } } } },
	});
	assertEquals(toString.light.colors.role.single.border, "#cccccc");
});

// --- typo protection ---

Deno.test("mergeThemeSchema - typo'd key in an override literal is a compile error (TS2561)", () => {
	const overrides: ThemeSchemaOverrides = {
		light: {
			colors: {
				intent: {
					// @ts-expect-error 'primry' does not exist in type — the
					// excess property check is the point; if ThemeSchemaOverrides
					// ever grows an index signature this suppression turns
					// unused and fails the check.
					primry: { DEFAULT: "#4f46e5", foreground: "#ffffff" },
				},
			},
		},
	};
	assertThrows(() => mergeThemeSchema(base, overrides));
});

Deno.test("mergeThemeSchema - a key the base does not have throws at runtime (JSON path)", () => {
	const overrides = JSON.parse(
		`{"light":{"colors":{"intent":{"primry":{"DEFAULT":"#4f46e5","foreground":"#ffffff"}}}}}`,
	) as ThemeSchemaOverrides;
	assertThrows(
		() => mergeThemeSchema(base, overrides),
		Error,
		`"light.colors.intent.primry" does not exist in the base theme`,
	);
});

Deno.test("mergeThemeSchema - unknown container keys throw with their path", () => {
	assertThrows(
		() =>
			mergeThemeSchema(
				base,
				JSON.parse(`{"lite":{}}`) as ThemeSchemaOverrides,
			),
		Error,
		`unknown key "overrides.lite"`,
	);
	assertThrows(
		() =>
			mergeThemeSchema(
				base,
				JSON.parse(`{"light":{"colours":{}}}`) as ThemeSchemaOverrides,
			),
		Error,
		`unknown key "light.colours"`,
	);
});

Deno.test("mergeThemeSchema - prototype-chain key names cannot bypass the no-minting guard", () => {
	// `in` would see these on Object.prototype; the guard must use own keys
	// only ("__proto__" would additionally fire the real setter on Node).
	for (
		const hostile of [
			`{"light":{"colors":{"intent":{"constructor":{"DEFAULT":"#f00","foreground":"#fff"}}}}}`,
			`{"light":{"colors":{"role":{"single":{"toString":"#123456"}}}}}`,
			`{"light":{"colors":{"intent":{"__proto__":{"DEFAULT":"#f00","foreground":"#fff"}}}}}`,
		]
	) {
		assertThrows(
			() => mergeThemeSchema(base, JSON.parse(hostile) as ThemeSchemaOverrides),
			Error,
			"does not exist in the base theme",
		);
	}
});

// --- mode edge cases ---

Deno.test("mergeThemeSchema - dark overrides against a light-only base throw", () => {
	const lightOnly: ThemeSchema = { light: base.light };
	assertThrows(
		() =>
			mergeThemeSchema(lightOnly, {
				dark: {
					colors: {
						intent: {
							primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" },
						},
					},
				},
			}),
		Error,
		"base theme has no dark mode",
	);
});

Deno.test("mergeThemeSchema - empty dark override against a light-only base is a no-op, not an error", () => {
	const lightOnly: ThemeSchema = { light: base.light };
	const merged = mergeThemeSchema(lightOnly, { dark: {} });
	assertEquals(merged.light, base.light);
	assert(!("dark" in merged));
});

Deno.test("mergeThemeSchema - light-only base without dark overrides merges fine and stays light-only", () => {
	const lightOnly: ThemeSchema = { light: base.light };
	const merged = mergeThemeSchema(lightOnly, {
		light: {
			colors: {
				intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
			},
		},
	});
	assert(!("dark" in merged));
});

// --- merged output quality ---

Deno.test("mergeThemeSchema - merged output has zero dangling var refs (audit)", () => {
	const merged = mergeThemeSchema(getBundledTheme("amberOliveSafari")!, {
		light: {
			colors: {
				intent: { primary: { DEFAULT: "#4f46e5", foreground: "#ffffff" } },
			},
		},
	});
	const css = generateThemeCss(merged, "stuic-");
	assert(css.includes("#4f46e5"));
	assertEquals(danglingRefs(css), []);
});

Deno.test("mergeThemeSchema - overriding an override-typed leaf still generates with the chosen prefix", () => {
	const merged = mergeThemeSchema(base, {
		dark: {
			colors: {
				role: {
					paired: {
						background: { DEFAULT: "#000000", foreground: "#ffffff" },
					},
				},
			},
		},
	});
	const css = generateThemeCss(merged, PREFIX);
	assert(css.includes(":root.dark"));
	assert(css.includes("#000000"));
	assertEquals(danglingRefs(css), []);
});
