import { z } from "npm:zod";
import type { McpToolDefinition } from "jsr:@marianmeres/mcp-server/types";
import { generateThemeCss, type ThemeFallback } from "./src/generate.ts";
import { mergeThemeSchema } from "./src/merge.ts";
import { generateThemedCss } from "./src/reboot-bridge.ts";
import type { ThemeSchema, ThemeSchemaOverrides } from "./src/types.ts";
import { bundledThemeNames, getBundledTheme } from "./src/themes/mod.ts";

/**
 * Light-touch structural validation — enough to produce a helpful error
 * message for the common mistakes (typos in keys, mismatched nesting). Full
 * semantic validation is left to the generator, which will throw naturally.
 */
function validateThemeSchema(value: unknown): ThemeSchema {
	const bad = (path: string, expected: string): never => {
		throw new Error(
			`Invalid ThemeSchema at ${path}: expected ${expected}. ` +
				`Expected shape: { light: TokenSchema, dark?: TokenSchema }, ` +
				`where TokenSchema = { colors: { intent: {...}, role: { paired: {...}, single: {...} } } }.`,
		);
	};
	if (!value || typeof value !== "object") bad("$", "object");
	const root = value as Record<string, unknown>;
	if (!root.light || typeof root.light !== "object") {
		bad("$.light", "TokenSchema object");
	}
	const assertTokenSchema = (v: unknown, path: string) => {
		if (!v || typeof v !== "object") bad(path, "object");
		const t = v as Record<string, unknown>;
		if (!t.colors || typeof t.colors !== "object") {
			bad(`${path}.colors`, "object");
		}
		const c = t.colors as Record<string, unknown>;
		if (!c.intent) bad(`${path}.colors.intent`, "object");
		if (!c.role || typeof c.role !== "object") {
			bad(`${path}.colors.role`, "object with paired + single");
		}
		const r = c.role as Record<string, unknown>;
		if (!r.paired) bad(`${path}.colors.role.paired`, "object");
		if (!r.single) bad(`${path}.colors.role.single`, "object");
	};
	assertTokenSchema(root.light, "$.light");
	if (root.dark !== undefined) assertTokenSchema(root.dark, "$.dark");
	return value as ThemeSchema;
}

export const tools: McpToolDefinition[] = [
	{
		name: "generate-theme-css",
		description:
			'Generate CSS custom properties from a design token theme schema with light and optional dark mode. Provide either a complete ThemeSchema JSON (`theme`), or a bundled theme name (`baseTheme`) with optional sparse `overrides` merged over it — the way to express e.g. "amberOliveSafari but primary is indigo" without authoring a full schema. Returns a complete CSS string with :root selectors and auto-derived hover/active states via color-mix(), plus an @supports fallback block for browsers older than Chrome 111 / Safari 16.2 / Firefox 113.',
		params: {
			theme: z
				.string()
				.optional()
				.describe(
					"Complete ThemeSchema as JSON string — { light: TokenSchema, dark?: TokenSchema }. Provide exactly one of `theme` or `baseTheme`.",
				),
			baseTheme: z
				.string()
				.optional()
				.describe(
					"Bundled theme name (camelCase, e.g. amberOliveSafari) to use as the complete base. Provide exactly one of `theme` or `baseTheme`.",
				),
			overrides: z
				.string()
				.optional()
				.describe(
					'ThemeSchemaOverrides as JSON string — sparse overrides merged over `baseTheme`, replacing whole entries (e.g. {"light":{"colors":{"intent":{"primary":{"DEFAULT":"#4f46e5","foreground":"#ffffff"}}}}}). Keys must already exist in the base. Requires `baseTheme`.',
				),
			prefix: z
				.string()
				.describe(
					'CSS variable prefix, e.g. "app-" produces --app-color-primary. A trailing dash is auto-added if missing.',
				),
			fallback: z
				.enum(["supports", "static", "none"])
				.optional()
				.describe(
					'Legacy-browser strategy for color-mix(). "supports" (default) appends an @supports not (...) block with precomputed literals; "static" precomputes statically resolvable values so the output has no color-mix() left; "none" emits color-mix() only.',
				),
		},
		handler: (args) => {
			const themeJson = args.theme as string | undefined;
			const baseTheme = args.baseTheme as string | undefined;
			const overridesJson = args.overrides as string | undefined;
			const prefix = args.prefix as string;
			const fallback = args.fallback as ThemeFallback | undefined;

			if (!themeJson === !baseTheme) {
				return Promise.resolve(
					"Provide exactly one of `theme` (complete ThemeSchema JSON) or `baseTheme` (bundled theme name).",
				);
			}
			if (overridesJson && !baseTheme) {
				return Promise.resolve(
					"`overrides` requires `baseTheme` — overrides are merged over a complete bundled base.",
				);
			}

			const parseJson = (json: string, label: string): unknown => {
				try {
					return JSON.parse(json);
				} catch (e) {
					const msg = e instanceof Error ? e.message : String(e);
					throw new Error(`Could not parse \`${label}\` as JSON: ${msg}`);
				}
			};

			try {
				let schema: ThemeSchema;
				if (baseTheme) {
					const base = getBundledTheme(baseTheme);
					if (!base) {
						return Promise.resolve(
							`Unknown baseTheme "${baseTheme}". Available: ${
								bundledThemeNames.join(", ")
							}`,
						);
					}
					schema = mergeThemeSchema(
						base,
						(overridesJson
							? parseJson(overridesJson, "overrides")
							: {}) as ThemeSchemaOverrides,
					);
				} else {
					schema = validateThemeSchema(parseJson(themeJson!, "theme"));
				}
				return Promise.resolve(generateThemeCss(schema, prefix, { fallback }));
			} catch (e) {
				return Promise.resolve(
					e instanceof Error ? e.message : String(e),
				);
			}
		},
	},
	{
		name: "preview-bundled-theme",
		description:
			`Preview a bundled design token theme by generating its CSS output. Call without a name to list all ${bundledThemeNames.length} available theme names.`,
		params: {
			name: z
				.string()
				.optional()
				.describe(
					"Theme name (camelCase). Omit to list available themes.",
				),
			prefix: z
				.string()
				.optional()
				.describe(
					'CSS variable prefix. A trailing dash is auto-added if missing. Default: "app-"',
				),
			withReboot: z
				.boolean()
				.optional()
				.describe(
					"Include Bootstrap Reboot --bs-* bridge variables. Default: false",
				),
			fallback: z
				.enum(["supports", "static", "none"])
				.optional()
				.describe(
					'Legacy-browser strategy for color-mix(). "supports" (default) appends an @supports not (...) block with precomputed literals; "static" precomputes everything so the output has no color-mix() at all; "none" emits color-mix() only — the most compact output, useful when previewing the derivation itself.',
				),
		},
		handler: (args) => {
			const name = args.name as string | undefined;
			const prefix = (args.prefix as string | undefined) ?? "app-";
			const withReboot = args.withReboot as boolean | undefined;
			const fallback = args.fallback as ThemeFallback | undefined;

			if (!name) {
				return Promise.resolve(
					`Available themes (${bundledThemeNames.length}):\n${
						bundledThemeNames.join(", ")
					}`,
				);
			}

			const theme = getBundledTheme(name);
			if (!theme) {
				return Promise.resolve(
					`Unknown theme "${name}". Available: ${bundledThemeNames.join(", ")}`,
				);
			}

			return Promise.resolve(
				withReboot
					? generateThemedCss(theme, prefix, { fallback })
					: generateThemeCss(theme, prefix, { fallback }),
			);
		},
	},
];
