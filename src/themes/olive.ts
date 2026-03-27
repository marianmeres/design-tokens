import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.olive[800], foreground: colors.white },
				accent: { DEFAULT: colors.olive[500], foreground: colors.white },
				destructive: { DEFAULT: colors.olive[500], foreground: colors.white },
				warning: { DEFAULT: colors.olive[400], foreground: colors.black },
				success: { DEFAULT: colors.olive[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.olive[50],
						foreground: colors.olive[900],
					},
					muted: { DEFAULT: colors.olive[100], foreground: colors.olive[500] },
					surface: {
						DEFAULT: colors.olive[200],
						foreground: colors.olive[900],
					},
					"surface-1": {
						DEFAULT: colors.olive[300],
						foreground: colors.olive[900],
					},
				},
				single: {
					foreground: colors.olive[900],
					border: { DEFAULT: colors.olive[300] },
					input: { DEFAULT: colors.olive[50], hover: colors.olive[100] },
					ring: `color-mix(in srgb, ${colors.olive[800]} 20%, transparent)`,
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: { DEFAULT: colors.olive[200], foreground: colors.black },
				accent: { DEFAULT: colors.olive[500], foreground: colors.white },
				destructive: { DEFAULT: colors.olive[500], foreground: colors.white },
				warning: { DEFAULT: colors.olive[400], foreground: colors.black },
				success: { DEFAULT: colors.olive[500], foreground: colors.white },
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.olive[900],
						foreground: colors.olive[50],
					},
					muted: { DEFAULT: colors.olive[800], foreground: colors.olive[400] },
					surface: {
						DEFAULT: colors.olive[700],
						foreground: colors.olive[300],
					},
					"surface-1": {
						DEFAULT: colors.olive[600],
						foreground: colors.olive[200],
					},
				},
				single: {
					foreground: colors.olive[50],
					border: { DEFAULT: colors.olive[700] },
					input: { DEFAULT: colors.olive[900], hover: colors.olive[800] },
					ring: `color-mix(in srgb, ${colors.olive[200]} 25%, transparent)`,
				},
			},
		},
	},
};

/** Warm yellow-grey olive monochrome theme. */
export default theme;
