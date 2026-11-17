import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateThemeCss } from "../src/generate.ts";
import { bundledThemes } from "../src/themes/mod.ts";

const PREFIX = process.env.CSS_PREFIX ?? "stuic-";
const OUT_DIR = "css";

/** camelCase → kebab-case */
function toKebab(s: string): string {
	return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

await mkdir(OUT_DIR, { recursive: true });

const entries = Object.entries(bundledThemes);

for (const [name, theme] of entries) {
	const css = generateThemeCss(theme, PREFIX, { prettierIgnore: true });
	const fileName = `${toKebab(name)}.css`;
	await writeFile(join(OUT_DIR, fileName), css);
}

console.log(
	`Generated ${entries.length} CSS files in ${OUT_DIR}/ with prefix "${PREFIX}".`,
);
