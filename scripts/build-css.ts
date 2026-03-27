import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import * as themes from "../src/themes/mod.ts";
import { generateThemeCss } from "../src/generate.ts";

const PREFIX = "stuic-";
const OUT_DIR = "css";

/** camelCase → kebab-case */
function toKebab(s: string): string {
	return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

await ensureDir(OUT_DIR);

const entries = Object.entries(themes).filter(([k]) => k !== "ThemeSchema");

for (const [name, theme] of entries) {
	const css = "/* prettier-ignore */\n" + generateThemeCss(theme, PREFIX);
	const fileName = `${toKebab(name)}.css`;
	await Deno.writeTextFile(join(OUT_DIR, fileName), css);
}

console.log(`Generated ${entries.length} CSS files in ${OUT_DIR}/`);
