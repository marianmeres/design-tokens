import assert from "node:assert/strict";
import { test } from "node:test";
import {
	evaluateColorExpression,
	formatColor,
	mixColors,
	parseColor,
	rgba,
} from "../src/color.ts";

/** Parse → mix → serialize in one shot, for terser assertions. */
const evalTo = (
	expr: string,
	lookup?: (n: string) => string | undefined,
): string | null => {
	const c = evaluateColorExpression(expr, lookup);
	return c ? formatColor(c) : null;
};

// --- parsing ---

test("parseColor - hex forms", () => {
	assert.deepStrictEqual(formatColor(parseColor("#abc")!), "#aabbcc");
	assert.deepStrictEqual(formatColor(parseColor("#AABBCC")!), "#aabbcc");
	assert.deepStrictEqual(formatColor(parseColor("#ff000080")!), "rgba(255, 0, 0, 0.502)");
	assert.deepStrictEqual(formatColor(parseColor("#f00f")!), "#ff0000");
});

test("parseColor - rgb/rgba, legacy and modern syntax", () => {
	assert.deepStrictEqual(formatColor(parseColor("rgb(255, 0, 0)")!), "#ff0000");
	assert.deepStrictEqual(formatColor(parseColor("rgb(255 0 0)")!), "#ff0000");
	assert.deepStrictEqual(
		formatColor(parseColor("rgba(255, 0, 0, 0.5)")!),
		"rgba(255, 0, 0, 0.5)",
	);
	assert.deepStrictEqual(formatColor(parseColor("rgb(255 0 0 / 50%)")!), "rgba(255, 0, 0, 0.5)");
	assert.deepStrictEqual(formatColor(parseColor("rgb(100%, 0%, 0%)")!), "#ff0000");
});

test("parseColor - hsl, both percentage and bare-number syntax", () => {
	assert.deepStrictEqual(formatColor(parseColor("hsl(210, 50%, 40%)")!), "#336699");
	assert.deepStrictEqual(formatColor(parseColor("hsl(210 50 40)")!), "#336699");
	assert.deepStrictEqual(
		formatColor(parseColor("hsl(210deg 50% 40% / .5)")!),
		"rgba(51, 102, 153, 0.5)",
	);
});

test("parseColor - named keywords", () => {
	assert.deepStrictEqual(formatColor(parseColor("black")!), "#000000");
	assert.deepStrictEqual(formatColor(parseColor("white")!), "#ffffff");
	assert.deepStrictEqual(parseColor("transparent")!.a, 0);
});

test("parseColor - rejects values that are not statically resolvable", () => {
	assert.deepStrictEqual(parseColor("currentColor"), null);
	assert.deepStrictEqual(parseColor("var(--x)"), null);
	assert.deepStrictEqual(parseColor("inherit"), null);
	assert.deepStrictEqual(parseColor("#12345"), null);
	assert.deepStrictEqual(parseColor("rgb(1, 2)"), null);
	assert.deepStrictEqual(parseColor(""), null);
});

// The OKLab transfer functions are the whole basis of the hover/active
// fallback, so pin them against published reference values rather than against
// our own output.
test("parseColor - OKLab transfer matches reference values", () => {
	assert.deepStrictEqual(formatColor(parseColor("oklab(1 0 0)")!), "#ffffff");
	assert.deepStrictEqual(formatColor(parseColor("oklab(0 0 0)")!), "#000000");
	assert.deepStrictEqual(
		formatColor(parseColor("oklab(0.6279554 0.2249316 0.1258463)")!),
		"#ff0000",
	);
	assert.deepStrictEqual(
		formatColor(parseColor("oklab(0.8664396 -0.2338874 0.1794985)")!),
		"#00ff00",
	);
	assert.deepStrictEqual(
		formatColor(parseColor("oklab(0.4520137 -0.0324547 -0.3115281)")!),
		"#0000ff",
	);
	assert.deepStrictEqual(
		formatColor(parseColor("oklch(0.6279554 0.2576833 29.2338851)")!),
		"#ff0000",
	);
});

test("parseColor - OKLab round-trips sRGB colors losslessly", () => {
	for (
		const hex of ["#463947", "#14b8a6", "#e11d48", "#f59e0b", "#fafafa", "#18181b"]
	) {
		assert.deepStrictEqual(evalTo(`color-mix(in oklab, ${hex}, ${hex})`), hex);
	}
});

// --- mixing ---

test("mixColors - 50/50 srgb", () => {
	assert.deepStrictEqual(evalTo("color-mix(in srgb, red, blue)"), "#800080");
});

test("mixColors - an omitted percentage is 100 minus the other", () => {
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, red 25%, blue)"),
		evalTo("color-mix(in srgb, red 25%, blue 75%)"),
	);
});

test("mixColors - percentages summing under 100 scale the result alpha", () => {
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, red 30%, blue 30%)"),
		"rgba(128, 0, 128, 0.6)",
	);
});

// This is why theme `ring` values can be plain rgba(): mixing with
// `transparent` is premultiplied, so only alpha changes.
test("mixColors - mixing with transparent preserves the color and only lowers alpha", () => {
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, #463947 20%, transparent)"),
		"rgba(70, 57, 71, 0.2)",
	);
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, red 50%, transparent)"),
		"rgba(255, 0, 0, 0.5)",
	);
});

test("mixColors - percentage may precede the color", () => {
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, 25% red, blue)"),
		evalTo("color-mix(in srgb, red 25%, blue)"),
	);
});

test("mixColors - two zero percentages are invalid", () => {
	assert.deepStrictEqual(mixColors("srgb", parseColor("red")!, 0, parseColor("blue")!, 0), null);
	assert.deepStrictEqual(evalTo("color-mix(in srgb, red 0%, blue 0%)"), null);
});

// --- var() resolution ---

test("evaluateColorExpression - resolves var() through a lookup", () => {
	const tokens: Record<string, string> = {
		"x-color-primary": "#27272a",
		"x-color-background": "#fafafa",
	};
	const lookup = (n: string) => tokens[n];
	// 0.15*0x27 + 0.85*0xfa = 218 = 0xda; blue channel rounds up to 0xdb
	assert.deepStrictEqual(
		evalTo(
			"color-mix(in srgb, var(--x-color-primary) 15%, var(--x-color-background))",
			lookup,
		),
		"#dadadb",
	);
});

test("evaluateColorExpression - resolves chained var() references", () => {
	const tokens: Record<string, string> = {
		a: "#ff0000",
		b: "var(--a)",
		c: "color-mix(in srgb, var(--b), black)",
	};
	assert.deepStrictEqual(evalTo("var(--c)", (n) => tokens[n]), "#800000");
});

test("evaluateColorExpression - uses the var() fallback when undefined", () => {
	assert.deepStrictEqual(evalTo("var(--nope, #ff0000)"), "#ff0000");
	assert.deepStrictEqual(evalTo("var(--nope)"), null);
});

test("evaluateColorExpression - reference cycles resolve to null, not a hang", () => {
	const tokens: Record<string, string> = {
		a: "color-mix(in oklab, var(--b), black 10%)",
		b: "color-mix(in oklab, var(--a), black 10%)",
	};
	assert.deepStrictEqual(evalTo("var(--a)", (n) => tokens[n]), null);
});

test("evaluateColorExpression - unsupported interpolation spaces are left unresolved", () => {
	// Deliberate: approximating a hue-interpolated mix would be worse than
	// omitting the fallback for that token.
	assert.deepStrictEqual(evalTo("color-mix(in oklch, red, blue)"), null);
	assert.deepStrictEqual(evalTo("color-mix(in hsl, red, blue)"), null);
	assert.deepStrictEqual(evalTo("color-mix(in lab, red, blue)"), null);
});

test("evaluateColorExpression - unresolvable operands make the whole mix unresolvable", () => {
	assert.deepStrictEqual(evalTo("color-mix(in srgb, currentColor, black)"), null);
	assert.deepStrictEqual(evalTo("color-mix(in srgb, var(--undefined), black)"), null);
});

test("evaluateColorExpression - nested color-mix", () => {
	assert.deepStrictEqual(
		evalTo("color-mix(in srgb, color-mix(in srgb, red, blue), black)"),
		"#400040",
	);
});

// --- serialization ---

test("formatColor - opaque colors serialize as hex, translucent as legacy rgba()", () => {
	assert.deepStrictEqual(formatColor({ r: 1, g: 0, b: 0, a: 1 }), "#ff0000");
	assert.deepStrictEqual(formatColor({ r: 1, g: 0, b: 0, a: 0.25 }), "rgba(255, 0, 0, 0.25)");
});

test("formatColor - clamps out-of-gamut components", () => {
	assert.deepStrictEqual(formatColor({ r: 1.4, g: -0.2, b: 0.5, a: 1 }), "#ff0080");
});

// --- rgba() authoring helper ---

test("rgba - is exactly equivalent to mixing with transparent", () => {
	assert.deepStrictEqual(
		rgba("#2563eb", 0.25),
		evalTo("color-mix(in srgb, #2563eb 25%, transparent)"),
	);
	assert.deepStrictEqual(rgba("#2563eb", 0.25), "rgba(37, 99, 235, 0.25)");
});

test("rgba - alpha 1 collapses back to hex", () => {
	assert.deepStrictEqual(rgba("#2563eb", 1), "#2563eb");
});

test("rgba - throws on an unparseable color", () => {
	assert.throws(() => rgba("not-a-color", 0.5), TypeError);
});

test("rgba - accepts non-hex inputs", () => {
	assert.deepStrictEqual(rgba("red", 0.5), "rgba(255, 0, 0, 0.5)");
	assert.ok(rgba("hsl(210, 50%, 40%)", 0.5).startsWith("rgba(51, 102, 153"));
});
