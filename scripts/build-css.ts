import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import * as themes from "../src/themes/mod.ts";
import { generateThemeCss } from "../src/generate.ts";

const PREFIX = "stuic-";
const OUT_DIR = "css";
const DENO_JSON = "deno.json";

/** camelCase → kebab-case */
function toKebab(s: string): string {
	return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

await ensureDir(OUT_DIR);

const entries = Object.entries(themes).filter(
	([k]) => k !== "ThemeSchema",
);

const fileNames: string[] = [];

for (const [name, theme] of entries) {
	const fileName = `${toKebab(name)}.css`;
	const css = generateThemeCss(theme, PREFIX);
	await Deno.writeTextFile(join(OUT_DIR, fileName), css);
	fileNames.push(fileName);
}

console.log(`Generated ${fileNames.length} CSS files in ${OUT_DIR}/`);

// Update deno.json exports with individual CSS entries
const denoJson = JSON.parse(Deno.readTextFileSync(DENO_JSON));
const exports: Record<string, string> = {};

// Preserve non-CSS exports
for (const [key, value] of Object.entries(denoJson.exports)) {
	if (!key.startsWith("./css/")) {
		exports[key] = value as string;
	}
}

// Add CSS exports
for (const fileName of fileNames.sort()) {
	exports[`./css/${fileName}`] = `./${OUT_DIR}/${fileName}`;
}

denoJson.exports = exports;
Deno.writeTextFileSync(DENO_JSON, JSON.stringify(denoJson, null, 2) + "\n");
console.log(`Updated ${DENO_JSON} exports with ${fileNames.length} CSS entries`);
