import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

// Night candy — highlighter lime and bubblegum pink on a midnight indigo. The
// theme is dark-first: dark mode is the real design, light mode is its daylight
// translation, which means the lime has to drop two steps (a #bef264 button on
// white paper is a 1.3:1 label, and primary-as-text would vanish outright).
// The lime comes from the palette; the pink is authored — the bundled pink is
// more magenta and the bundled rose more salmon than this bubblegum.

const lime = colors.lime[300]; // dark-mode primary — the candy
const limeDeep = colors.lime[500]; // light-mode primary — same hue, readable on paper
const candy = "#f2749f";

// midnight indigo ramp (dark mode)
const night = {
	50: "#f6f5fb",
	200: "#d9d7e6",
	300: "#b6b3cd",
	400: "#8b87ad",
	600: "#33304f",
	700: "#262340",
	800: "#1c1a35",
	900: "#14122a",
};

// lilac-tinted paper ramp (light mode)
const dawn = {
	50: "#f8f7fd",
	100: "#f0eefa",
	200: "#e5e2f3",
	300: "#d4d0e9",
	500: "#6d6989",
	900: "#14122a",
};

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: limeDeep,
				foreground: colors.black,
			},
			accent: {
				DEFAULT: candy,
				foreground: dawn[900],
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
					DEFAULT: dawn[50],
					foreground: dawn[900],
				},
				muted: {
					DEFAULT: dawn[100],
					foreground: dawn[500],
				},
				surface: {
					DEFAULT: dawn[200],
					foreground: dawn[900],
				},
				"surface-1": {
					DEFAULT: dawn[300],
					foreground: dawn[900],
				},
			},
			single: {
				foreground: dawn[900],
				border: {
					DEFAULT: dawn[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: dawn[50],
				},
				ring: rgba(limeDeep, 0.25),
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: lime,
				foreground: night[900],
			},
			accent: {
				DEFAULT: candy,
				foreground: night[900],
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
					DEFAULT: night[900],
					foreground: night[50],
				},
				muted: {
					DEFAULT: night[800],
					foreground: night[400],
				},
				surface: {
					DEFAULT: night[700],
					foreground: night[300],
				},
				"surface-1": {
					DEFAULT: night[600],
					foreground: night[200],
				},
			},
			single: {
				foreground: night[50],
				border: {
					DEFAULT: night[700],
				},
				input: {
					DEFAULT: night[900],
					hover: night[800],
				},
				ring: rgba(lime, 0.25),
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Highlighter lime primary / bubblegum pink accent on midnight indigo — dark-first, with a lilac-paper light mode. */
export default theme;
