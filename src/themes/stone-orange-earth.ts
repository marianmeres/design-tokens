import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.stone[700],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.orange[600],
				foreground: colors.white,
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
				DEFAULT: colors.green[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.stone[100],
					foreground: colors.stone[900],
				},
				muted: {
					DEFAULT: colors.stone[200],
					foreground: colors.stone[500],
				},
				surface: {
					DEFAULT: colors.stone[300],
					foreground: colors.stone[900],
				},
				"surface-1": {
					DEFAULT: colors.stone[400],
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
				ring: `color-mix(in srgb, ${colors.stone[700]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.stone[400],
				foreground: colors.stone[950],
			},
			accent: {
				DEFAULT: colors.orange[500],
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
				DEFAULT: colors.green[500],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.stone[950],
					foreground: colors.stone[100],
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
				foreground: colors.stone[100],
				border: {
					DEFAULT: colors.stone[700],
				},
				input: {
					DEFAULT: colors.stone[950],
					hover: colors.stone[900],
				},
				ring: `color-mix(in srgb, ${colors.stone[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

export default theme;
