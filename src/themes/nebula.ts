import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Nebula — a magenta gas cloud pierced by cyan starlight. Light mode floats
// on a lilac haze (violet surfaces), dark mode sinks into deep-space indigo.

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.fuchsia[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.cyan[400],
				foreground: colors.cyan[950],
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
					DEFAULT: colors.violet[50],
					foreground: colors.violet[950],
				},
				muted: {
					DEFAULT: colors.violet[100],
					foreground: colors.violet[600],
				},
				surface: {
					DEFAULT: colors.violet[200],
					foreground: colors.violet[950],
				},
				"surface-1": {
					DEFAULT: colors.violet[300],
					foreground: colors.violet[950],
				},
			},
			single: {
				foreground: colors.violet[950],
				border: {
					DEFAULT: colors.violet[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.violet[50],
				},
				ring: `color-mix(in srgb, ${colors.fuchsia[600]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.fuchsia[500],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.cyan[400],
				foreground: colors.cyan[950],
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
				foreground: colors.black,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.indigo[950],
					foreground: colors.indigo[50],
				},
				muted: {
					DEFAULT: colors.indigo[900],
					foreground: colors.indigo[300],
				},
				surface: {
					DEFAULT: colors.indigo[800],
					foreground: colors.indigo[200],
				},
				"surface-1": {
					DEFAULT: colors.indigo[700],
					foreground: colors.indigo[100],
				},
			},
			single: {
				foreground: colors.indigo[50],
				border: {
					DEFAULT: colors.indigo[800],
				},
				input: {
					DEFAULT: colors.indigo[950],
					hover: colors.indigo[900],
				},
				ring: `color-mix(in srgb, ${colors.fuchsia[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Fuchsia primary / cyan accent — lilac haze light surfaces, deep-space indigo dark. */
export default theme;
