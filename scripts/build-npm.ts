import { npmBuild } from "@marianmeres/npmbuild";
import { copy } from "@std/fs";

const denoJson = JSON.parse(Deno.readTextFileSync("deno.json"));

await npmBuild({
	name: denoJson.name,
	version: denoJson.version,
	repository: denoJson.name.replace(/^@/, ""),
	entryPoints: ["mod", "reboot-bridge", "themes/mod"],
	packageJsonOverrides: {
		exports: {
			"./reboot": {
				types: "./dist/reboot-bridge.d.ts",
				import: "./dist/reboot-bridge.js",
			},
			"./themes": {
				types: "./dist/themes/mod.d.ts",
				import: "./dist/themes/mod.js",
			},
			"./css/*": "./dist/css/*",
		},
	},
});

// Copy pre-built CSS files into npm dist
await copy("css", ".npm-dist/dist/css", { overwrite: true });
console.log("Copied css/ into .npm-dist/dist/css/");
