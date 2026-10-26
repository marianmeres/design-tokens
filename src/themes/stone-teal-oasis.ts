import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: colors.stone[700],
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
					DEFAULT: colors.stone[50],
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
				ring: rgba(colors.teal[500], 0.2),
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
				DEFAULT: colors.teal[600],
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
				foreground: colors.black,
			},
		},
		role: {
			paired: {
				background: {
					DEFAULT: colors.stone[950],
					foreground: colors.stone[50],
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
				foreground: colors.stone[50],
				border: {
					DEFAULT: colors.stone[700],
				},
				input: {
					DEFAULT: colors.stone[950],
					hover: colors.stone[900],
				},
				ring: rgba(colors.teal[400], 0.25),
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Stone primary / teal accent oasis theme — slate-teal-ocean's warm-gray sibling. */
export default theme;
