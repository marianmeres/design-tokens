import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.stone[800], foreground: colors.white }, // stone-800, white
				accent: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
				destructive: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
				warning: { DEFAULT: colors.stone[400], foreground: colors.black }, // stone-400, black
				success: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.stone[50],
						foreground: colors.stone[900],
					}, // stone-50, stone-900
					muted: { DEFAULT: colors.stone[100], foreground: colors.stone[500] }, // stone-100, stone-500
					surface: {
						DEFAULT: colors.stone[200],
						foreground: colors.stone[900],
					}, // stone-200, stone-900
					"surface-1": {
						DEFAULT: colors.stone[300],
						foreground: colors.stone[900],
					}, // stone-300, stone-900
				},
				single: {
					foreground: colors.stone[900], // stone-900
					border: { DEFAULT: colors.stone[300] }, // stone-300
					input: { DEFAULT: colors.stone[50], hover: colors.stone[100] }, // stone-50, stone-100
					ring: `color-mix(in srgb, ${colors.stone[800]} 20%, transparent)`, // stone-800
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.stone[200], foreground: colors.black }, // stone-200, black
				accent: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
				destructive: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
				warning: { DEFAULT: colors.stone[400], foreground: colors.black }, // stone-400, black
				success: { DEFAULT: colors.stone[500], foreground: colors.white }, // stone-500, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.stone[900],
						foreground: colors.stone[50],
					}, // stone-900, stone-50
					muted: { DEFAULT: colors.stone[800], foreground: colors.stone[400] }, // stone-800, stone-400
					surface: {
						DEFAULT: colors.stone[700],
						foreground: colors.stone[300],
					}, // stone-700, stone-300
					"surface-1": {
						DEFAULT: colors.stone[600],
						foreground: colors.stone[200],
					}, // stone-600, stone-200
				},
				single: {
					foreground: colors.stone[50], // stone-50
					border: { DEFAULT: colors.stone[700] }, // stone-700
					input: { DEFAULT: colors.stone[900], hover: colors.stone[800] }, // stone-900, stone-800
					ring: `color-mix(in srgb, ${colors.stone[200]} 25%, transparent)`, // stone-200
				},
			},
		},
	},
};

/** Neutral stone monochrome theme. */
export default theme;
