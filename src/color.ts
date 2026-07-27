/**
 * Color parsing and mixing math.
 *
 * Exists so the generator can evaluate its own `color-mix()` expressions at
 * build time and emit literal colors for engines that predate `color-mix()`
 * (Chrome/Edge < 111, Safari < 16.2, Firefox < 113). See the `fallback` option
 * in {@link ./generate.ts}.
 *
 * Everything here mirrors CSS Color 4/5 semantics: premultiplied-alpha
 * interpolation, the `color-mix()` percentage normalization rules, and the
 * OKLab transfer functions.
 *
 * @module
 */

/**
 * A color with red/green/blue components in `0..1` (gamma-encoded sRGB) and
 * alpha in `0..1`.
 */
export type Rgba = { r: number; g: number; b: number; a: number };

/**
 * Interpolation color spaces understood by {@link mixColors}.
 *
 * Deliberately narrow — these are the spaces the generator emits. Author-
 * supplied `color-mix()` in any other space (`oklch`, `hsl`, `lab`, …) is left
 * unevaluated rather than approximated; see {@link evaluateColorExpression}.
 */
export type MixSpace = "srgb" | "srgb-linear" | "oklab";

/** CSS basic color keywords (plus the common aliases and `transparent`). */
const NAMED: Record<string, string> = {
	transparent: "#00000000",
	black: "#000000",
	silver: "#c0c0c0",
	gray: "#808080",
	grey: "#808080",
	white: "#ffffff",
	maroon: "#800000",
	red: "#ff0000",
	purple: "#800080",
	fuchsia: "#ff00ff",
	magenta: "#ff00ff",
	green: "#008000",
	lime: "#00ff00",
	olive: "#808000",
	yellow: "#ffff00",
	navy: "#000080",
	blue: "#0000ff",
	teal: "#008080",
	aqua: "#00ffff",
	cyan: "#00ffff",
	orange: "#ffa500",
};

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Split a comma-separated list, ignoring commas nested inside parentheses.
 * `"var(--a), b 10%"` → `["var(--a)", "b 10%"]`.
 */
function splitTopLevel(input: string, separator: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = "";
	for (const ch of input) {
		if (ch === "(") depth++;
		else if (ch === ")") depth--;
		if (ch === separator && depth === 0) {
			out.push(cur.trim());
			cur = "";
		} else {
			cur += ch;
		}
	}
	out.push(cur.trim());
	return out;
}

/** Split on whitespace, ignoring whitespace nested inside parentheses. */
function splitWhitespace(input: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = "";
	for (const ch of input) {
		if (ch === "(") depth++;
		else if (ch === ")") depth--;
		if (/\s/.test(ch) && depth === 0) {
			if (cur) out.push(cur);
			cur = "";
		} else {
			cur += ch;
		}
	}
	if (cur) out.push(cur);
	return out;
}

/**
 * Match `name(...)` and return the inner text. Returns null when the input is
 * not a single balanced call of that name.
 */
function unwrapFn(input: string, name: string): string | null {
	const lower = input.toLowerCase();
	if (!lower.startsWith(name + "(") || !input.endsWith(")")) return null;
	const inner = input.slice(name.length + 1, -1);
	// Reject "a(x) b(y)" masquerading as one call.
	let depth = 0;
	for (const ch of inner) {
		if (ch === "(") depth++;
		else if (ch === ")") {
			depth--;
			if (depth < 0) return null;
		}
	}
	return depth === 0 ? inner : null;
}

/**
 * Parse a `<number>` or `<percentage>`. `pctBasis` is the value 100% maps to.
 * `none` resolves to 0 (interpolation treats missing components as zero).
 */
function parseNumeric(token: string, pctBasis: number): number | null {
	const t = token.trim().toLowerCase();
	if (t === "none") return 0;
	if (t.endsWith("%")) {
		const n = Number(t.slice(0, -1));
		return Number.isFinite(n) ? (n / 100) * pctBasis : null;
	}
	const n = Number(t);
	return Number.isFinite(n) ? n : null;
}

/** Parse an `<angle>` (bare number, `deg`, `rad`, `grad`, `turn`) to degrees. */
function parseAngle(token: string): number | null {
	const t = token.trim().toLowerCase();
	if (t === "none") return 0;
	const m = t.match(/^([+-]?[\d.]+)(deg|rad|grad|turn)?$/);
	if (!m) return null;
	const n = Number(m[1]);
	if (!Number.isFinite(n)) return null;
	switch (m[2]) {
		case "rad":
			return (n * 180) / Math.PI;
		case "grad":
			return n * 0.9;
		case "turn":
			return n * 360;
		default:
			return n;
	}
}

/**
 * Normalize a color function's arguments to `[c1, c2, c3, alpha?]`, accepting
 * both the legacy comma syntax (`rgb(1, 2, 3)`, `rgba(1, 2, 3, .5)`) and the
 * modern space syntax (`rgb(1 2 3 / 50%)`).
 */
function normalizeFnArgs(
	inner: string,
): { parts: string[]; alpha: string | null } | null {
	const slash = splitTopLevel(inner, "/");
	if (slash.length === 2) {
		const parts = splitWhitespace(slash[0]);
		return parts.length === 3 ? { parts, alpha: slash[1] } : null;
	}
	if (slash.length > 2) return null;

	const commas = splitTopLevel(inner, ",");
	if (commas.length === 3) return { parts: commas, alpha: null };
	if (commas.length === 4) {
		return { parts: commas.slice(0, 3), alpha: commas[3] };
	}
	if (commas.length === 1) {
		const parts = splitWhitespace(inner);
		if (parts.length === 3) return { parts, alpha: null };
	}
	return null;
}

/** Parse the alpha argument (number `0..1` or percentage). */
function parseAlpha(token: string | null): number | null {
	if (token === null) return 1;
	const n = parseNumeric(token, 1);
	return n === null ? null : clamp01(n);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	h = ((h % 360) + 360) % 360;
	s = clamp01(s);
	l = clamp01(l);
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const seg = Math.floor(h / 60) % 6;
	const rgb: [number, number, number] = seg === 0
		? [c, x, 0]
		: seg === 1
		? [x, c, 0]
		: seg === 2
		? [0, c, x]
		: seg === 3
		? [0, x, c]
		: seg === 4
		? [x, 0, c]
		: [c, 0, x];
	return [rgb[0] + m, rgb[1] + m, rgb[2] + m];
}

/**
 * Parse a CSS color into {@link Rgba}. Returns null for anything not
 * statically resolvable.
 *
 * Supported: hex (3/4/6/8 digit), `rgb()`/`rgba()`, `hsl()`/`hsla()`,
 * `oklab()`, `oklch()`, and the basic color keywords. Values that depend on
 * inherited or computed state (`currentColor`, `var()`, system colors) are
 * intentionally NOT supported here — see {@link evaluateColorExpression} for
 * `var()` resolution.
 */
export function parseColor(value: string): Rgba | null {
	const input = value.trim();
	if (!input) return null;

	const named = NAMED[input.toLowerCase()];
	if (named) return parseColor(named);

	if (input.startsWith("#")) {
		let hex = input.slice(1);
		if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
		if (hex.length === 3 || hex.length === 4) {
			hex = hex.split("").map((c) => c + c).join("");
		}
		if (hex.length !== 6 && hex.length !== 8) return null;
		return {
			r: parseInt(hex.slice(0, 2), 16) / 255,
			g: parseInt(hex.slice(2, 4), 16) / 255,
			b: parseInt(hex.slice(4, 6), 16) / 255,
			a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
		};
	}

	for (const name of ["rgba", "rgb"]) {
		const inner = unwrapFn(input, name);
		if (inner === null) continue;
		const args = normalizeFnArgs(inner);
		if (!args) return null;
		const [r, g, b] = args.parts.map((p) => parseNumeric(p, 255));
		const a = parseAlpha(args.alpha);
		if (r === null || g === null || b === null || a === null) return null;
		return { r: clamp01(r / 255), g: clamp01(g / 255), b: clamp01(b / 255), a };
	}

	for (const name of ["hsla", "hsl"]) {
		const inner = unwrapFn(input, name);
		if (inner === null) continue;
		const args = normalizeFnArgs(inner);
		if (!args) return null;
		const h = parseAngle(args.parts[0]);
		const s = parseNumeric(args.parts[1], 1);
		const l = parseNumeric(args.parts[2], 1);
		const a = parseAlpha(args.alpha);
		if (h === null || s === null || l === null || a === null) return null;
		// Bare numbers in the modern syntax are 0..100, not 0..1.
		const sNorm = args.parts[1].trim().endsWith("%") ? s : s / 100;
		const lNorm = args.parts[2].trim().endsWith("%") ? l : l / 100;
		const [r, g, b] = hslToRgb(h, sNorm, lNorm);
		return { r: clamp01(r), g: clamp01(g), b: clamp01(b), a };
	}

	const oklabInner = unwrapFn(input, "oklab");
	if (oklabInner !== null) {
		const args = normalizeFnArgs(oklabInner);
		if (!args) return null;
		const L = parseNumeric(args.parts[0], 1);
		const A = parseNumeric(args.parts[1], 0.4);
		const B = parseNumeric(args.parts[2], 0.4);
		const alpha = parseAlpha(args.alpha);
		if (L === null || A === null || B === null || alpha === null) return null;
		return { ...oklabToSrgb(L, A, B), a: alpha };
	}

	const oklchInner = unwrapFn(input, "oklch");
	if (oklchInner !== null) {
		const args = normalizeFnArgs(oklchInner);
		if (!args) return null;
		const L = parseNumeric(args.parts[0], 1);
		const C = parseNumeric(args.parts[1], 0.4);
		const H = parseAngle(args.parts[2]);
		const alpha = parseAlpha(args.alpha);
		if (L === null || C === null || H === null || alpha === null) return null;
		const rad = (H * Math.PI) / 180;
		return {
			...oklabToSrgb(L, C * Math.cos(rad), C * Math.sin(rad)),
			a: alpha,
		};
	}

	return null;
}

/**
 * Serialize to the most compatible CSS form: `#rrggbb` when fully opaque,
 * legacy `rgba(r, g, b, a)` otherwise. Legacy `rgba()` is deliberate — the
 * whole point of the static fallback is reaching engines that predate the
 * modern space-separated syntax.
 */
export function formatColor(color: Rgba): string {
	const to255 = (n: number) => Math.round(clamp01(n) * 255);
	const r = to255(color.r);
	const g = to255(color.g);
	const b = to255(color.b);
	const a = clamp01(color.a);
	if (a >= 0.9995) {
		return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
	}
	return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}

/** sRGB gamma → linear-light. */
const toLinear = (c: number): number =>
	c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/** Linear-light → sRGB gamma. */
const toGamma = (c: number): number =>
	c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** Gamma-encoded sRGB → OKLab (Ottosson's transform, as specced in CSS Color 4). */
function srgbToOklab(r: number, g: number, b: number): [number, number, number] {
	const lr = toLinear(r);
	const lg = toLinear(g);
	const lb = toLinear(b);

	const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
	const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
	const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	return [
		0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
		1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
		0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
	];
}

/**
 * OKLab → gamma-encoded sRGB, clipped to gamut.
 *
 * Clipping (rather than the spec's CSS Gamut Mapping algorithm) is adequate
 * here: these values are only ever painted by engines without `color-mix()`,
 * and the mixes the generator produces (a color toward black/white, or toward
 * another in-gamut theme color) stay in or very near sRGB.
 */
function oklabToSrgb(
	L: number,
	A: number,
	B: number,
): { r: number; g: number; b: number } {
	const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
	const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
	const s_ = L - 0.0894841775 * A - 1.291485548 * B;

	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return {
		r: clamp01(toGamma(lr)),
		g: clamp01(toGamma(lg)),
		b: clamp01(toGamma(lb)),
	};
}

/** Project a color into the interpolation space's coordinate triple. */
function toSpace(color: Rgba, space: MixSpace): [number, number, number] {
	switch (space) {
		case "srgb":
			return [color.r, color.g, color.b];
		case "srgb-linear":
			return [toLinear(color.r), toLinear(color.g), toLinear(color.b)];
		case "oklab":
			return srgbToOklab(color.r, color.g, color.b);
	}
}

/** Inverse of {@link toSpace}. */
function fromSpace(
	coords: [number, number, number],
	space: MixSpace,
): { r: number; g: number; b: number } {
	switch (space) {
		case "srgb":
			return {
				r: clamp01(coords[0]),
				g: clamp01(coords[1]),
				b: clamp01(coords[2]),
			};
		case "srgb-linear":
			return {
				r: clamp01(toGamma(coords[0])),
				g: clamp01(toGamma(coords[1])),
				b: clamp01(toGamma(coords[2])),
			};
		case "oklab":
			return oklabToSrgb(coords[0], coords[1], coords[2]);
	}
}

/**
 * Mix two colors the way `color-mix()` does.
 *
 * Percentages follow CSS Color 5 normalization: an omitted percentage is
 * `100 - other`, both omitted is 50/50, and when the two sum to less than 100
 * the result's alpha is scaled by that sum. Interpolation is premultiplied by
 * alpha, which is why mixing an opaque color with `transparent` preserves the
 * color and only lowers alpha.
 *
 * @param space - Interpolation space
 * @param c1 - First color
 * @param p1 - First percentage (0-100), or null when omitted
 * @param c2 - Second color
 * @param p2 - Second percentage (0-100), or null when omitted
 * @returns The mixed color, or null if both percentages are zero (invalid)
 */
export function mixColors(
	space: MixSpace,
	c1: Rgba,
	p1: number | null,
	c2: Rgba,
	p2: number | null,
): Rgba | null {
	let a1: number;
	let a2: number;
	if (p1 === null && p2 === null) {
		a1 = 50;
		a2 = 50;
	} else if (p1 === null) {
		a2 = p2!;
		a1 = 100 - a2;
	} else if (p2 === null) {
		a1 = p1;
		a2 = 100 - a1;
	} else {
		a1 = p1;
		a2 = p2;
	}

	a1 = Math.max(0, Math.min(100, a1));
	a2 = Math.max(0, Math.min(100, a2));

	const sum = a1 + a2;
	if (sum === 0) return null;

	const w1 = a1 / sum;
	const w2 = a2 / sum;
	const alphaMultiplier = sum < 100 ? sum / 100 : 1;

	const s1 = toSpace(c1, space);
	const s2 = toSpace(c2, space);

	// Premultiply, interpolate, un-premultiply (CSS Color 4 § interpolation).
	const alpha = w1 * c1.a + w2 * c2.a;
	const coords = [0, 1, 2].map((i) => {
		const mixed = w1 * s1[i] * c1.a + w2 * s2[i] * c2.a;
		return alpha === 0 ? 0 : mixed / alpha;
	}) as [number, number, number];

	return { ...fromSpace(coords, space), a: clamp01(alpha * alphaMultiplier) };
}

/**
 * Split a `color-mix()` argument into its color and optional percentage.
 * The percentage may come before or after the color, per spec.
 */
function splitColorAndPct(arg: string): { color: string; pct: number | null } {
	const tokens = splitWhitespace(arg);
	const colorTokens: string[] = [];
	let pct: number | null = null;
	for (const token of tokens) {
		if (pct === null && /^[+-]?(\d+\.?\d*|\.\d+)%$/.test(token)) {
			pct = Number(token.slice(0, -1));
		} else {
			colorTokens.push(token);
		}
	}
	return { color: colorTokens.join(" "), pct };
}

/** Look up the value of a custom property by its name, without the leading `--`. */
export type VarLookup = (name: string) => string | undefined;

/**
 * Evaluate a CSS color expression to a literal color, resolving `var()`
 * references through `lookup` and computing nested `color-mix()` calls.
 *
 * Returns null when any operand is not statically resolvable — an undefined
 * variable with no fallback, an unsupported interpolation space (`oklch`,
 * `hsl`, `lab`, …), `currentColor`, a reference cycle, and so on. Callers
 * should treat null as "leave the original expression alone" rather than as an
 * error; approximating a mix we don't model exactly would be worse than
 * omitting the fallback.
 *
 * @param expr - The expression, e.g. `color-mix(in oklab, var(--x), black 10%)`
 * @param lookup - Resolves custom property names to their declared values
 */
export function evaluateColorExpression(
	expr: string,
	lookup: VarLookup = () => undefined,
): Rgba | null {
	return evaluate(expr, lookup, new Set());
}

function evaluate(expr: string, lookup: VarLookup, seen: Set<string>): Rgba | null {
	const input = expr.trim();
	if (!input) return null;

	const varInner = unwrapFn(input, "var");
	if (varInner !== null) {
		const args = splitTopLevel(varInner, ",");
		const name = args[0].trim().replace(/^--/, "");
		const fallback = args.length > 1 ? args.slice(1).join(",").trim() : null;
		if (seen.has(name)) return null;
		const value = lookup(name);
		if (value === undefined) {
			return fallback === null ? null : evaluate(fallback, lookup, seen);
		}
		const next = new Set(seen);
		next.add(name);
		return evaluate(value, lookup, next);
	}

	const mixInner = unwrapFn(input, "color-mix");
	if (mixInner !== null) {
		const args = splitTopLevel(mixInner, ",");
		if (args.length !== 3) return null;

		const spaceTokens = splitWhitespace(args[0]);
		if (spaceTokens.length !== 2 || spaceTokens[0].toLowerCase() !== "in") {
			return null;
		}
		const space = spaceTokens[1].toLowerCase();
		if (space !== "srgb" && space !== "srgb-linear" && space !== "oklab") return null;

		const left = splitColorAndPct(args[1]);
		const right = splitColorAndPct(args[2]);
		const c1 = evaluate(left.color, lookup, seen);
		const c2 = evaluate(right.color, lookup, seen);
		if (!c1 || !c2) return null;

		return mixColors(space, c1, left.pct, c2, right.pct);
	}

	return parseColor(input);
}

/**
 * Build an `rgba()` string from an opaque color and an alpha value.
 *
 * Provided for theme authors: `rgba(colors.blue[600], 0.25)` is exactly
 * equivalent to `color-mix(in srgb, <blue-600> 25%, transparent)` (mixing with
 * `transparent` is premultiplied, so only alpha changes) but carries no
 * `color-mix()` browser requirement.
 *
 * @param color - Any color {@link parseColor} understands
 * @param alpha - Alpha in `0..1`
 * @throws If `color` cannot be parsed
 */
export function rgba(color: string, alpha: number): string {
	const parsed = parseColor(color);
	if (!parsed) throw new TypeError(`Unparseable color: ${color}`);
	return formatColor({ ...parsed, a: clamp01(parsed.a * alpha) });
}
