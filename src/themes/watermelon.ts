import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Watermelon — fresh mint rind around a hot pink heart. The two brand colors
// are used verbatim (no palette approximation). Surfaces carry the fruit's
// anatomy: light mode is tinted mint-cream (the rind), dark mode flips to a
// deep plum wine (the flesh after midnight).

const pink = "#f6329b";
const mint = "#5deab5";

// mint-tinted neutral ramp (light mode "rind")
const rind = {
	50: "#f2faf6",
	100: "#e4f2ea",
	200: "#d2e7dc",
	300: "#bedacb",
	500: "#5f7a6c",
	900: "#14281e",
};

// plum-tinted dark ramp (dark mode "midnight flesh")
const flesh = {
	50: "#fbf3f7",
	200: "#e7d4dd",
	300: "#d4bac7",
	400: "#b394a4",
	600: "#5a384c",
	700: "#482b3d",
	800: "#36202e",
	900: "#251521",
};

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: pink,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: mint,
				foreground: colors.emerald[950],
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
					DEFAULT: rind[50],
					foreground: rind[900],
				},
				muted: {
					DEFAULT: rind[100],
					foreground: rind[500],
				},
				surface: {
					DEFAULT: rind[200],
					foreground: rind[900],
				},
				"surface-1": {
					DEFAULT: rind[300],
					foreground: rind[900],
				},
			},
			single: {
				foreground: rind[900],
				border: {
					DEFAULT: rind[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: rind[50],
				},
				ring: `color-mix(in srgb, ${pink} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: pink,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: mint,
				foreground: colors.emerald[950],
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
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: flesh[900],
					foreground: flesh[50],
				},
				muted: {
					DEFAULT: flesh[800],
					foreground: flesh[400],
				},
				surface: {
					DEFAULT: flesh[700],
					foreground: flesh[300],
				},
				"surface-1": {
					DEFAULT: flesh[600],
					foreground: flesh[200],
				},
			},
			single: {
				foreground: flesh[50],
				border: {
					DEFAULT: flesh[700],
				},
				input: {
					DEFAULT: flesh[900],
					hover: flesh[800],
				},
				ring: `color-mix(in srgb, ${pink} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Hot pink primary / mint accent (favicon-exact) — watermelon: mint rind light surfaces, plum flesh dark surfaces. */
export default theme;
