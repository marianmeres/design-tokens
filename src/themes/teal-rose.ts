import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.teal[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.orange[500],
				foreground: colors.white,
			},
			success: {
				DEFAULT: colors.teal[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.white,
					foreground: colors.neutral[900],
				},
				muted: {
					DEFAULT: colors.neutral[100],
					foreground: colors.neutral[500],
				},
				surface: {
					DEFAULT: colors.neutral[200],
					foreground: colors.neutral[900],
				},
				"surface-1": {
					DEFAULT: colors.neutral[300],
					foreground: colors.neutral[900],
				},
			},
			single: {
				foreground: colors.neutral[900],
				border: {
					DEFAULT: colors.neutral[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.neutral[50],
				},
				ring: `color-mix(in srgb, ${colors.teal[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.teal[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.rose[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.orange[400],
				foreground: colors.white,
			},
			success: {
				DEFAULT: colors.teal[500],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.neutral[900],
					foreground: colors.neutral[50],
				},
				muted: {
					DEFAULT: colors.neutral[800],
					foreground: colors.neutral[400],
				},
				surface: {
					DEFAULT: colors.neutral[700],
					foreground: colors.neutral[300],
				},
				"surface-1": {
					DEFAULT: colors.neutral[600],
					foreground: colors.neutral[200],
				},
			},
			single: {
				foreground: colors.neutral[50],
				border: {
					DEFAULT: colors.neutral[700],
				},
				input: {
					DEFAULT: colors.neutral[900],
					hover: colors.neutral[800],
				},
				ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
