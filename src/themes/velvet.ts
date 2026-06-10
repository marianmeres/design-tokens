import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Velvet — burgundy and gold, rose-monochrome luxe. Light mode is blush
// velvet (rose surfaces with a deep wine primary), dark mode is the same
// fabric in a candle-lit room: wine-black with salmon and gold pops.

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[900],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.amber[400],
				foreground: colors.black,
			},
			destructive: {
				DEFAULT: colors.red[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.orange[500],
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
					DEFAULT: colors.rose[50],
					foreground: colors.rose[950],
				},
				muted: {
					DEFAULT: colors.rose[100],
					foreground: colors.rose[700],
				},
				surface: {
					DEFAULT: colors.rose[200],
					foreground: colors.rose[950],
				},
				"surface-1": {
					DEFAULT: colors.rose[300],
					foreground: colors.rose[950],
				},
			},
			single: {
				foreground: colors.rose[950],
				border: {
					DEFAULT: colors.rose[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.rose[50],
				},
				ring: `color-mix(in srgb, ${colors.rose[900]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[400],
				foreground: colors.black,
			},
			accent: {
				DEFAULT: colors.amber[400],
				foreground: colors.black,
			},
			destructive: {
				DEFAULT: colors.red[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.orange[400],
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
					DEFAULT: colors.rose[950],
					foreground: colors.rose[50],
				},
				muted: {
					DEFAULT: colors.rose[900],
					foreground: colors.rose[300],
				},
				surface: {
					DEFAULT: colors.rose[800],
					foreground: colors.rose[200],
				},
				"surface-1": {
					DEFAULT: colors.rose[700],
					foreground: colors.rose[100],
				},
			},
			single: {
				foreground: colors.rose[50],
				border: {
					DEFAULT: colors.rose[800],
				},
				input: {
					DEFAULT: colors.rose[950],
					hover: colors.rose[900],
				},
				ring: `color-mix(in srgb, ${colors.rose[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Burgundy primary / gold accent on rose-monochrome surfaces — blush velvet light, wine-black dark. */
export default theme;
