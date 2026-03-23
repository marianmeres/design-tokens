import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.red[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.sky[400],
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
					DEFAULT: colors.white,
					foreground: colors.slate[900],
				},
				muted: {
					DEFAULT: colors.slate[100],
					foreground: colors.slate[500],
				},
				surface: {
					DEFAULT: colors.slate[200],
					foreground: colors.slate[900],
				},
				"surface-1": {
					DEFAULT: colors.slate[300],
					foreground: colors.slate[900],
				},
			},
			single: {
				foreground: colors.slate[900],
				border: {
					DEFAULT: colors.slate[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.slate[50],
				},
				ring: `color-mix(in srgb, ${colors.red[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.red[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.sky[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.red[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.amber[400],
				foreground: colors.white,
			},
			success: {
				DEFAULT: colors.emerald[500],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.slate[900],
					foreground: colors.slate[50],
				},
				muted: {
					DEFAULT: colors.slate[800],
					foreground: colors.slate[400],
				},
				surface: {
					DEFAULT: colors.slate[700],
					foreground: colors.slate[300],
				},
				"surface-1": {
					DEFAULT: colors.slate[600],
					foreground: colors.slate[200],
				},
			},
			single: {
				foreground: colors.slate[50],
				border: {
					DEFAULT: colors.slate[700],
				},
				input: {
					DEFAULT: colors.slate[900],
					hover: colors.slate[800],
				},
				ring: `color-mix(in srgb, ${colors.red[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
