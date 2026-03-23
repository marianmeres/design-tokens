import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.slate[700],
				foreground: colors.white,
			},
			accent: {
				DEFAULT: colors.teal[500],
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
				DEFAULT: colors.teal[600],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.slate[50],
					foreground: colors.slate[900],
				},
				muted: {
					DEFAULT: colors.slate[100],
					foreground: colors.slate[500],
				},
				surface: {
					DEFAULT: colors.slate[200],
					foreground: colors.slate[900],
				},
				"surface-1": {
					DEFAULT: colors.slate[300],
					foreground: colors.slate[900],
				},
			},
			single: {
				foreground: colors.slate[900],
				border: {
					DEFAULT: colors.slate[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: colors.slate[50],
				},
				ring: `color-mix(in srgb, ${colors.teal[500]} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.slate[400],
				foreground: colors.slate[950],
			},
			accent: {
				DEFAULT: colors.teal[400],
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
				DEFAULT: colors.teal[500],
				foreground: colors.white,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.slate[950],
					foreground: colors.slate[50],
				},
				muted: {
					DEFAULT: colors.slate[900],
					foreground: colors.slate[500],
				},
				surface: {
					DEFAULT: colors.slate[800],
					foreground: colors.slate[400],
				},
				"surface-1": {
					DEFAULT: colors.slate[700],
					foreground: colors.slate[300],
				},
			},
			single: {
				foreground: colors.slate[50],
				border: {
					DEFAULT: colors.slate[700],
				},
				input: {
					DEFAULT: colors.slate[950],
					hover: colors.slate[900],
				},
				ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Slate primary / teal accent ocean theme. */
export default theme;
