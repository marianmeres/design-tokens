import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Electric Lemonade — the cocktail: blue curaçao over lemon. Cobalt primary
// with a lime twist; light mode is poured over lemon-cream surfaces, dark
// mode is the same drink under blacklight (deep sky-navy).

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.blue[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.lime[400],
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
					DEFAULT: colors.yellow[50],
					foreground: colors.yellow[950],
				},
				muted: {
					DEFAULT: colors.yellow[100],
					foreground: colors.yellow[700],
				},
				surface: {
					DEFAULT: colors.yellow[200],
					foreground: colors.yellow[950],
				},
				"surface-1": {
					DEFAULT: colors.yellow[300],
					foreground: colors.yellow[950],
				},
			},
			single: {
				foreground: colors.yellow[950],
				border: {
					DEFAULT: colors.yellow[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.yellow[50],
				},
				ring: `color-mix(in srgb, ${colors.blue[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.blue[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.lime[400],
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
				foreground: colors.black,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.sky[950],
					foreground: colors.sky[50],
				},
				muted: {
					DEFAULT: colors.sky[900],
					foreground: colors.sky[400],
				},
				surface: {
					DEFAULT: colors.sky[800],
					foreground: colors.sky[200],
				},
				"surface-1": {
					DEFAULT: colors.sky[700],
					foreground: colors.sky[100],
				},
			},
			single: {
				foreground: colors.sky[50],
				border: {
					DEFAULT: colors.sky[800],
				},
				input: {
					DEFAULT: colors.sky[950],
					hover: colors.sky[900],
				},
				ring: `color-mix(in srgb, ${colors.blue[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Cobalt primary / lime accent — lemon-cream light surfaces, blue-curaçao navy dark. */
export default theme;
