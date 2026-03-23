import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.orange[600],
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
					DEFAULT: colors.orange[50],
					foreground: colors.stone[900],
				},
				muted: {
					DEFAULT: colors.amber[100],
					foreground: colors.stone[500],
				},
				surface: {
					DEFAULT: colors.amber[200],
					foreground: colors.stone[900],
				},
				"surface-1": {
					DEFAULT: colors.amber[300],
					foreground: colors.stone[900],
				},
			},
			single: {
				foreground: colors.stone[900],
				border: {
					DEFAULT: colors.amber[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.orange[50],
				},
				ring: `color-mix(in srgb, ${colors.orange[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.orange[500],
				foreground: colors.black,
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
					DEFAULT: colors.stone[950],
					foreground: colors.stone[50],
				},
				muted: {
					DEFAULT: colors.stone[900],
					foreground: colors.stone[500],
				},
				surface: {
					DEFAULT: colors.stone[800],
					foreground: colors.stone[400],
				},
				"surface-1": {
					DEFAULT: colors.stone[700],
					foreground: colors.stone[300],
				},
			},
			single: {
				foreground: colors.stone[50],
				border: {
					DEFAULT: colors.stone[700],
				},
				input: {
					DEFAULT: colors.stone[950],
					hover: colors.stone[900],
				},
				ring: `color-mix(in srgb, ${colors.orange[500]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
