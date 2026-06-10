import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Peacock — iridescent teal plumage with a fuchsia eye-spot. Surfaces commit
// fully to the teal family: jewel-pastel feathers in light mode, deep
// blue-green plumage at night in dark mode.

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.teal[600],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.fuchsia[500],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[600],
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
					DEFAULT: colors.teal[50],
					foreground: colors.teal[950],
				},
				muted: {
					DEFAULT: colors.teal[100],
					foreground: colors.teal[700],
				},
				surface: {
					DEFAULT: colors.teal[200],
					foreground: colors.teal[950],
				},
				"surface-1": {
					DEFAULT: colors.teal[300],
					foreground: colors.teal[950],
				},
			},
			single: {
				foreground: colors.teal[950],
				border: {
					DEFAULT: colors.teal[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.teal[50],
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
				DEFAULT: colors.fuchsia[400],
				foreground: colors.white,
			},
			destructive: {
				DEFAULT: colors.rose[500],
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
					DEFAULT: colors.teal[950],
					foreground: colors.teal[50],
				},
				muted: {
					DEFAULT: colors.teal[900],
					foreground: colors.teal[400],
				},
				surface: {
					DEFAULT: colors.teal[800],
					foreground: colors.teal[200],
				},
				"surface-1": {
					DEFAULT: colors.teal[700],
					foreground: colors.teal[100],
				},
			},
			single: {
				foreground: colors.teal[50],
				border: {
					DEFAULT: colors.teal[800],
				},
				input: {
					DEFAULT: colors.teal[950],
					hover: colors.teal[900],
				},
				ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Teal primary / fuchsia accent on all-teal surfaces — iridescent peacock plumage, light and night. */
export default theme;
