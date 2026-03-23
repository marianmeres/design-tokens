import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.violet[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.rose[500],
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
					DEFAULT: colors.neutral[50],
					foreground: colors.zinc[900],
				},
				muted: {
					DEFAULT: colors.zinc[100],
					foreground: colors.zinc[500],
				},
				surface: {
					DEFAULT: colors.zinc[200],
					foreground: colors.zinc[900],
				},
				"surface-1": {
					DEFAULT: colors.zinc[300],
					foreground: colors.zinc[900],
				},
			},
			single: {
				foreground: colors.zinc[900],
				border: {
					DEFAULT: colors.zinc[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.neutral[50],
				},
				ring: `color-mix(in srgb, ${colors.violet[500]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.violet[400],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.rose[400],
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
					DEFAULT: colors.zinc[950],
					foreground: colors.neutral[50],
				},
				muted: {
					DEFAULT: colors.zinc[900],
					foreground: colors.zinc[500],
				},
				surface: {
					DEFAULT: colors.zinc[800],
					foreground: colors.zinc[400],
				},
				"surface-1": {
					DEFAULT: colors.zinc[700],
					foreground: colors.zinc[300],
				},
			},
			single: {
				foreground: colors.neutral[50],
				border: {
					DEFAULT: colors.zinc[700],
				},
				input: {
					DEFAULT: colors.zinc[950],
					hover: colors.zinc[900],
				},
				ring: `color-mix(in srgb, ${colors.violet[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
