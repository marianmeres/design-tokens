import assert from "node:assert/strict";
import { test } from "node:test";
import { parseColor, type Rgba } from "../src/color.ts";
import { bundledThemes } from "../src/themes/mod.ts";
import type { SingleColor, TokenSchema } from "../src/types.ts";

// `border` must stay visible on every fill layer a consumer can put it on: an outline
// against the page, and a row rule or divider drawn on top of a surface, in both modes.
// A solid border chosen from the fill ladder fails this wherever it equals a rung (dark
// `border` == `surface` was the bug), so the bundled themes use a translucent
// foreground tint, which contrasts with whatever it is painted on.
const FLOOR = 1.15;
const LAYERS = ["background", "muted", "surface", "surface-1"] as const;

const value = (c: SingleColor): string => (typeof c === "string" ? c : c.DEFAULT);

const color = (v: string, what: string): Rgba => {
	const c = parseColor(v);
	if (!c) throw new Error(`${what}: unparseable color ${v}`);
	return c;
};

/** Source-over onto an opaque backdrop, in gamma-encoded sRGB (how browsers paint). */
const over = (top: Rgba, under: Rgba): Rgba => ({
	r: top.a * top.r + (1 - top.a) * under.r,
	g: top.a * top.g + (1 - top.a) * under.g,
	b: top.a * top.b + (1 - top.a) * under.b,
	a: 1,
});

const luminance = ({ r, g, b }: Rgba): number => {
	const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/** WCAG 2 contrast ratio. */
const contrast = (a: Rgba, b: Rgba): number => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

test("bundled themes: border is visible on every fill layer, in both modes", () => {
	const failures: string[] = [];
	let checked = 0;
	for (const [name, theme] of Object.entries(bundledThemes)) {
		const modes: [string, TokenSchema | undefined][] = [
			["light", theme.light],
			["dark", theme.dark],
		];
		for (const [mode, schema] of modes) {
			if (!schema) continue;
			const { paired, single } = schema.colors.role;
			const border = color(value(single.border), `${name} ${mode} border`);
			for (const layer of LAYERS) {
				const fill = paired[layer]?.DEFAULT;
				if (!fill) continue;
				const under = color(fill, `${name} ${mode} ${layer}`);
				const ratio = contrast(over(border, under), under);
				checked++;
				if (ratio < FLOOR) {
					failures.push(
						`${name} ${mode}: border on ${layer} ${ratio.toFixed(2)}`,
					);
				}
			}
		}
	}
	assert.ok(checked > 0, "no theme x mode x layer combinations were checked");
	assert.ok(
		!failures.length,
		`border contrast below ${FLOOR}:1 on ${failures.length} layer(s):\n  ${
			failures.join("\n  ")
		}`,
	);
});
