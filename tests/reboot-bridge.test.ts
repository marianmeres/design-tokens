import { assert, assertEquals } from "@std/assert";
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

Deno.test("generateRebootBridge - maps primary to bs-link-color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-link-color"], "#0d6efd");
});

Deno.test("generateRebootBridge - generates RGB triplet for link color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-link-color-rgb"], "13, 110, 253");
});

Deno.test("generateRebootBridge - maps background to bs-body-bg", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-body-bg"], "#ffffff");
	assertEquals(bridge["bs-body-bg-rgb"], "255, 255, 255");
});

Deno.test("generateRebootBridge - maps background-foreground to bs-body-color", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-body-color"], "#212529");
	assertEquals(bridge["bs-body-color-rgb"], "33, 37, 41");
});

Deno.test("generateRebootBridge - maps destructive to bs-danger", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-danger"], "#dc3545");
});

Deno.test("generateRebootBridge - maps semantic colors", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-primary"], "#0d6efd");
	assertEquals(bridge["bs-warning"], "#ffc107");
	assertEquals(bridge["bs-success"], "#198754");
});

Deno.test("generateRebootBridge - maps border", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-border-color"], "#dee2e6");
});

Deno.test("generateRebootBridge - maps muted to secondary", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	assertEquals(bridge["bs-secondary-bg"], "#f8f9fa");
	assertEquals(bridge["bs-secondary-color"], "#6c757d");
});

Deno.test("generateRebootBridge - link-hover uses primary-hover token", () => {
	const tokens = generateCssTokens(schema, PREFIX);
	const bridge = generateRebootBridge(tokens, PREFIX);
	// primary-hover is auto-derived via color-mix, so bs-link-hover-color
	// should exist but won't be a plain hex (so no -rgb companion)
	assert(bridge["bs-link-hover-color"]);
});

// --- generateThemedCss ---

Deno.test("generateThemedCss - contains both tokens and bridge vars", () => {
	const themeSchema: ThemeSchema = { light: schema };
	const css = generateThemedCss(themeSchema, PREFIX);
	assert(css.includes("--my-color-primary:"));
	assert(css.includes("--bs-link-color:"));
	assert(css.includes("--bs-body-bg:"));
});

Deno.test("generateThemedCss - dark mode section present when dark schema provided", () => {
	const themeSchema: ThemeSchema = {
		light: schema,
		dark: schema,
	};
	const css = generateThemedCss(themeSchema, PREFIX);
	assert(css.includes(":root {"));
	assert(css.includes(":root.dark {"));
	// Both sections should have bridge vars
	const parts = css.split(":root.dark");
	assert(parts[0].includes("--bs-link-color:"));
	assert(parts[1].includes("--bs-link-color:"));
});
