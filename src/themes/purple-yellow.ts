import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.purple[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.yellow[400],
				foreground: colors.black,
			},
			destructive: {
				DEFAULT: colors.rose[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.yellow[400],
				foreground: colors.black,
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
					foreground: colors.stone[900],
				},
				muted: {
					DEFAULT: colors.stone[100],
					foreground: colors.stone[500],
				},
				surface: {
					DEFAULT: colors.stone[200],
					foreground: colors.stone[900],
				},
				"surface-1": {
					DEFAULT: colors.stone[300],
					foreground: colors.stone[900],
				},
			},
			single: {
				foreground: colors.stone[900],
				border: {
					DEFAULT: colors.stone[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.stone[50],
				},
				ring: `color-mix(in srgb, ${colors.purple[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.purple[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.yellow[300],
				foreground: colors.black,
			},
			destructive: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.yellow[300],
				foreground: colors.black,
			},
			success: {
				DEFAULT: colors.teal[500],
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
					DEFAULT: colors.stone[700],
				},
				input: {
					DEFAULT: colors.stone[900],
					hover: colors.stone[800],
				},
				ring: `color-mix(in srgb, ${colors.purple[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Purple primary / yellow accent theme. */
export default theme;
