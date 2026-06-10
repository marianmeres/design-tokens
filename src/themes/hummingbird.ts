import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Hummingbird — watermelon's brand colors perched on peacock's surfaces.
// Anna's hummingbird wears exactly this: iridescent teal plumage with a
// brilliant magenta-pink gorget. Primary/accent are watermelon's favicon-exact
// hexes (deliberately off-palette); the role surfaces are peacock's, verbatim.

const pink = "#f6329b";
const mint = "#5deab5";

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: pink,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: mint,
				foreground: colors.emerald[950],
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
				ring: `color-mix(in srgb, ${pink} 20%, transparent)`,
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: pink,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: mint,
				foreground: colors.emerald[950],
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
				ring: `color-mix(in srgb, ${pink} 25%, transparent)`,
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Hot pink primary / mint accent on peacock-teal surfaces — Anna's hummingbird: magenta gorget, iridescent plumage. */
export default theme;
