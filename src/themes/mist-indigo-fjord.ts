import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.indigo[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.sky[500],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[600],
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
					DEFAULT: colors.mist[50],
					foreground: colors.mist[900],
				},
				muted: {
					DEFAULT: colors.mist[100],
					foreground: colors.mist[500],
				},
				surface: {
					DEFAULT: colors.mist[200],
					foreground: colors.mist[900],
				},
				"surface-1": {
					DEFAULT: colors.mist[300],
					foreground: colors.mist[900],
				},
			},
			single: {
				foreground: colors.mist[900],
				border: {
					DEFAULT: colors.mist[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.mist[50],
				},
				ring: `color-mix(in srgb, ${colors.indigo[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.indigo[400],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.sky[400],
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
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.mist[900],
					foreground: colors.mist[50],
				},
				muted: {
					DEFAULT: colors.mist[800],
					foreground: colors.mist[400],
				},
				surface: {
					DEFAULT: colors.mist[700],
					foreground: colors.mist[300],
				},
				"surface-1": {
					DEFAULT: colors.mist[600],
					foreground: colors.mist[200],
				},
			},
			single: {
				foreground: colors.mist[50],
				border: {
					DEFAULT: colors.mist[700],
				},
				input: {
					DEFAULT: colors.mist[900],
					hover: colors.mist[800],
				},
				ring: `color-mix(in srgb, ${colors.indigo[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Indigo primary / sky accent on mist base — cool Nordic fjord tones. */
export default theme;
