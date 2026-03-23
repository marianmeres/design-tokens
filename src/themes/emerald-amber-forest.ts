import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.emerald[700],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.amber[600],
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
					DEFAULT: colors.amber[50],
					foreground: colors.stone[900],
				},
				muted: {
					DEFAULT: colors.amber[100],
					foreground: colors.amber[500],
				},
				surface: {
					DEFAULT: colors.amber[200],
					foreground: colors.amber[900],
				},
				"surface-1": {
					DEFAULT: colors.amber[300],
					foreground: colors.amber[900],
				},
			},
			single: {
				foreground: colors.stone[900],
				border: {
					DEFAULT: colors.stone[300],
				},
				input: {
					DEFAULT: colors.amber[50],
					hover: colors.stone[100],
				},
				ring: `color-mix(in srgb, ${colors.emerald[700]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.emerald[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.amber[500],
				foreground: colors.black,
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
					DEFAULT: colors.stone[600],
				},
				input: {
					DEFAULT: colors.stone[900],
					hover: colors.stone[800],
				},
				ring: `color-mix(in srgb, ${colors.emerald[500]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
