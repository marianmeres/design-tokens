import { z } from "npm:zod";
import type { McpToolDefinition } from "jsr:@marianmeres/mcp-server/types";
import { generateThemeCss } from "./src/generate.ts";
import { generateThemedCss } from "./src/reboot-bridge.ts";
import type { ThemeSchema } from "./src/types.ts";
import * as themes from "./src/themes/mod.ts";

const THEME_NAMES = Object.keys(themes);

export const tools: McpToolDefinition[] = [
	{
		name: "generate-theme-css",
		description:
			"Generate CSS custom properties from a design token theme schema (ThemeSchema JSON) with light and optional dark mode. Returns a complete CSS string with :root selectors and auto-derived hover/active states via color-mix().",
		params: {
			theme: z
				.string()
				.describe(
					"ThemeSchema as JSON string — { light: TokenSchema, dark?: TokenSchema }"
				),
			prefix: z
				.string()
				.describe(
					'CSS variable prefix, e.g. "app-" produces --app-color-primary'
				),
		},
		handler: async ({ theme, prefix }) => {
			const schema: ThemeSchema = JSON.parse(theme);
			return generateThemeCss(schema, prefix);
		},
	},
	{
		name: "preview-bundled-theme",
		description:
			"Preview a bundled design token theme by generating its CSS output. Call without a name to list all 31 available theme names. Available themes include: gray, zinc, stone, blueOrange, cyanRed, emeraldPink, monokaiCyan, rainbow, and more.",
		params: {
			name: z
				.string()
				.optional()
				.describe(
					"Theme name (camelCase). Omit to list available themes."
				),
			prefix: z
				.string()
				.optional()
				.describe(
					'CSS variable prefix. Default: "app-"'
				),
			withReboot: z
				.boolean()
				.optional()
				.describe(
					"Include Bootstrap Reboot --bs-* bridge variables. Default: false"
				),
		},
		handler: async ({ name, prefix, withReboot }) => {
			const pfx = prefix ?? "app-";

			if (!name) {
				return `Available themes (${THEME_NAMES.length}):\n${THEME_NAMES.join(", ")}`;
			}

			const theme = (themes as Record<string, ThemeSchema>)[name];
			if (!theme) {
				return `Unknown theme "${name}". Available: ${THEME_NAMES.join(", ")}`;
			}

			return withReboot
				? generateThemedCss(theme, pfx)
				: generateThemeCss(theme, pfx);
		},
	},
];
