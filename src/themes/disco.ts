import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Disco — gold lamé and pink lasers. Light mode is daytime at the venue:
// mirrorball silver (mauve neutrals) with gold-on-black buttons. Dark mode is
// 2am: a saturated violet dance floor under the same gold and pink lights.

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.yellow[400],
				foreground: colors.black,
			},
			accent: {
				DEFAULT: colors.pink[500],
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
				DEFAULT: colors.emerald[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.mauve[50],
					foreground: colors.mauve[900],
				},
				muted: {
					DEFAULT: colors.mauve[100],
					foreground: colors.mauve[500],
				},
				surface: {
					DEFAULT: colors.mauve[200],
					foreground: colors.mauve[900],
				},
				"surface-1": {
					DEFAULT: colors.mauve[300],
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
					hover: colors.mauve[50],
				},
				ring: `color-mix(in srgb, ${colors.yellow[400]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.yellow[400],
				foreground: colors.black,
			},
			accent: {
				DEFAULT: colors.pink[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[500],
				foreground: colors.white,
			},
			warning: {
				DEFAULT: colors.orange[400],
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
					DEFAULT: colors.violet[950],
					foreground: colors.violet[50],
				},
				muted: {
					DEFAULT: colors.violet[900],
					foreground: colors.violet[300],
				},
				surface: {
					DEFAULT: colors.violet[800],
					foreground: colors.violet[200],
				},
				"surface-1": {
					DEFAULT: colors.violet[700],
					foreground: colors.violet[100],
				},
			},
			single: {
				foreground: colors.violet[50],
				border: {
					DEFAULT: colors.violet[800],
				},
				input: {
					DEFAULT: colors.violet[950],
					hover: colors.violet[900],
				},
				ring: `color-mix(in srgb, ${colors.yellow[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Gold primary (black text) / pink accent — mirrorball mauve light, violet dance-floor dark. */
export default theme;
