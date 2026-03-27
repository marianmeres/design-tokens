import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.mauve[700],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.teal[500],
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
				DEFAULT: colors.teal[600],
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
				ring: `color-mix(in srgb, ${colors.mauve[700]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.mauve[400],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.teal[400],
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
				DEFAULT: colors.teal[500],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.mauve[900],
					foreground: colors.mauve[50],
				},
				muted: {
					DEFAULT: colors.mauve[800],
					foreground: colors.mauve[400],
				},
				surface: {
					DEFAULT: colors.mauve[700],
					foreground: colors.mauve[300],
				},
				"surface-1": {
					DEFAULT: colors.mauve[600],
					foreground: colors.mauve[200],
				},
			},
			single: {
				foreground: colors.mauve[50],
				border: {
					DEFAULT: colors.mauve[700],
				},
				input: {
					DEFAULT: colors.mauve[900],
					hover: colors.mauve[800],
				},
				ring: `color-mix(in srgb, ${colors.mauve[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Mauve primary / teal accent theme — soft purple greys with oceanic highlights. */
export default theme;
