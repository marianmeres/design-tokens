import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.gray[800], foreground: colors.white }, // gray-800, white
				accent: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
				destructive: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
				warning: { DEFAULT: colors.gray[400], foreground: colors.black }, // gray-400, black
				success: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.gray[50],
						foreground: colors.gray[900],
					}, // gray-50, gray-900
					muted: { DEFAULT: colors.gray[100], foreground: colors.gray[500] }, // gray-100, gray-500
					surface: { DEFAULT: colors.gray[200], foreground: colors.gray[900] }, // gray-200, gray-900
					"surface-1": {
						DEFAULT: colors.gray[300],
						foreground: colors.gray[900],
					}, // gray-300, gray-900
				},
				single: {
					foreground: colors.gray[900], // gray-900
					border: { DEFAULT: colors.gray[300] }, // gray-300
					input: { DEFAULT: colors.gray[50], hover: colors.gray[100] }, // gray-50, gray-100
					ring: `color-mix(in srgb, ${colors.gray[800]} 20%, transparent)`, // gray-800
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.gray[200], foreground: colors.black }, // gray-200, black
				accent: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
				destructive: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
				warning: { DEFAULT: colors.gray[400], foreground: colors.black }, // gray-400, black
				success: { DEFAULT: colors.gray[500], foreground: colors.white }, // gray-500, white
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.gray[900],
						foreground: colors.gray[50],
					}, // gray-900, gray-50
					muted: { DEFAULT: colors.gray[800], foreground: colors.gray[400] }, // gray-800, gray-400
					surface: { DEFAULT: colors.gray[700], foreground: colors.gray[300] }, // gray-700, gray-300
					"surface-1": {
						DEFAULT: colors.gray[600],
						foreground: colors.gray[200],
					}, // gray-600, gray-200
				},
				single: {
					foreground: colors.gray[50], // gray-50
					border: { DEFAULT: colors.gray[700] }, // gray-700
					input: { DEFAULT: colors.gray[900], hover: colors.gray[800] }, // gray-900, gray-800
					ring: `color-mix(in srgb, ${colors.gray[200]} 25%, transparent)`, // gray-200
				},
			},
		},
	},
};

export default theme;
