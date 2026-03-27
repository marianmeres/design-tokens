import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.pink[500],
				foreground: colors.white,
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
					DEFAULT: colors.taupe[50],
					foreground: colors.taupe[900],
				},
				muted: {
					DEFAULT: colors.taupe[100],
					foreground: colors.taupe[500],
				},
				surface: {
					DEFAULT: colors.taupe[200],
					foreground: colors.taupe[900],
				},
				"surface-1": {
					DEFAULT: colors.taupe[300],
					foreground: colors.taupe[900],
				},
			},
			single: {
				foreground: colors.taupe[900],
				border: {
					DEFAULT: colors.taupe[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.taupe[50],
				},
				ring: `color-mix(in srgb, ${colors.rose[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.rose[400],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.pink[400],
				foreground: colors.white,
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
					DEFAULT: colors.taupe[900],
					foreground: colors.taupe[50],
				},
				muted: {
					DEFAULT: colors.taupe[800],
					foreground: colors.taupe[400],
				},
				surface: {
					DEFAULT: colors.taupe[700],
					foreground: colors.taupe[300],
				},
				"surface-1": {
					DEFAULT: colors.taupe[600],
					foreground: colors.taupe[200],
				},
			},
			single: {
				foreground: colors.taupe[50],
				border: {
					DEFAULT: colors.taupe[700],
				},
				input: {
					DEFAULT: colors.taupe[900],
					hover: colors.taupe[800],
				},
				ring: `color-mix(in srgb, ${colors.rose[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Rose primary / pink accent on taupe base — warm blush tones. */
export default theme;
