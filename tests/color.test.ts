import { assert, assertEquals, assertThrows } from "@std/assert";
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

Deno.test("parseColor - hex forms", () => {
	assertEquals(formatColor(parseColor("#abc")!), "#aabbcc");
	assertEquals(formatColor(parseColor("#AABBCC")!), "#aabbcc");
	assertEquals(formatColor(parseColor("#ff000080")!), "rgba(255, 0, 0, 0.502)");
	assertEquals(formatColor(parseColor("#f00f")!), "#ff0000");
});

Deno.test("parseColor - rgb/rgba, legacy and modern syntax", () => {
	assertEquals(formatColor(parseColor("rgb(255, 0, 0)")!), "#ff0000");
	assertEquals(formatColor(parseColor("rgb(255 0 0)")!), "#ff0000");
	assertEquals(
		formatColor(parseColor("rgba(255, 0, 0, 0.5)")!),
		"rgba(255, 0, 0, 0.5)",
	);
	assertEquals(formatColor(parseColor("rgb(255 0 0 / 50%)")!), "rgba(255, 0, 0, 0.5)");
	assertEquals(formatColor(parseColor("rgb(100%, 0%, 0%)")!), "#ff0000");
});

Deno.test("parseColor - hsl, both percentage and bare-number syntax", () => {
	assertEquals(formatColor(parseColor("hsl(210, 50%, 40%)")!), "#336699");
	assertEquals(formatColor(parseColor("hsl(210 50 40)")!), "#336699");
	assertEquals(
		formatColor(parseColor("hsl(210deg 50% 40% / .5)")!),
		"rgba(51, 102, 153, 0.5)",
	);
});

Deno.test("parseColor - named keywords", () => {
	assertEquals(formatColor(parseColor("black")!), "#000000");
	assertEquals(formatColor(parseColor("white")!), "#ffffff");
	assertEquals(parseColor("transparent")!.a, 0);
});

Deno.test("parseColor - rejects values that are not statically resolvable", () => {
	assertEquals(parseColor("currentColor"), null);
	assertEquals(parseColor("var(--x)"), null);
	assertEquals(parseColor("inherit"), null);
	assertEquals(parseColor("#12345"), null);
	assertEquals(parseColor("rgb(1, 2)"), null);
	assertEquals(parseColor(""), null);
});

// The OKLab transfer functions are the whole basis of the hover/active
// fallback, so pin them against published reference values rather than against
// our own output.
Deno.test("parseColor - OKLab transfer matches reference values", () => {
	assertEquals(formatColor(parseColor("oklab(1 0 0)")!), "#ffffff");
	assertEquals(formatColor(parseColor("oklab(0 0 0)")!), "#000000");
	assertEquals(
		formatColor(parseColor("oklab(0.6279554 0.2249316 0.1258463)")!),
		"#ff0000",
	);
	assertEquals(
		formatColor(parseColor("oklab(0.8664396 -0.2338874 0.1794985)")!),
		"#00ff00",
	);
	assertEquals(
		formatColor(parseColor("oklab(0.4520137 -0.0324547 -0.3115281)")!),
		"#0000ff",
	);
	assertEquals(
		formatColor(parseColor("oklch(0.6279554 0.2576833 29.2338851)")!),
		"#ff0000",
	);
});

Deno.test("parseColor - OKLab round-trips sRGB colors losslessly", () => {
	for (
		const hex of ["#463947", "#14b8a6", "#e11d48", "#f59e0b", "#fafafa", "#18181b"]
	) {
		assertEquals(evalTo(`color-mix(in oklab, ${hex}, ${hex})`), hex);
	}
});

// --- mixing ---

Deno.test("mixColors - 50/50 srgb", () => {
	assertEquals(evalTo("color-mix(in srgb, red, blue)"), "#800080");
});

Deno.test("mixColors - an omitted percentage is 100 minus the other", () => {
	assertEquals(
		evalTo("color-mix(in srgb, red 25%, blue)"),
		evalTo("color-mix(in srgb, red 25%, blue 75%)"),
	);
});

Deno.test("mixColors - percentages summing under 100 scale the result alpha", () => {
	assertEquals(
		evalTo("color-mix(in srgb, red 30%, blue 30%)"),
		"rgba(128, 0, 128, 0.6)",
	);
});

// This is why theme `ring` values can be plain rgba(): mixing with
// `transparent` is premultiplied, so only alpha changes.
Deno.test("mixColors - mixing with transparent preserves the color and only lowers alpha", () => {
	assertEquals(
		evalTo("color-mix(in srgb, #463947 20%, transparent)"),
		"rgba(70, 57, 71, 0.2)",
	);
	assertEquals(
		evalTo("color-mix(in srgb, red 50%, transparent)"),
		"rgba(255, 0, 0, 0.5)",
	);
});

Deno.test("mixColors - percentage may precede the color", () => {
	assertEquals(
		evalTo("color-mix(in srgb, 25% red, blue)"),
		evalTo("color-mix(in srgb, red 25%, blue)"),
	);
});

Deno.test("mixColors - two zero percentages are invalid", () => {
	assertEquals(mixColors("srgb", parseColor("red")!, 0, parseColor("blue")!, 0), null);
	assertEquals(evalTo("color-mix(in srgb, red 0%, blue 0%)"), null);
});

// --- var() resolution ---

Deno.test("evaluateColorExpression - resolves var() through a lookup", () => {
	const tokens: Record<string, string> = {
		"x-color-primary": "#27272a",
		"x-color-background": "#fafafa",
	};
	const lookup = (n: string) => tokens[n];
	// 0.15*0x27 + 0.85*0xfa = 218 = 0xda; blue channel rounds up to 0xdb
	assertEquals(
		evalTo(
			"color-mix(in srgb, var(--x-color-primary) 15%, var(--x-color-background))",
			lookup,
		),
		"#dadadb",
	);
});

Deno.test("evaluateColorExpression - resolves chained var() references", () => {
	const tokens: Record<string, string> = {
		a: "#ff0000",
		b: "var(--a)",
		c: "color-mix(in srgb, var(--b), black)",
	};
	assertEquals(evalTo("var(--c)", (n) => tokens[n]), "#800000");
});

Deno.test("evaluateColorExpression - uses the var() fallback when undefined", () => {
	assertEquals(evalTo("var(--nope, #ff0000)"), "#ff0000");
	assertEquals(evalTo("var(--nope)"), null);
});

Deno.test("evaluateColorExpression - reference cycles resolve to null, not a hang", () => {
	const tokens: Record<string, string> = {
		a: "color-mix(in oklab, var(--b), black 10%)",
		b: "color-mix(in oklab, var(--a), black 10%)",
	};
	assertEquals(evalTo("var(--a)", (n) => tokens[n]), null);
});

Deno.test("evaluateColorExpression - unsupported interpolation spaces are left unresolved", () => {
	// Deliberate: approximating a hue-interpolated mix would be worse than
	// omitting the fallback for that token.
	assertEquals(evalTo("color-mix(in oklch, red, blue)"), null);
	assertEquals(evalTo("color-mix(in hsl, red, blue)"), null);
	assertEquals(evalTo("color-mix(in lab, red, blue)"), null);
});

Deno.test("evaluateColorExpression - unresolvable operands make the whole mix unresolvable", () => {
	assertEquals(evalTo("color-mix(in srgb, currentColor, black)"), null);
	assertEquals(evalTo("color-mix(in srgb, var(--undefined), black)"), null);
});

Deno.test("evaluateColorExpression - nested color-mix", () => {
	assertEquals(
		evalTo("color-mix(in srgb, color-mix(in srgb, red, blue), black)"),
		"#400040",
	);
});

// --- serialization ---

Deno.test("formatColor - opaque colors serialize as hex, translucent as legacy rgba()", () => {
	assertEquals(formatColor({ r: 1, g: 0, b: 0, a: 1 }), "#ff0000");
	assertEquals(formatColor({ r: 1, g: 0, b: 0, a: 0.25 }), "rgba(255, 0, 0, 0.25)");
});

Deno.test("formatColor - clamps out-of-gamut components", () => {
	assertEquals(formatColor({ r: 1.4, g: -0.2, b: 0.5, a: 1 }), "#ff0080");
});

// --- rgba() authoring helper ---

Deno.test("rgba - is exactly equivalent to mixing with transparent", () => {
	assertEquals(
		rgba("#2563eb", 0.25),
		evalTo("color-mix(in srgb, #2563eb 25%, transparent)"),
	);
	assertEquals(rgba("#2563eb", 0.25), "rgba(37, 99, 235, 0.25)");
});

Deno.test("rgba - alpha 1 collapses back to hex", () => {
	assertEquals(rgba("#2563eb", 1), "#2563eb");
});

Deno.test("rgba - throws on an unparseable color", () => {
	assertThrows(() => rgba("not-a-color", 0.5), TypeError);
});

Deno.test("rgba - accepts non-hex inputs", () => {
	assertEquals(rgba("red", 0.5), "rgba(255, 0, 0, 0.5)");
	assert(rgba("hsl(210, 50%, 40%)", 0.5).startsWith("rgba(51, 102, 153"));
});
