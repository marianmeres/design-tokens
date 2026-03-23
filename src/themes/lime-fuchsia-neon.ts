import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.lime[600],
				foreground: colors.black,
			},
			accent: {
				DEFAULT: colors.fuchsia[500],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.red[600],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.yellow[500],
				foreground: colors.black,
			},
			success: {
				DEFAULT: colors.lime[600],
				foreground: colors.black,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.zinc[100],
					foreground: colors.zinc[900],
				},
				muted: {
					DEFAULT: colors.zinc[200],
					foreground: colors.zinc[500],
				},
				surface: {
					DEFAULT: colors.zinc[300],
					foreground: colors.zinc[900],
				},
				"surface-1": {
					DEFAULT: colors.zinc[400],
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
					hover: colors.zinc[100],
				},
				ring: `color-mix(in srgb, ${colors.lime[500]} 25%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.lime[400],
				foreground: colors.black,
			},
			accent: {
				DEFAULT: colors.fuchsia[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.red[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.yellow[400],
				foreground: colors.black,
			},
			success: {
				DEFAULT: colors.lime[400],
				foreground: colors.black,
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
				ring: `color-mix(in srgb, ${colors.lime[400]} 30%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Lime primary / fuchsia accent neon theme. */
export default theme;
