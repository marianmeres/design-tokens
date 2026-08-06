import { assert, assertEquals, assertThrows } from "@std/assert";
import { generateCssTokens, generateThemeCss } from "../src/generate.ts";
import type { ThemeSchema, TokenSchema } from "../src/types.ts";

const P = { DEFAULT: "#4f46e5", foreground: "#ffffff" };

const completeMode: TokenSchema = {
	colors: {
		intent: {
			primary: P,
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
				border: "#d4d4d8",
				input: "#fafafa",
				ring: "#27272a",
			},
		},
	},
};

// --- class (a): missing containers throw naming the path ---

Deno.test("validation - each missing container is named, not a TypeError", () => {
	const cases: [unknown, string][] = [
		[{}, `"colors" is missing`],
		[{ colors: {} }, `"colors.intent" is missing`],
		[{ colors: { intent: { primary: P } } }, `"colors.role" is missing`],
		[
			{ colors: { intent: { primary: P }, role: {} } },
			`"colors.role.paired" is missing`,
		],
		[
			{ colors: { intent: { primary: P }, role: { paired: {} } } },
			`"colors.role.single" is missing`,
		],
	];
	for (const [schema, expected] of cases) {
		assertThrows(
			() => generateCssTokens(schema as TokenSchema, "my-"),
			Error,
			expected,
		);
	}
});

Deno.test("validation - generateThemeCss names the mode the error came from", () => {
	assertThrows(
		() => generateThemeCss({ light: {} } as ThemeSchema, "my-"),
		Error,
		`[light] Invalid TokenSchema: "colors" is missing`,
	);
	// The scaffolds' `dark: {}` shape — used to throw `…(reading 'intent')`
	// the moment `light` was filled in.
	assertThrows(
		() =>
			generateThemeCss(
				{ light: completeMode, dark: {} } as ThemeSchema,
				"my-",
			),
		Error,
		`[dark] Invalid TokenSchema: "colors" is missing`,
	);
});

Deno.test("validation - a nullish theme names the ThemeSchema shape", () => {
	assertThrows(
		() => generateThemeCss({} as ThemeSchema, "my-"),
		Error,
		"Invalid ThemeSchema",
	);
	assertThrows(
		() => generateThemeCss(null as unknown as ThemeSchema, "my-"),
		Error,
		"Invalid ThemeSchema",
	);
});

// --- class (b): broken leaves throw naming path + key, in every fallback mode ---

Deno.test("validation - a ColorPair missing foreground names the path and key", () => {
	const schema = {
		...completeMode,
		colors: {
			...completeMode.colors,
			intent: { ...completeMode.colors.intent, primary: { DEFAULT: "#000" } },
		},
	} as unknown as TokenSchema;
	for (const fallback of ["none", "static"] as const) {
		assertThrows(
			() => generateCssTokens(schema, "my-", { fallback }),
			Error,
			`"colors.intent.primary" must declare a string "foreground" (got undefined)`,
		);
	}
});

Deno.test("validation - non-string leaves are named with their actual value", () => {
	const withBadDefault = structuredClone(completeMode) as unknown as {
		colors: { intent: Record<string, unknown> };
	};
	withBadDefault.colors.intent.primary = { DEFAULT: 5, foreground: "#fff" };
	assertThrows(
		() => generateCssTokens(withBadDefault as unknown as TokenSchema, "my-"),
		Error,
		`"colors.intent.primary" must declare a string "DEFAULT" (got 5)`,
	);

	const withNullSingle = structuredClone(completeMode) as unknown as {
		colors: { role: { single: Record<string, unknown> } };
	};
	withNullSingle.colors.role.single.border = null;
	assertThrows(
		() => generateCssTokens(withNullSingle as unknown as TokenSchema, "my-"),
		Error,
		`"colors.role.single.border" must be a string or an object with a string "DEFAULT" (got null)`,
	);

	const withEmptySingle = structuredClone(completeMode) as unknown as {
		colors: { role: { single: Record<string, unknown> } };
	};
	withEmptySingle.colors.role.single.border = {};
	assertThrows(
		() => generateCssTokens(withEmptySingle as unknown as TokenSchema, "my-"),
		Error,
		`"colors.role.single.border" must be a string or an object`,
	);
});

Deno.test("validation - non-string optional state fields are rejected, null is tolerated", () => {
	const withState = (state: unknown): TokenSchema => {
		const s = structuredClone(completeMode) as unknown as {
			colors: { intent: Record<string, unknown> };
		};
		s.colors.intent.primary = {
			DEFAULT: "#4f46e5",
			foreground: "#fff",
			hover: state,
		};
		return s as unknown as TokenSchema;
	};
	// A number would emit `--x: 5;`; an object would emit `--x: [object Object];`
	// — or crash the static resolver with `value.includes is not a function`.
	for (const bad of [5, {}, [], true]) {
		assertThrows(
			() => generateCssTokens(withState(bad), "my-"),
			Error,
			`"colors.intent.primary.hover" must be a string when present`,
		);
	}
	// Through generateThemeCss (default "supports" fallback, where the crash
	// used to surface) the error carries the mode prefix.
	assertThrows(
		() => generateThemeCss({ light: withState(5) }, "my-"),
		Error,
		`[light] Invalid TokenSchema: "colors.intent.primary.hover"`,
	);
	// `null` degrades via `??` everywhere, so it stays legal — and the output
	// record stays all-strings.
	const tokens = generateCssTokens(withState(null), "my-");
	assertEquals(tokens["my-color-primary-hover"].includes("color-mix("), true);

	// Same guard on role single object states.
	const singleBad = structuredClone(completeMode) as unknown as {
		colors: { role: { single: Record<string, unknown> } };
	};
	singleBad.colors.role.single.border = { DEFAULT: "#d4d4d8", hover: 42 };
	assertThrows(
		() => generateCssTokens(singleBad as unknown as TokenSchema, "my-"),
		Error,
		`"colors.role.single.border.hover" must be a string when present`,
	);
});

// --- class (c): the two operands ---

Deno.test("validation - sparse schema with intents but no background throws pointing at mergeThemeSchema", () => {
	const sparse = {
		colors: { intent: { primary: P }, role: { paired: {}, single: {} } },
	} as unknown as TokenSchema;
	assertThrows(
		() => generateCssTokens(sparse, "my-"),
		Error,
		`"colors.role.paired.background" is required`,
	);
	assertThrows(
		() => generateCssTokens(sparse, "my-"),
		Error,
		"mergeThemeSchema",
	);
});

Deno.test("validation - derivable role keys without single.foreground throw naming it", () => {
	const schema = {
		colors: {
			intent: {},
			role: {
				paired: { muted: { DEFAULT: "#eee", foreground: "#111" } },
				single: {},
			},
		},
	} as unknown as TokenSchema;
	assertThrows(
		() => generateCssTokens(schema, "my-"),
		Error,
		`"colors.role.single.foreground" is required`,
	);
	// deriveStates: false suppresses the derivation, so nothing dangles.
	const tokens = generateCssTokens(schema, "my-", { deriveStates: false });
	assertEquals(tokens["my-color-muted-hover"], "#eee");
});

Deno.test("validation - explicit hover+active on every role key needs no single.foreground", () => {
	// Precision check: the operand rule must mirror the actual derivation
	// condition, not just key presence — nothing here references foreground.
	const schema = {
		colors: {
			intent: { primary: P },
			role: {
				paired: {
					background: { DEFAULT: "#fafafa", foreground: "#18181b" },
					muted: {
						DEFAULT: "#eee",
						foreground: "#111",
						hover: "#ddd",
						active: "#ccc",
					},
				},
				single: { border: "#d4d4d8" },
			},
		},
	} as unknown as TokenSchema;
	const tokens = generateCssTokens(schema, "my-");
	assertEquals(tokens["my-color-muted-hover"], "#ddd");
	assert(tokens["my-color-surface-primary"]);
});

Deno.test("validation - a three-intent schema with both operands present still generates", () => {
	const threeIntents = {
		colors: {
			intent: {
				primary: P,
				accent: { DEFAULT: "#71717a", foreground: "#fff" },
				destructive: { DEFAULT: "#e11d48", foreground: "#fff" },
			},
			role: completeMode.colors.role,
		},
	} as unknown as TokenSchema;
	const css = generateThemeCss({ light: threeIntents } as ThemeSchema, "my-");
	assert(css.includes("--my-color-primary:"));
	assert(!css.includes("--my-color-warning:"));

	// And it stands alone: no declared-vs-referenced gap.
	const declared = new Set(
		[...css.matchAll(/--([a-z0-9-]+)\s*:/g)].map((m) => m[1]),
	);
	const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]);
	assertEquals(referenced.filter((r) => !declared.has(r)), []);
});

Deno.test("validation - a complete schema is unaffected in every mode/options combination", () => {
	for (const deriveStates of [true, false]) {
		for (const fallback of ["none", "static"] as const) {
			for (const mode of ["light", "dark"] as const) {
				const tokens = generateCssTokens(completeMode, "my-", {
					mode,
					deriveStates,
					fallback,
				});
				assert(Object.keys(tokens).length > 0);
			}
		}
	}
});
