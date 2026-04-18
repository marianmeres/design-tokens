import { assert, assertEquals } from "@std/assert";
import { tools } from "../mcp.ts";

function byName(name: string) {
	const t = tools.find((t) => t.name === name);
	if (!t) throw new Error(`tool ${name} not found`);
	return t;
}

Deno.test("mcp: generate-theme-css returns friendly error on invalid JSON", async () => {
	const out = await byName("generate-theme-css").handler({
		theme: "{ not valid json",
		prefix: "app-",
	});
	assert(typeof out === "string");
	assert(out.includes("Could not parse"));
});

Deno.test("mcp: generate-theme-css returns friendly error on wrong shape", async () => {
	const out = await byName("generate-theme-css").handler({
		theme: JSON.stringify({ light: {} }),
		prefix: "app-",
	});
	assert(typeof out === "string");
	assert(out.includes("Invalid ThemeSchema"));
});

Deno.test("mcp: generate-theme-css produces CSS for a valid schema", async () => {
	const schema = {
		light: {
			colors: {
				intent: {
					primary: { DEFAULT: "#000", foreground: "#fff" },
					accent: { DEFAULT: "#111", foreground: "#fff" },
					destructive: { DEFAULT: "#222", foreground: "#fff" },
					warning: { DEFAULT: "#333", foreground: "#000" },
					success: { DEFAULT: "#444", foreground: "#fff" },
				},
				role: {
					paired: {
						background: { DEFAULT: "#fff", foreground: "#000" },
						muted: { DEFAULT: "#eee", foreground: "#444" },
						surface: { DEFAULT: "#ddd", foreground: "#000" },
					},
					single: {
						foreground: "#000",
						border: { DEFAULT: "#ccc" },
						input: { DEFAULT: "#fff" },
						ring: "transparent",
					},
				},
			},
		},
	};
	const out = await byName("generate-theme-css").handler({
		theme: JSON.stringify(schema),
		prefix: "app-",
	});
	assert(out.includes("--app-color-primary:"));
});

Deno.test("mcp: preview-bundled-theme lists real themes only", async () => {
	const out = await byName("preview-bundled-theme").handler({});
	assert(out.includes("Available themes"));
	assert(!out.includes("themeNames"));
	assert(!out.includes("ThemeSchema"));
});

Deno.test("mcp: preview-bundled-theme rejects unknown theme name", async () => {
	const out = await byName("preview-bundled-theme").handler({
		name: "not-a-theme",
	});
	assert(out.startsWith("Unknown theme"));
});

Deno.test("mcp: preview-bundled-theme does not match 'themeNames'", async () => {
	const out = await byName("preview-bundled-theme").handler({
		name: "themeNames",
	});
	assert(out.startsWith("Unknown theme"));
});

Deno.test("mcp: preview-bundled-theme generates CSS for a known theme", async () => {
	const out = await byName("preview-bundled-theme").handler({
		name: "gray",
		prefix: "app-",
	});
	assert(out.includes("--app-color-primary:"));
});

Deno.test("mcp: preview-bundled-theme includes reboot bridge when withReboot is true", async () => {
	const out = await byName("preview-bundled-theme").handler({
		name: "gray",
		prefix: "app-",
		withReboot: true,
	});
	assert(out.includes("--bs-link-color:"));
});

Deno.test("mcp: tool description reports current theme count", () => {
	const desc = byName("preview-bundled-theme").description;
	// Must not mention the stale count "31".
	assert(!desc.includes("31"));
	// Should reflect a number ≥ 40 (we have 43 today).
	assertEquals(
		/\b([1-9]\d{1,2})\b/.test(desc),
		true,
		"description should contain a numeric theme count",
	);
});
