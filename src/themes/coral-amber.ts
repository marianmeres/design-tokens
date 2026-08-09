import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

// Coral amber — terracotta brick primary with a warm gold accent on peach-cream
// surfaces. Neither signature color exists in the bundled palette (Tailwind's
// red is crimson, its orange is burnt, its amber is yellower), so both are
// authored verbatim and the neutrals ride a peach-tinted ramp instead of a
// grey one. Dark mode keeps both brand colors and drops the surfaces into a
// roasted-coffee brown.

const coral = "#c0442b";
const coralLight = "#cf5136"; // dark-mode primary — a touch brighter on brown
const gold = "#f5c264";

// peach-cream neutral ramp (light mode)
const cream = {
	50: "#fdf3ec",
	100: "#f9e8dd",
	200: "#f3dccd",
	300: "#ecceba",
	500: "#8a6a58",
	900: "#2a1c15",
};

// roasted brown ramp (dark mode)
const roast = {
	50: "#fbf1ea",
	200: "#e8d5c8",
	300: "#d3b8a6",
	400: "#b0917d",
	600: "#5a4133",
	700: "#453024",
	800: "#33221a",
	900: "#221610",
};

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: coral,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: gold,
				foreground: cream[900],
			},
			destructive: {
				DEFAULT: colors.red[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.amber[500],
				foreground: colors.white,
			},
			success: {
				DEFAULT: colors.emerald[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: cream[50],
					foreground: cream[900],
				},
				muted: {
					DEFAULT: cream[100],
					foreground: cream[500],
				},
				surface: {
					DEFAULT: cream[200],
					foreground: cream[900],
				},
				"surface-1": {
					DEFAULT: cream[300],
					foreground: cream[900],
				},
			},
			single: {
				foreground: cream[900],
				border: {
					DEFAULT: cream[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: cream[50],
				},
				ring: rgba(coral, 0.2),
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: coralLight,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: gold,
				foreground: roast[900],
			},
			destructive: {
				DEFAULT: colors.red[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.amber[400],
				foreground: colors.black,
			},
			success: {
				DEFAULT: colors.emerald[500],
				foreground: colors.black,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: roast[900],
					foreground: roast[50],
				},
				muted: {
					DEFAULT: roast[800],
					foreground: roast[400],
				},
				surface: {
					DEFAULT: roast[700],
					foreground: roast[300],
				},
				"surface-1": {
					DEFAULT: roast[600],
					foreground: roast[200],
				},
			},
			single: {
				foreground: roast[50],
				border: {
					DEFAULT: roast[700],
				},
				input: {
					DEFAULT: roast[900],
					hover: roast[800],
				},
				ring: rgba(coralLight, 0.25),
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Terracotta coral primary / warm gold accent on peach-cream surfaces — roasted brown dark mode. */
export default theme;
