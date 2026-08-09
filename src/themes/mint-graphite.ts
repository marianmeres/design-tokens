import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";
import { rgba } from "../color.ts";

// Mint graphite — a muted pine green primary with a soft butter accent. Light
// mode floats on mint-tinted paper; dark mode drops the tint entirely and sits
// on neutral graphite, with the green brightening to mint so it survives the
// charcoal. Both brand colors are authored verbatim: the bundled emerald is
// more saturated than this sea green, and the bundled amber is more orange
// than this butter.

const pine = "#2f7d5b";
const mint = "#4fb287"; // dark-mode primary — pine is too dark on graphite
const butter = "#fadf93";

// mint-tinted neutral ramp (light mode)
const paper = {
	50: "#eef5f0",
	100: "#e4eee8",
	200: "#d7e5dc",
	300: "#c6d9ce",
	500: "#6b7f74",
	900: "#17211c",
};

// neutral graphite ramp (dark mode)
const graphite = {
	50: "#f4f5f5",
	200: "#dcdedd",
	300: "#c0c4c2",
	400: "#9aa09d",
	600: "#4a4f4d",
	700: "#383c3b",
	800: "#262a29",
	900: "#17191a",
};

const light = {
	colors: {
		intent: {
			primary: {
				DEFAULT: pine,
				foreground: colors.white,
			},
			accent: {
				DEFAULT: butter,
				foreground: paper[900],
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
					DEFAULT: paper[50],
					foreground: paper[900],
				},
				muted: {
					DEFAULT: paper[100],
					foreground: paper[500],
				},
				surface: {
					DEFAULT: paper[200],
					foreground: paper[900],
				},
				"surface-1": {
					DEFAULT: paper[300],
					foreground: paper[900],
				},
			},
			single: {
				foreground: paper[900],
				border: {
					DEFAULT: paper[300],
				},
				input: {
					DEFAULT: colors.white,
					hover: paper[50],
				},
				ring: rgba(pine, 0.2),
			},
		},
	},
};

const dark = {
	colors: {
		intent: {
			primary: {
				DEFAULT: mint,
				foreground: graphite[900],
			},
			accent: {
				DEFAULT: butter,
				foreground: graphite[900],
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
					DEFAULT: graphite[900],
					foreground: graphite[50],
				},
				muted: {
					DEFAULT: graphite[800],
					foreground: graphite[400],
				},
				surface: {
					DEFAULT: graphite[700],
					foreground: graphite[300],
				},
				"surface-1": {
					DEFAULT: graphite[600],
					foreground: graphite[200],
				},
			},
			single: {
				foreground: graphite[50],
				border: {
					DEFAULT: graphite[700],
				},
				input: {
					DEFAULT: graphite[900],
					hover: graphite[800],
				},
				ring: rgba(mint, 0.25),
			},
		},
	},
};

const theme: ThemeSchema = { light, dark };

/** Pine green primary / butter accent on mint-tinted paper — neutral graphite dark mode. */
export default theme;
