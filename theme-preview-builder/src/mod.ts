// Re-export the @marianmeres/vanilla reactive-DOM toolkit so the single
// preview bundle carries both libraries — the builder UI is authored with it.
export * from "@marianmeres/vanilla";

export { colors } from "../../src/colors.ts";
export { generateCssTokens, toCssString } from "../../src/generate.ts";
export * as themes from "../../src/themes/mod.ts";
export type {
	ColorPair,
	ColorValue,
	SingleColor,
	ThemeSchema,
	TokenSchema,
} from "../../src/types.ts";

import { formatColor, parseColor, rgba } from "../../src/color.ts";
import type { colors } from "../../src/colors.ts";
import type { SingleColor, ThemeSchema } from "../../src/types.ts";

type ColorsMap = typeof colors;

/** Build a hex → name reverse map (e.g. "#2563eb" → "blue-600") */
export function buildHexToNameMap(c: ColorsMap): Map<string, string> {
	const map = new Map<string, string>();
	for (const [family, value] of Object.entries(c)) {
		if (typeof value === "string") {
			// black, white
			map.set(value.toLowerCase(), family);
		} else {
			for (const [shade, hex] of Object.entries(value as Record<string, string>)) {
				if (!map.has(hex.toLowerCase())) {
					map.set(hex.toLowerCase(), `${family}-${shade}`);
				}
			}
		}
	}
	return map;
}

/**
 * Parse a translucent color (`border`, `ring`) into its opaque base hex + alpha
 * percentage. Reads what the `rgba()` schema helper emits — `rgba(r, g, b, a)` —
 * and the older `color-mix(in srgb, #hex N%, transparent)` spelling. Returns null
 * for an opaque or unparseable value.
 */
export function parseAlphaValue(v: string): { hex: string; percent: number } | null {
	const m = v.match(/color-mix\(in srgb,\s*(#[0-9a-fA-F]+)\s+(\d+)%,\s*transparent\)/);
	if (m) return { hex: m[1], percent: parseInt(m[2]) };
	const c = parseColor(v);
	if (!c || c.a >= 1) return null;
	return { hex: formatColor({ ...c, a: 1 }), percent: Math.round(c.a * 100) };
}

/** Build a translucent value the way theme schemas spell it (`rgba()`, never `color-mix()`). */
export function buildAlphaValue(hex: string, percent: number): string {
	return rgba(hex, percent / 100);
}

/** Get hex for a family+shade selection */
export function hexForSelection(
	c: ColorsMap,
	family: string,
	shade: number | null,
): string | null {
	if (family === "black") return c.black;
	if (family === "white") return c.white;
	const fam = (c as Record<string, unknown>)[family];
	if (fam && typeof fam === "object" && shade !== null) {
		return (fam as Record<string, string>)[String(shade)] ?? null;
	}
	return null;
}

/** Reverse-lookup hex → { family, shade } */
export function selectionForHex(
	hex: string,
	hexToName: Map<string, string>,
): { family: string; shade: number | null } | null {
	const name = hexToName.get(hex.toLowerCase());
	if (!name) return null;
	if (name === "black" || name === "white") {
		return { family: name, shade: null };
	}
	const idx = name.lastIndexOf("-");
	return {
		family: name.substring(0, idx),
		shade: parseInt(name.substring(idx + 1)),
	};
}

// Helper: format an opaque hex as a palette reference for TS export
function hexRef(hex: string, hexToName: Map<string, string>): string {
	const sel = selectionForHex(hex, hexToName);
	if (!sel) return `"${hex}"`;
	if (sel.shade === null) return `colors.${sel.family}`;
	return `colors.${sel.family}[${sel.shade}]`;
}

// Helper: format any color value for TS export; translucent ones become rgba(ref, a)
function colorRef(value: string, hexToName: Map<string, string>): string {
	const alpha = parseAlphaValue(value);
	if (alpha) return `rgba(${hexRef(alpha.hex, hexToName)}, ${alpha.percent / 100})`;
	return hexRef(value, hexToName);
}

// Helper: format a SingleColor for TS export
function singleColorToTs(val: SingleColor, hexToName: Map<string, string>): string {
	if (typeof val === "string") return colorRef(val, hexToName);
	const parts: string[] = [];
	parts.push(`DEFAULT: ${colorRef(val.DEFAULT, hexToName)}`);
	if (val.hover) parts.push(`hover: ${colorRef(val.hover, hexToName)}`);
	if (val.active) {
		parts.push(`active: ${colorRef(val.active, hexToName)}`);
	}
	return `{\n\t\t\t\t\t${parts.join(",\n\t\t\t\t\t")},\n\t\t\t\t}`;
}

/** Generate TypeScript theme source code from a ThemeSchema */
export function themeToTypeScript(
	schema: ThemeSchema,
	hexToName: Map<string, string>,
): string {
	function modeToTs(mode: "light" | "dark"): string {
		const s = mode === "light" ? schema.light : schema.dark;
		if (!s) return "";

		const intentLines: string[] = [];
		for (const [key, pair] of Object.entries(s.colors.intent)) {
			const parts = [
				`DEFAULT: ${colorRef(pair.DEFAULT, hexToName)}`,
				`foreground: ${colorRef(pair.foreground, hexToName)}`,
			];
			intentLines.push(
				`\t\t\t${key}: {\n\t\t\t\t${parts.join(",\n\t\t\t\t")},\n\t\t\t}`,
			);
		}

		const pairedLines: string[] = [];
		for (const [key, pair] of Object.entries(s.colors.role.paired)) {
			const parts = [
				`DEFAULT: ${colorRef(pair.DEFAULT, hexToName)}`,
				`foreground: ${colorRef(pair.foreground, hexToName)}`,
			];
			const qkey = key.includes("-") ? `"${key}"` : key;
			pairedLines.push(
				`\t\t\t\t${qkey}: {\n\t\t\t\t\t${parts.join(
					",\n\t\t\t\t\t",
				)},\n\t\t\t\t}`,
			);
		}

		const singleLines: string[] = [];
		for (const [key, val] of Object.entries(s.colors.role.single)) {
			singleLines.push(`\t\t\t\t${key}: ${singleColorToTs(val, hexToName)}`);
		}

		return `const ${mode} = {
	colors: {
		intent: {
${intentLines.join(",\n")},
		},
		role: {
			paired: {
${pairedLines.join(",\n")},
			},
			single: {
${singleLines.join(",\n")},
			},
		},
	},
};`;
	}

	const lightTs = modeToTs("light");
	const darkTs = schema.dark ? modeToTs("dark") : "";

	let out = `import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

${lightTs}
`;

	if (darkTs) {
		out += `\n${darkTs}\n`;
	}

	out += `\nconst theme: ThemeSchema = { light${
		schema.dark ? ", dark" : ""
	} };\n\nexport default theme;\n`;

	return out;
}
