import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

// Monokai Pink — the iconic Monokai look with hot pink primary and purple accent
// Approximation of classic Monokai palette to Tailwind colors

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.violet[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.amber[500],
				foreground: colors.black,
			},
			success: {
				DEFAULT: colors.emerald[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.stone[50],
					foreground: colors.stone[900],
				},
				muted: {
					DEFAULT: colors.stone[100],
					foreground: colors.stone[500],
				},
				surface: {
					DEFAULT: colors.stone[200],
					foreground: colors.stone[900],
				},
				"surface-1": {
					DEFAULT: colors.stone[300],
					foreground: colors.stone[900],
				},
			},
			single: {
				foreground: colors.stone[900],
				border: {
					DEFAULT: colors.stone[300],
				},
				input: {
					DEFAULT: colors.stone[50],
					hover: colors.stone[100],
				},
				ring: rgba(colors.rose[500], 0.2),
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.violet[500],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[500],
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
					DEFAULT: colors.stone[900],
					foreground: colors.stone[50],
				},
				muted: {
					DEFAULT: colors.stone[800],
					foreground: colors.stone[400],
				},
				surface: {
					DEFAULT: colors.stone[700],
					foreground: colors.stone[300],
				},
				"surface-1": {
					DEFAULT: colors.stone[600],
					foreground: colors.stone[200],
				},
			},
			single: {
				foreground: colors.stone[50],
				border: {
					DEFAULT: colors.stone[700],
				},
				input: {
					DEFAULT: colors.stone[900],
					hover: colors.stone[800],
				},
				ring: rgba(colors.rose[500], 0.25),
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Monokai-inspired theme with pink accent. */
export default theme;
