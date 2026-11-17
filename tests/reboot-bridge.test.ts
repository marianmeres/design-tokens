import assert from "node:assert/strict";
import { test } from "node:test";
import { generateCssTokens } from "../src/generate.ts";
import { generateRebootBridge, generateThemedCss } from "../src/reboot-bridge.ts";
import type { ThemeSchema, TokenSchema } from "../src/types.ts";

const schema: TokenSchema = {
	colors: {
		intent: {
			primary: { DEFAULT: "#0d6efd", foreground: "#ffffff" },
			accent: { DEFAULT: "#6c757d", foreground: "#ffffff" },
			destructive: { DEFAULT: "#dc3545", foreground: "#ffffff" },
			warning: { DEFAULT: "#ffc107", foreground: "#000000" },
			success: { DEFAULT: "#198754", foreground: "#ffffff" },
		},
		role: {
			paired: {
				background: {
					DEFAULT: "#ffffff",
					foreground: "#212529",
				},
				muted: { DEFAULT: "#f8f9fa", foreground: "#6c757d" },
				surface: { DEFAULT: "#e9ecef", foreground: "#212529" },
			},
			single: {
				foreground: "#212529",
				border: { DEFAULT: "#dee2e6" },
				input: { DEFAULT: "#ffffff" },
				ring: "color-mix(in srgb, #0d6efd 25%, transparent)",
			},
		},
	},
};

const PREFIX = "my-";

// --- generateRebootBridge ---

test("generateRebootBridge - maps primary to bs-link-color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-link-color"], "var(--my-color-primary)");
});

test("generateRebootBridge - generates RGB triplet for link color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-link-color-rgb"], "13, 110, 253");
});

test("generateRebootBridge - maps background to bs-body-bg", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-body-bg"], "var(--my-color-background)");
	assert.deepStrictEqual(bridge["bs-body-bg-rgb"], "255, 255, 255");
});

test("generateRebootBridge - maps background-foreground to bs-body-color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(
		bridge["bs-body-color"],
		"var(--my-color-background-foreground)",
	);
	assert.deepStrictEqual(bridge["bs-body-color-rgb"], "33, 37, 41");
});

test("generateRebootBridge - maps destructive to bs-danger", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-danger"], "var(--my-color-destructive)");
});

test("generateRebootBridge - maps semantic colors", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-primary"], "var(--my-color-primary)");
	assert.deepStrictEqual(bridge["bs-warning"], "var(--my-color-warning)");
	assert.deepStrictEqual(bridge["bs-success"], "var(--my-color-success)");
});

test("generateRebootBridge - maps border", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-border-color"], "var(--my-color-border)");
});

test("generateRebootBridge - maps muted to secondary", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.deepStrictEqual(bridge["bs-secondary-bg"], "var(--my-color-muted)");
	assert.deepStrictEqual(
		bridge["bs-secondary-color"],
		"var(--my-color-muted-foreground)",
	);
});

test("generateRebootBridge - link-hover uses primary-hover token", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	// link-hover should reference the token var, not the raw color-mix value
	assert.deepStrictEqual(
		bridge["bs-link-hover-color"],
		"var(--my-color-primary-hover)",
	);
});

// --- generateThemedCss ---

test("generateThemedCss - contains both tokens and bridge vars", () => {
	const themeSchema: ThemeSchema = { light: schema };
	const css = generateThemedCss(themeSchema, PREFIX);
	assert.ok(css.includes("--my-color-primary:"));
	assert.ok(css.includes("--bs-link-color:"));
	assert.ok(css.includes("--bs-body-bg:"));
});

test("generateThemedCss - dark mode section present when dark schema provided", () => {
	const themeSchema: ThemeSchema = {
		light: schema,
		dark: schema,
	};
	const css = generateThemedCss(themeSchema, PREFIX);
	assert.ok(css.includes(":root {"));
	assert.ok(css.includes(":root.dark {"));
	// Both sections should have bridge vars
	const parts = css.split(":root.dark");
	assert.ok(parts[0].includes("--bs-link-color:"));
	assert.ok(parts[1].includes("--bs-link-color:"));
});

// --- legacy fallback ---

test("generateThemedCss - defaults to the @supports fallback", () => {
	const css = generateThemedCss({ light: schema, dark: schema }, PREFIX);
	assert.ok(css.includes("@supports not (color: color-mix(in oklab, red, blue))"));
	// Additive: the pre-fallback output is still a prefix of the new one.
	const none = generateThemedCss({ light: schema, dark: schema }, PREFIX, {
		fallback: "none",
	});
	assert.ok(css.startsWith(none));
});

test("generateThemedCss - fallback 'static' emits zero color-mix", () => {
	const css = generateThemedCss({ light: schema, dark: schema }, PREFIX, {
		fallback: "static",
	});
	assert.deepStrictEqual(css.includes("color-mix("), false);
});

// The gap documented on generateRebootBridge: -rgb companions are omitted when
// the token is a color-mix() expression. Static mode closes it.
test("generateRebootBridge - omits the -rgb companion for color-mix tokens", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.ok(bridge["bs-link-hover-color"]);
	assert.deepStrictEqual(bridge["bs-link-hover-color-rgb"], undefined);
});

test("generateRebootBridge - static tokens restore the -rgb companion", () => {
	const tokens = generateCssTokens(schema, PREFIX, { fallback: "static" });
	const bridge = generateRebootBridge(tokens, PREFIX);
	assert.ok(bridge["bs-link-hover-color-rgb"]);
	// #0d6efd (13, 110, 253) mixed 10% toward black in oklab
	assert.deepStrictEqual(bridge["bs-link-hover-color-rgb"], "10, 95, 220");
});
