import { assert, assertEquals } from "@std/assert";
import {
	bundledThemeNames,
	bundledThemes,
	getBundledTheme,
	themeNames,
} from "../src/themes/mod.ts";

Deno.test("bundledThemeNames does not leak themeNames or ThemeSchema exports", () => {
	assert(!bundledThemeNames.includes("themeNames"));
	assert(!bundledThemeNames.includes("ThemeSchema"));
});

Deno.test("bundledThemeNames matches kebab-case themeNames count", () => {
	assertEquals(bundledThemeNames.length, themeNames.length);
});

Deno.test("bundledThemes contains a known theme (gray) with required intent keys", () => {
	const gray = bundledThemes["gray"];
	assert(gray);
	assert(gray.light.colors.intent.primary);
	assert(gray.light.colors.intent.accent);
});

Deno.test("getBundledTheme returns undefined for unknown name", () => {
	assertEquals(getBundledTheme("nonexistent"), undefined);
});

Deno.test("getBundledTheme returns a ThemeSchema for a known name", () => {
	const t = getBundledTheme("gray");
	assert(t);
	assert(t.light);
});

Deno.test("getBundledTheme does not treat 'themeNames' as a theme", () => {
	assertEquals(getBundledTheme("themeNames"), undefined);
});
