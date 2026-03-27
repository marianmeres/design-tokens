import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.mauve[800], foreground: colors.white },
				accent: { DEFAULT: colors.mauve[500], foreground: colors.white },
				destructive: { DEFAULT: colors.mauve[500], foreground: colors.white },
				warning: { DEFAULT: colors.mauve[400], foreground: colors.black },
				success: { DEFAULT: colors.mauve[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.mauve[50],
						foreground: colors.mauve[900],
					},
					muted: { DEFAULT: colors.mauve[100], foreground: colors.mauve[500] },
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
					border: { DEFAULT: colors.mauve[300] },
					input: { DEFAULT: colors.mauve[50], hover: colors.mauve[100] },
					ring: `color-mix(in srgb, ${colors.mauve[800]} 20%, transparent)`,
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.mauve[200], foreground: colors.black },
				accent: { DEFAULT: colors.mauve[500], foreground: colors.white },
				destructive: { DEFAULT: colors.mauve[500], foreground: colors.white },
				warning: { DEFAULT: colors.mauve[400], foreground: colors.black },
				success: { DEFAULT: colors.mauve[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.mauve[900],
						foreground: colors.mauve[50],
					},
					muted: { DEFAULT: colors.mauve[800], foreground: colors.mauve[400] },
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
					border: { DEFAULT: colors.mauve[700] },
					input: { DEFAULT: colors.mauve[900], hover: colors.mauve[800] },
					ring: `color-mix(in srgb, ${colors.mauve[200]} 25%, transparent)`,
				},
			},
		},
	},
};

/** Cool purple-grey mauve monochrome theme. */
export default theme;
