import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.mist[800], foreground: colors.white },
				accent: { DEFAULT: colors.mist[500], foreground: colors.white },
				destructive: { DEFAULT: colors.mist[500], foreground: colors.white },
				warning: { DEFAULT: colors.mist[400], foreground: colors.black },
				success: { DEFAULT: colors.mist[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.mist[50],
						foreground: colors.mist[900],
					},
					muted: { DEFAULT: colors.mist[100], foreground: colors.mist[500] },
					surface: {
						DEFAULT: colors.mist[200],
						foreground: colors.mist[900],
					},
					"surface-1": {
						DEFAULT: colors.mist[300],
						foreground: colors.mist[900],
					},
				},
				single: {
					foreground: colors.mist[900],
					border: { DEFAULT: colors.mist[300] },
					input: { DEFAULT: colors.mist[50], hover: colors.mist[100] },
					ring: `color-mix(in srgb, ${colors.mist[800]} 20%, transparent)`,
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.mist[200], foreground: colors.black },
				accent: { DEFAULT: colors.mist[500], foreground: colors.white },
				destructive: { DEFAULT: colors.mist[500], foreground: colors.white },
				warning: { DEFAULT: colors.mist[400], foreground: colors.black },
				success: { DEFAULT: colors.mist[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.mist[900],
						foreground: colors.mist[50],
					},
					muted: { DEFAULT: colors.mist[800], foreground: colors.mist[400] },
					surface: {
						DEFAULT: colors.mist[700],
						foreground: colors.mist[300],
					},
					"surface-1": {
						DEFAULT: colors.mist[600],
						foreground: colors.mist[200],
					},
				},
				single: {
					foreground: colors.mist[50],
					border: { DEFAULT: colors.mist[700] },
					input: { DEFAULT: colors.mist[900], hover: colors.mist[800] },
					ring: `color-mix(in srgb, ${colors.mist[200]} 25%, transparent)`,
				},
			},
		},
	},
};

/** Cool blue-grey mist monochrome theme. */
export default theme;
