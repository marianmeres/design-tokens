import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.zinc[800], foreground: colors.white }, // zinc-800, white
				accent: { DEFAULT: colors.zinc[500], foreground: colors.white }, // zinc-500, white
				destructive: { DEFAULT: colors.rose[600], foreground: colors.white }, // rose-600, white
				warning: { DEFAULT: colors.amber[500], foreground: colors.black }, // amber-500, black
				success: { DEFAULT: colors.emerald[600], foreground: colors.white }, // emerald-600, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.zinc[50],
						foreground: colors.zinc[900],
					}, // zinc-50, zinc-900
					muted: { DEFAULT: colors.zinc[100], foreground: colors.zinc[500] }, // zinc-100, zinc-500
					surface: { DEFAULT: colors.zinc[200], foreground: colors.zinc[900] }, // zinc-200, zinc-900
					"surface-1": {
						DEFAULT: colors.zinc[300],
						foreground: colors.zinc[900],
					}, // zinc-300, zinc-900
				},
				single: {
					foreground: colors.zinc[900], // zinc-900
					border: { DEFAULT: colors.zinc[300] }, // zinc-300
					input: { DEFAULT: colors.zinc[50], hover: colors.zinc[100] }, // zinc-50, zinc-100
					ring: `color-mix(in srgb, ${colors.zinc[800]} 20%, transparent)`, // zinc-800
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.zinc[200], foreground: colors.black }, // zinc-200, black
				accent: { DEFAULT: colors.zinc[500], foreground: colors.white }, // zinc-500, white
				destructive: { DEFAULT: colors.rose[500], foreground: colors.white }, // rose-500, white
				warning: { DEFAULT: colors.amber[400], foreground: colors.black }, // amber-400, black
				success: { DEFAULT: colors.emerald[500], foreground: colors.white }, // emerald-500, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.zinc[900],
						foreground: colors.zinc[50],
					}, // zinc-900, zinc-50
					muted: { DEFAULT: colors.zinc[800], foreground: colors.zinc[400] }, // zinc-800, zinc-400
					surface: { DEFAULT: colors.zinc[700], foreground: colors.zinc[300] }, // zinc-700, zinc-300
					"surface-1": {
						DEFAULT: colors.zinc[600],
						foreground: colors.zinc[200],
					}, // zinc-600, zinc-200
				},
				single: {
					foreground: colors.zinc[50], // zinc-50
					border: { DEFAULT: colors.zinc[700] }, // zinc-700
					input: { DEFAULT: colors.zinc[900], hover: colors.zinc[800] }, // zinc-900, zinc-800
					ring: `color-mix(in srgb, ${colors.zinc[200]} 25%, transparent)`, // zinc-200
				},
			},
		},
	},
};

export default theme;
