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
					DEFAULT: colors.mauve[100],
					foreground: colors.mauve[900],
				},
				muted: {
					DEFAULT: colors.mauve[200],
					foreground: colors.mauve[500],
				},
				surface: {
					DEFAULT: colors.mauve[300],
					foreground: colors.mauve[900],
				},
				"surface-1": {
					DEFAULT: colors.mauve[400],
					foreground: colors.mauve[900],
				},
			},
			single: {
				foreground: colors.mauve[900],
				border: {
					DEFAULT: colors.mauve[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.mauve[100],
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
					DEFAULT: colors.mauve[950],
					foreground: colors.mauve[50],
				},
				muted: {
					DEFAULT: colors.mauve[900],
					foreground: colors.mauve[500],
				},
				surface: {
					DEFAULT: colors.mauve[800],
					foreground: colors.mauve[400],
				},
				"surface-1": {
					DEFAULT: colors.mauve[700],
					foreground: colors.mauve[300],
				},
			},
			single: {
				foreground: colors.mauve[50],
				border: {
					DEFAULT: colors.mauve[700],
				},
				input: {
					DEFAULT: colors.mauve[950],
					hover: colors.mauve[900],
				},
				ring: `color-mix(in srgb, ${colors.lime[400]} 30%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Lime primary / fuchsia accent on mauve base — electric contrast on muted purple. */
export default theme;
