import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.taupe[800], foreground: colors.white },
				accent: { DEFAULT: colors.taupe[500], foreground: colors.white },
				destructive: { DEFAULT: colors.taupe[500], foreground: colors.white },
				warning: { DEFAULT: colors.taupe[400], foreground: colors.black },
				success: { DEFAULT: colors.taupe[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.taupe[50],
						foreground: colors.taupe[900],
					},
					muted: { DEFAULT: colors.taupe[100], foreground: colors.taupe[500] },
					surface: {
						DEFAULT: colors.taupe[200],
						foreground: colors.taupe[900],
					},
					"surface-1": {
						DEFAULT: colors.taupe[300],
						foreground: colors.taupe[900],
					},
				},
				single: {
					foreground: colors.taupe[900],
					border: { DEFAULT: colors.taupe[300] },
					input: { DEFAULT: colors.taupe[50], hover: colors.taupe[100] },
					ring: `color-mix(in srgb, ${colors.taupe[800]} 20%, transparent)`,
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.taupe[200], foreground: colors.black },
				accent: { DEFAULT: colors.taupe[500], foreground: colors.white },
				destructive: { DEFAULT: colors.taupe[500], foreground: colors.white },
				warning: { DEFAULT: colors.taupe[400], foreground: colors.black },
				success: { DEFAULT: colors.taupe[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.taupe[900],
						foreground: colors.taupe[50],
					},
					muted: { DEFAULT: colors.taupe[800], foreground: colors.taupe[400] },
					surface: {
						DEFAULT: colors.taupe[700],
						foreground: colors.taupe[300],
					},
					"surface-1": {
						DEFAULT: colors.taupe[600],
						foreground: colors.taupe[200],
					},
				},
				single: {
					foreground: colors.taupe[50],
					border: { DEFAULT: colors.taupe[700] },
					input: { DEFAULT: colors.taupe[900], hover: colors.taupe[800] },
					ring: `color-mix(in srgb, ${colors.taupe[200]} 25%, transparent)`,
				},
			},
		},
	},
};

/** Warm neutral taupe monochrome theme. */
export default theme;
