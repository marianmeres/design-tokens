import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

// Custom color palette — hover/active states must be explicit (no auto-derivation)

const theme: ThemeSchema = {
	light: {
		colors: {
			intent: {
				primary: {
					DEFAULT: "#13BF89",
					foreground: "#2B2A28",
					hover: "#42CCA1",
					active: "#0F996E",
				},
				accent: {
					DEFAULT: "#F89B20",
					foreground: "#2B2A28",
					hover: "#C87F16",
					active: "#A56A12",
				},
				destructive: {
					DEFAULT: "#E60523",
					foreground: "#fff",
					hover: "#B8041C",
					active: "#930316",
				},
				warning: {
					DEFAULT: "#F37903",
					foreground: "#2B2A28",
					hover: "#FBB249",
					active: "#9E581B",
				},
				success: {
					DEFAULT: "#0DB064",
					foreground: "#fff",
					hover: "#00853E",
					active: "#006A32",
				},
			},
			role: {
				paired: {
					background: {
						DEFAULT: "#fff",
						foreground: "#2B2A28",
					},
					muted: {
						DEFAULT: "#E9E8E7",
						foreground: "#726F6B",
					},
					surface: {
						DEFAULT: "#DDDCDB",
						foreground: "#2B2A28",
						hover: "#B1AEAA",
						active: "#726F6B",
					},
					"surface-1": {
						DEFAULT: "#B1AEAA",
						foreground: "#2B2A28",
						hover: "#726F6B",
						active: "#5A5855",
					},
				},
				single: {
					foreground: "#2B2A28",
					border: {
						DEFAULT: "#B1AEAA",
					},
					input: {
						DEFAULT: "#fff",
						hover: "#F4F3F3",
					},
					ring: "color-mix(in srgb, #13BF89 20%, transparent)",
				},
			},
		},
	},
	dark: {
		colors: {
			intent: {
				primary: {
					DEFAULT: colors.zinc[200], // zinc-200 (neutral)
					foreground: colors.black,
				},
				accent: {
					DEFAULT: colors.amber[400], // amber-400
					foreground: colors.black,
				},
				destructive: {
					DEFAULT: colors.rose[500], // rose-500
					foreground: colors.white,
				},
				warning: {
					DEFAULT: colors.amber[400], // amber-400
					foreground: colors.black,
				},
				success: {
					DEFAULT: colors.teal[500], // teal-500
					foreground: colors.white,
				},
			},
			role: {
				paired: {
					background: {
						DEFAULT: colors.zinc[900], // zinc-900 (neutral)
						foreground: colors.neutral[50], // zinc-50
					},
					muted: {
						DEFAULT: colors.zinc[800], // zinc-800
						foreground: colors.zinc[400], // zinc-400
					},
					surface: {
						DEFAULT: colors.zinc[700], // zinc-700
						foreground: colors.zinc[300], // zinc-300
					},
					"surface-1": {
						DEFAULT: colors.zinc[600], // zinc-600
						foreground: colors.zinc[200], // zinc-200
					},
				},
				single: {
					foreground: colors.neutral[50], // zinc-50
					border: {
						DEFAULT: colors.zinc[700], // zinc-700
					},
					input: {
						DEFAULT: colors.zinc[900], // zinc-900
						hover: colors.zinc[800], // zinc-800
					},
					ring: `color-mix(in srgb, ${colors.zinc[400]} 25%, transparent)`, // zinc-400
				},
			},
		},
	},
};

export default theme;
