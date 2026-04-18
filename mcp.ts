import { z } from "npm:zod";
import type { McpToolDefinition } from "jsr:@marianmeres/mcp-server/types";
import { generateThemeCss } from "./src/generate.ts";
import { generateThemedCss } from "./src/reboot-bridge.ts";
import type { ThemeSchema } from "./src/types.ts";
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
			"Generate CSS custom properties from a design token theme schema (ThemeSchema JSON) with light and optional dark mode. Returns a complete CSS string with :root selectors and auto-derived hover/active states via color-mix().",
		params: {
			theme: z
				.string()
				.describe(
					"ThemeSchema as JSON string — { light: TokenSchema, dark?: TokenSchema }",
				),
			prefix: z
				.string()
				.describe(
					'CSS variable prefix, e.g. "app-" produces --app-color-primary. A trailing dash is auto-added if missing.',
				),
		},
		handler: (args) => {
			const theme = args.theme as string;
			const prefix = args.prefix as string;
			let parsed: unknown;
			try {
				parsed = JSON.parse(theme);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				return Promise.resolve(
					`Could not parse \`theme\` as JSON: ${msg}`,
				);
			}
			try {
				const schema = validateThemeSchema(parsed);
				return Promise.resolve(generateThemeCss(schema, prefix));
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
		},
		handler: (args) => {
			const name = args.name as string | undefined;
			const prefix = (args.prefix as string | undefined) ?? "app-";
			const withReboot = args.withReboot as boolean | undefined;

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
					? generateThemedCss(theme, prefix)
					: generateThemeCss(theme, prefix),
			);
		},
	},
];
