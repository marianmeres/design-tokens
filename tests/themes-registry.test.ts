import assert from "node:assert/strict";
import { test } from "node:test";
import {
	bundledThemeNames,
	bundledThemes,
	getBundledTheme,
	themeNames,
} from "../src/themes/mod.ts";

test("bundledThemeNames does not leak themeNames or ThemeSchema exports", () => {
	assert.ok(!bundledThemeNames.includes("themeNames"));
	assert.ok(!bundledThemeNames.includes("ThemeSchema"));
});

test("bundledThemeNames matches kebab-case themeNames count", () => {
	assert.deepStrictEqual(bundledThemeNames.length, themeNames.length);
});

test("bundledThemes contains a known theme (gray) with required intent keys", () => {
	const gray = bundledThemes["gray"];
	assert.ok(gray);
	assert.ok(gray.light.colors.intent.primary);
	assert.ok(gray.light.colors.intent.accent);
});

test("getBundledTheme returns undefined for unknown name", () => {
	assert.deepStrictEqual(getBundledTheme("nonexistent"), undefined);
});

test("getBundledTheme returns a ThemeSchema for a known name", () => {
	const t = getBundledTheme("gray");
	assert.ok(t);
	assert.ok(t.light);
});

test("getBundledTheme does not treat 'themeNames' as a theme", () => {
	assert.deepStrictEqual(getBundledTheme("themeNames"), undefined);
});
