const colors = {
    black: "#000000",
    white: "#ffffff",
    slate: {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
        950: "#020617"
    },
    gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712"
    },
    zinc: {
        50: "#fafafa",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        950: "#09090b"
    },
    neutral: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
        950: "#0a0a0a"
    },
    stone: {
        50: "#fafaf9",
        100: "#f5f5f4",
        200: "#e7e5e4",
        300: "#d6d3d1",
        400: "#a8a29e",
        500: "#78716c",
        600: "#57534e",
        700: "#44403c",
        800: "#292524",
        900: "#1c1917",
        950: "#0c0a09"
    },
    red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        950: "#450a0a"
    },
    orange: {
        50: "#fff7ed",
        100: "#ffedd5",
        200: "#fed7aa",
        300: "#fdba74",
        400: "#fb923c",
        500: "#f97316",
        600: "#ea580c",
        700: "#c2410c",
        800: "#9a3412",
        900: "#7c2d12",
        950: "#431407"
    },
    amber: {
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
        950: "#451a03"
    },
    yellow: {
        50: "#fefce8",
        100: "#fef9c3",
        200: "#fef08a",
        300: "#fde047",
        400: "#facc15",
        500: "#eab308",
        600: "#ca8a04",
        700: "#a16207",
        800: "#854d0e",
        900: "#713f12",
        950: "#422006"
    },
    lime: {
        50: "#f7fee7",
        100: "#ecfccb",
        200: "#d9f99d",
        300: "#bef264",
        400: "#a3e635",
        500: "#84cc16",
        600: "#65a30d",
        700: "#4d7c0f",
        800: "#3f6212",
        900: "#365314",
        950: "#1a2e05"
    },
    green: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        950: "#052e16"
    },
    emerald: {
        50: "#ecfdf5",
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#10b981",
        600: "#059669",
        700: "#047857",
        800: "#065f46",
        900: "#064e3b",
        950: "#022c22"
    },
    teal: {
        50: "#f0fdfa",
        100: "#ccfbf1",
        200: "#99f6e4",
        300: "#5eead4",
        400: "#2dd4bf",
        500: "#14b8a6",
        600: "#0d9488",
        700: "#0f766e",
        800: "#115e59",
        900: "#134e4a",
        950: "#042f2e"
    },
    cyan: {
        50: "#ecfeff",
        100: "#cffafe",
        200: "#a5f3fc",
        300: "#67e8f9",
        400: "#22d3ee",
        500: "#06b6d4",
        600: "#0891b2",
        700: "#0e7490",
        800: "#155e75",
        900: "#164e63",
        950: "#083344"
    },
    sky: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e",
        950: "#082f49"
    },
    blue: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
        950: "#172554"
    },
    indigo: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        950: "#1e1b4b"
    },
    violet: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95",
        950: "#2e1065"
    },
    purple: {
        50: "#faf5ff",
        100: "#f3e8ff",
        200: "#e9d5ff",
        300: "#d8b4fe",
        400: "#c084fc",
        500: "#a855f7",
        600: "#9333ea",
        700: "#7e22ce",
        800: "#6b21a8",
        900: "#581c87",
        950: "#3b0764"
    },
    fuchsia: {
        50: "#fdf4ff",
        100: "#fae8ff",
        200: "#f5d0fe",
        300: "#f0abfc",
        400: "#e879f9",
        500: "#d946ef",
        600: "#c026d3",
        700: "#a21caf",
        800: "#86198f",
        900: "#701a75",
        950: "#4a044e"
    },
    pink: {
        50: "#fdf2f8",
        100: "#fce7f3",
        200: "#fbcfe8",
        300: "#f9a8d4",
        400: "#f472b6",
        500: "#ec4899",
        600: "#db2777",
        700: "#be185d",
        800: "#9d174d",
        900: "#831843",
        950: "#500724"
    },
    rose: {
        50: "#fff1f2",
        100: "#ffe4e6",
        200: "#fecdd3",
        300: "#fda4af",
        400: "#fb7185",
        500: "#f43f5e",
        600: "#e11d48",
        700: "#be123c",
        800: "#9f1239",
        900: "#881337",
        950: "#4c0519"
    }
};
const light = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.blue[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.blue[600]} 20%, transparent)`
            }
        }
    }
};
const dark = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.blue[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.blue[400]} 25%, transparent)`
            }
        }
    }
};
const theme = {
    light,
    dark
};
const light1 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.cyan[600]} 20%, transparent)`
            }
        }
    }
};
const dark1 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.red[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.cyan[400]} 25%, transparent)`
            }
        }
    }
};
const theme1 = {
    light: light1,
    dark: dark1
};
const light2 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.slate[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.cyan[600]} 20%, transparent)`
            }
        }
    }
};
const dark2 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.slate[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.cyan[400]} 25%, transparent)`
            }
        }
    }
};
const theme2 = {
    light: light2,
    dark: dark2
};
const light3 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.emerald[700],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[600],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.amber[50],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.amber[100],
                    foreground: colors.amber[500]
                },
                surface: {
                    DEFAULT: colors.amber[200],
                    foreground: colors.amber[900]
                },
                "surface-1": {
                    DEFAULT: colors.amber[300],
                    foreground: colors.amber[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.amber[50],
                    hover: colors.stone[100]
                },
                ring: `color-mix(in srgb, ${colors.emerald[700]} 20%, transparent)`
            }
        }
    }
};
const dark3 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[500],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[600]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.emerald[500]} 25%, transparent)`
            }
        }
    }
};
const theme3 = {
    light: light3,
    dark: dark3
};
const light4 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.emerald[600]} 20%, transparent)`
            }
        }
    }
};
const dark4 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.pink[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.emerald[400]} 25%, transparent)`
            }
        }
    }
};
const theme4 = {
    light: light4,
    dark: dark4
};
const light5 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.fuchsia[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.fuchsia[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.fuchsia[600]} 20%, transparent)`
            }
        }
    }
};
const dark5 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.fuchsia[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.emerald[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.fuchsia[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.fuchsia[400]} 25%, transparent)`
            }
        }
    }
};
const theme5 = {
    light: light5,
    dark: dark5
};
const theme6 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.gray[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.gray[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.gray[50],
                        foreground: colors.gray[900]
                    },
                    muted: {
                        DEFAULT: colors.gray[100],
                        foreground: colors.gray[500]
                    },
                    surface: {
                        DEFAULT: colors.gray[200],
                        foreground: colors.gray[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.gray[300],
                        foreground: colors.gray[900]
                    }
                },
                single: {
                    foreground: colors.gray[900],
                    border: {
                        DEFAULT: colors.gray[300]
                    },
                    input: {
                        DEFAULT: colors.gray[50],
                        hover: colors.gray[100]
                    },
                    ring: `color-mix(in srgb, ${colors.gray[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.gray[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.gray[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.gray[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.gray[900],
                        foreground: colors.gray[50]
                    },
                    muted: {
                        DEFAULT: colors.gray[800],
                        foreground: colors.gray[400]
                    },
                    surface: {
                        DEFAULT: colors.gray[700],
                        foreground: colors.gray[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.gray[600],
                        foreground: colors.gray[200]
                    }
                },
                single: {
                    foreground: colors.gray[50],
                    border: {
                        DEFAULT: colors.gray[700]
                    },
                    input: {
                        DEFAULT: colors.gray[900],
                        hover: colors.gray[800]
                    },
                    ring: `color-mix(in srgb, ${colors.gray[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light6 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.indigo[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.indigo[600]} 20%, transparent)`
            }
        }
    }
};
const dark6 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.indigo[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.indigo[400]} 25%, transparent)`
            }
        }
    }
};
const theme7 = {
    light: light6,
    dark: dark6
};
const light7 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.lime[600],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.fuchsia[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.yellow[500],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.lime[600],
                foreground: colors.black
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.zinc[100],
                    foreground: colors.zinc[900]
                },
                muted: {
                    DEFAULT: colors.zinc[200],
                    foreground: colors.zinc[500]
                },
                surface: {
                    DEFAULT: colors.zinc[300],
                    foreground: colors.zinc[900]
                },
                "surface-1": {
                    DEFAULT: colors.zinc[400],
                    foreground: colors.zinc[900]
                }
            },
            single: {
                foreground: colors.zinc[900],
                border: {
                    DEFAULT: colors.zinc[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.zinc[100]
                },
                ring: `color-mix(in srgb, ${colors.lime[500]} 25%, transparent)`
            }
        }
    }
};
const dark7 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.fuchsia[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.yellow[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.zinc[950],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.zinc[900],
                    foreground: colors.zinc[500]
                },
                surface: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.zinc[400]
                },
                "surface-1": {
                    DEFAULT: colors.zinc[700],
                    foreground: colors.zinc[300]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.zinc[700]
                },
                input: {
                    DEFAULT: colors.zinc[950],
                    hover: colors.zinc[900]
                },
                ring: `color-mix(in srgb, ${colors.lime[400]} 30%, transparent)`
            }
        }
    }
};
const theme8 = {
    light: light7,
    dark: dark7
};
const light8 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.violet[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[50],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.stone[50],
                    hover: colors.stone[100]
                },
                ring: `color-mix(in srgb, ${colors.cyan[600]} 20%, transparent)`
            }
        }
    }
};
const dark8 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.cyan[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.violet[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.cyan[400]} 25%, transparent)`
            }
        }
    }
};
const theme9 = {
    light: light8,
    dark: dark8
};
const light9 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.lime[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[50],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.stone[50],
                    hover: colors.stone[100]
                },
                ring: `color-mix(in srgb, ${colors.lime[600]} 20%, transparent)`
            }
        }
    }
};
const dark9 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.orange[400],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.lime[400]} 25%, transparent)`
            }
        }
    }
};
const theme10 = {
    light: light9,
    dark: dark9
};
const light10 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.violet[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[50],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.stone[50],
                    hover: colors.stone[100]
                },
                ring: `color-mix(in srgb, ${colors.rose[500]} 20%, transparent)`
            }
        }
    }
};
const dark10 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.violet[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.rose[500]} 25%, transparent)`
            }
        }
    }
};
const theme11 = {
    light: light10,
    dark: dark10
};
const light11 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.orange[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.orange[50],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.amber[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.amber[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.amber[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.amber[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.orange[50]
                },
                ring: `color-mix(in srgb, ${colors.orange[600]} 20%, transparent)`
            }
        }
    }
};
const dark11 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.orange[500],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.pink[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[950],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                "surface-1": {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[950],
                    hover: colors.stone[900]
                },
                ring: `color-mix(in srgb, ${colors.orange[500]} 25%, transparent)`
            }
        }
    }
};
const theme12 = {
    light: light11,
    dark: dark11
};
const light12 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.pink[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.pink[600]} 20%, transparent)`
            }
        }
    }
};
const dark12 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.emerald[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.pink[400]} 25%, transparent)`
            }
        }
    }
};
const theme13 = {
    light: light12,
    dark: dark12
};
const light13 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.pink[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.pink[600]} 20%, transparent)`
            }
        }
    }
};
const dark13 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.teal[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.pink[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.pink[400]} 25%, transparent)`
            }
        }
    }
};
const theme14 = {
    light: light13,
    dark: dark13
};
const light14 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.purple[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.yellow[400],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.yellow[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.purple[600]} 20%, transparent)`
            }
        }
    }
};
const dark14 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.purple[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.yellow[300],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.yellow[300],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.purple[400]} 25%, transparent)`
            }
        }
    }
};
const theme15 = {
    light: light14,
    dark: dark14
};
const light15 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.blue[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.violet[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.green[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.slate[900]
                },
                muted: {
                    DEFAULT: colors.slate[100],
                    foreground: colors.slate[500]
                },
                surface: {
                    DEFAULT: colors.slate[200],
                    foreground: colors.slate[900]
                },
                "surface-1": {
                    DEFAULT: colors.slate[300],
                    foreground: colors.slate[900]
                }
            },
            single: {
                foreground: colors.slate[900],
                border: {
                    DEFAULT: colors.slate[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.slate[50]
                },
                ring: `color-mix(in srgb, ${colors.blue[600]} 20%, transparent)`
            }
        }
    }
};
const dark15 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.blue[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.violet[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.green[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.slate[900],
                    foreground: colors.slate[50]
                },
                muted: {
                    DEFAULT: colors.slate[800],
                    foreground: colors.slate[400]
                },
                surface: {
                    DEFAULT: colors.slate[700],
                    foreground: colors.slate[300]
                },
                "surface-1": {
                    DEFAULT: colors.slate[600],
                    foreground: colors.slate[200]
                }
            },
            single: {
                foreground: colors.slate[50],
                border: {
                    DEFAULT: colors.slate[700]
                },
                input: {
                    DEFAULT: colors.slate[900],
                    hover: colors.slate[800]
                },
                ring: `color-mix(in srgb, ${colors.blue[400]} 25%, transparent)`
            }
        }
    }
};
const theme16 = {
    light: light15,
    dark: dark15
};
const light16 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.blue[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.slate[900]
                },
                muted: {
                    DEFAULT: colors.slate[100],
                    foreground: colors.slate[500]
                },
                surface: {
                    DEFAULT: colors.slate[200],
                    foreground: colors.slate[900]
                },
                "surface-1": {
                    DEFAULT: colors.slate[300],
                    foreground: colors.slate[900]
                }
            },
            single: {
                foreground: colors.slate[900],
                border: {
                    DEFAULT: colors.slate[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.slate[50]
                },
                ring: `color-mix(in srgb, ${colors.red[600]} 20%, transparent)`
            }
        }
    }
};
const dark16 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.blue[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.slate[900],
                    foreground: colors.slate[50]
                },
                muted: {
                    DEFAULT: colors.slate[800],
                    foreground: colors.slate[400]
                },
                surface: {
                    DEFAULT: colors.slate[700],
                    foreground: colors.slate[300]
                },
                "surface-1": {
                    DEFAULT: colors.slate[600],
                    foreground: colors.slate[200]
                }
            },
            single: {
                foreground: colors.slate[50],
                border: {
                    DEFAULT: colors.slate[700]
                },
                input: {
                    DEFAULT: colors.slate[900],
                    hover: colors.slate[800]
                },
                ring: `color-mix(in srgb, ${colors.red[400]} 25%, transparent)`
            }
        }
    }
};
const theme17 = {
    light: light16,
    dark: dark16
};
const light17 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.red[600]} 20%, transparent)`
            }
        }
    }
};
const dark17 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.red[400]} 25%, transparent)`
            }
        }
    }
};
const theme18 = {
    light: light17,
    dark: dark17
};
const light18 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.red[600]} 20%, transparent)`
            }
        }
    }
};
const dark18 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.red[400]} 25%, transparent)`
            }
        }
    }
};
const theme19 = {
    light: light18,
    dark: dark18
};
const light19 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.slate[900]
                },
                muted: {
                    DEFAULT: colors.slate[100],
                    foreground: colors.slate[500]
                },
                surface: {
                    DEFAULT: colors.slate[200],
                    foreground: colors.slate[900]
                },
                "surface-1": {
                    DEFAULT: colors.slate[300],
                    foreground: colors.slate[900]
                }
            },
            single: {
                foreground: colors.slate[900],
                border: {
                    DEFAULT: colors.slate[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.slate[50]
                },
                ring: `color-mix(in srgb, ${colors.red[600]} 20%, transparent)`
            }
        }
    }
};
const dark19 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.slate[900],
                    foreground: colors.slate[50]
                },
                muted: {
                    DEFAULT: colors.slate[800],
                    foreground: colors.slate[400]
                },
                surface: {
                    DEFAULT: colors.slate[700],
                    foreground: colors.slate[300]
                },
                "surface-1": {
                    DEFAULT: colors.slate[600],
                    foreground: colors.slate[200]
                }
            },
            single: {
                foreground: colors.slate[50],
                border: {
                    DEFAULT: colors.slate[700]
                },
                input: {
                    DEFAULT: colors.slate[900],
                    hover: colors.slate[800]
                },
                ring: `color-mix(in srgb, ${colors.red[400]} 25%, transparent)`
            }
        }
    }
};
const theme20 = {
    light: light19,
    dark: dark19
};
const light20 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.rose[600]} 20%, transparent)`
            }
        }
    }
};
const dark20 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.teal[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.rose[400]} 25%, transparent)`
            }
        }
    }
};
const theme21 = {
    light: light20,
    dark: dark20
};
const light21 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.sky[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.stone[50]
                },
                ring: `color-mix(in srgb, ${colors.sky[600]} 20%, transparent)`
            }
        }
    }
};
const dark21 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.sky[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[50]
                },
                muted: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                surface: {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                },
                "surface-1": {
                    DEFAULT: colors.stone[600],
                    foreground: colors.stone[200]
                }
            },
            single: {
                foreground: colors.stone[50],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[900],
                    hover: colors.stone[800]
                },
                ring: `color-mix(in srgb, ${colors.sky[400]} 25%, transparent)`
            }
        }
    }
};
const theme22 = {
    light: light21,
    dark: dark21
};
const light22 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.slate[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.cyan[600]} 20%, transparent)`
            }
        }
    }
};
const dark22 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.slate[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.cyan[400]} 25%, transparent)`
            }
        }
    }
};
const theme23 = {
    light: light22,
    dark: dark22
};
const light23 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.slate[700],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.slate[50],
                    foreground: colors.slate[900]
                },
                muted: {
                    DEFAULT: colors.slate[100],
                    foreground: colors.slate[500]
                },
                surface: {
                    DEFAULT: colors.slate[200],
                    foreground: colors.slate[900]
                },
                "surface-1": {
                    DEFAULT: colors.slate[300],
                    foreground: colors.slate[900]
                }
            },
            single: {
                foreground: colors.slate[900],
                border: {
                    DEFAULT: colors.slate[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.slate[50]
                },
                ring: `color-mix(in srgb, ${colors.teal[500]} 20%, transparent)`
            }
        }
    }
};
const dark23 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.slate[400],
                foreground: colors.slate[950]
            },
            accent: {
                DEFAULT: colors.teal[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.slate[950],
                    foreground: colors.slate[50]
                },
                muted: {
                    DEFAULT: colors.slate[900],
                    foreground: colors.slate[500]
                },
                surface: {
                    DEFAULT: colors.slate[800],
                    foreground: colors.slate[400]
                },
                "surface-1": {
                    DEFAULT: colors.slate[700],
                    foreground: colors.slate[300]
                }
            },
            single: {
                foreground: colors.slate[50],
                border: {
                    DEFAULT: colors.slate[700]
                },
                input: {
                    DEFAULT: colors.slate[950],
                    hover: colors.slate[900]
                },
                ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`
            }
        }
    }
};
const theme24 = {
    light: light23,
    dark: dark23
};
const theme25 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.stone[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.stone[50],
                        foreground: colors.stone[900]
                    },
                    muted: {
                        DEFAULT: colors.stone[100],
                        foreground: colors.stone[500]
                    },
                    surface: {
                        DEFAULT: colors.stone[200],
                        foreground: colors.stone[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.stone[300],
                        foreground: colors.stone[900]
                    }
                },
                single: {
                    foreground: colors.stone[900],
                    border: {
                        DEFAULT: colors.stone[300]
                    },
                    input: {
                        DEFAULT: colors.stone[50],
                        hover: colors.stone[100]
                    },
                    ring: `color-mix(in srgb, ${colors.stone[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.stone[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.stone[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.stone[900],
                        foreground: colors.stone[50]
                    },
                    muted: {
                        DEFAULT: colors.stone[800],
                        foreground: colors.stone[400]
                    },
                    surface: {
                        DEFAULT: colors.stone[700],
                        foreground: colors.stone[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.stone[600],
                        foreground: colors.stone[200]
                    }
                },
                single: {
                    foreground: colors.stone[50],
                    border: {
                        DEFAULT: colors.stone[700]
                    },
                    input: {
                        DEFAULT: colors.stone[900],
                        hover: colors.stone[800]
                    },
                    ring: `color-mix(in srgb, ${colors.stone[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light24 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.stone[700],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.orange[600],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.green[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[100],
                    foreground: colors.stone[900]
                },
                muted: {
                    DEFAULT: colors.stone[200],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[300],
                    foreground: colors.stone[900]
                },
                "surface-1": {
                    DEFAULT: colors.stone[400],
                    foreground: colors.stone[900]
                }
            },
            single: {
                foreground: colors.stone[900],
                border: {
                    DEFAULT: colors.stone[300]
                },
                input: {
                    DEFAULT: colors.stone[50],
                    hover: colors.stone[100]
                },
                ring: `color-mix(in srgb, ${colors.stone[700]} 20%, transparent)`
            }
        }
    }
};
const dark24 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.stone[400],
                foreground: colors.stone[950]
            },
            accent: {
                DEFAULT: colors.orange[500],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.green[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.stone[950],
                    foreground: colors.stone[100]
                },
                muted: {
                    DEFAULT: colors.stone[900],
                    foreground: colors.stone[500]
                },
                surface: {
                    DEFAULT: colors.stone[800],
                    foreground: colors.stone[400]
                },
                "surface-1": {
                    DEFAULT: colors.stone[700],
                    foreground: colors.stone[300]
                }
            },
            single: {
                foreground: colors.stone[100],
                border: {
                    DEFAULT: colors.stone[700]
                },
                input: {
                    DEFAULT: colors.stone[950],
                    hover: colors.stone[900]
                },
                ring: `color-mix(in srgb, ${colors.stone[400]} 25%, transparent)`
            }
        }
    }
};
const theme26 = {
    light: light24,
    dark: dark24
};
const light25 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.teal[600]} 20%, transparent)`
            }
        }
    }
};
const dark25 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.rose[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`
            }
        }
    }
};
const theme27 = {
    light: light25,
    dark: dark25
};
const light26 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.lime[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.lime[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.lime[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.white,
                    foreground: colors.neutral[900]
                },
                muted: {
                    DEFAULT: colors.neutral[100],
                    foreground: colors.neutral[500]
                },
                surface: {
                    DEFAULT: colors.neutral[200],
                    foreground: colors.neutral[900]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[300],
                    foreground: colors.neutral[900]
                }
            },
            single: {
                foreground: colors.neutral[900],
                border: {
                    DEFAULT: colors.neutral[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.violet[600]} 20%, transparent)`
            }
        }
    }
};
const dark26 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.lime[500],
                foreground: colors.black
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[900],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.neutral[800],
                    foreground: colors.neutral[400]
                },
                surface: {
                    DEFAULT: colors.neutral[700],
                    foreground: colors.neutral[300]
                },
                "surface-1": {
                    DEFAULT: colors.neutral[600],
                    foreground: colors.neutral[200]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.neutral[700]
                },
                input: {
                    DEFAULT: colors.neutral[900],
                    hover: colors.neutral[800]
                },
                ring: `color-mix(in srgb, ${colors.violet[400]} 25%, transparent)`
            }
        }
    }
};
const theme28 = {
    light: light26,
    dark: dark26
};
const light27 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[600],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[500],
                foreground: colors.white
            },
            success: {
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.neutral[50],
                    foreground: colors.zinc[900]
                },
                muted: {
                    DEFAULT: colors.zinc[100],
                    foreground: colors.zinc[500]
                },
                surface: {
                    DEFAULT: colors.zinc[200],
                    foreground: colors.zinc[900]
                },
                "surface-1": {
                    DEFAULT: colors.zinc[300],
                    foreground: colors.zinc[900]
                }
            },
            single: {
                foreground: colors.zinc[900],
                border: {
                    DEFAULT: colors.zinc[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.neutral[50]
                },
                ring: `color-mix(in srgb, ${colors.violet[500]} 20%, transparent)`
            }
        }
    }
};
const dark27 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[400],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.rose[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.red[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
            },
            success: {
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.zinc[950],
                    foreground: colors.neutral[50]
                },
                muted: {
                    DEFAULT: colors.zinc[900],
                    foreground: colors.zinc[500]
                },
                surface: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.zinc[400]
                },
                "surface-1": {
                    DEFAULT: colors.zinc[700],
                    foreground: colors.zinc[300]
                }
            },
            single: {
                foreground: colors.neutral[50],
                border: {
                    DEFAULT: colors.zinc[700]
                },
                input: {
                    DEFAULT: colors.zinc[950],
                    hover: colors.zinc[900]
                },
                ring: `color-mix(in srgb, ${colors.violet[400]} 25%, transparent)`
            }
        }
    }
};
const theme29 = {
    light: light27,
    dark: dark27
};
const theme30 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.zinc[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.rose[600],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.amber[500],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.emerald[600],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.zinc[50],
                        foreground: colors.zinc[900]
                    },
                    muted: {
                        DEFAULT: colors.zinc[100],
                        foreground: colors.zinc[500]
                    },
                    surface: {
                        DEFAULT: colors.zinc[200],
                        foreground: colors.zinc[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.zinc[300],
                        foreground: colors.zinc[900]
                    }
                },
                single: {
                    foreground: colors.zinc[900],
                    border: {
                        DEFAULT: colors.zinc[300]
                    },
                    input: {
                        DEFAULT: colors.zinc[50],
                        hover: colors.zinc[100]
                    },
                    ring: `color-mix(in srgb, ${colors.zinc[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.zinc[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.zinc[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.rose[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.amber[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.emerald[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.zinc[900],
                        foreground: colors.zinc[50]
                    },
                    muted: {
                        DEFAULT: colors.zinc[800],
                        foreground: colors.zinc[400]
                    },
                    surface: {
                        DEFAULT: colors.zinc[700],
                        foreground: colors.zinc[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.zinc[600],
                        foreground: colors.zinc[200]
                    }
                },
                single: {
                    foreground: colors.zinc[50],
                    border: {
                        DEFAULT: colors.zinc[700]
                    },
                    input: {
                        DEFAULT: colors.zinc[900],
                        hover: colors.zinc[800]
                    },
                    ring: `color-mix(in srgb, ${colors.zinc[200]} 25%, transparent)`
                }
            }
        }
    }
};
const mod = {
    blueOrange: theme,
    cyanRed: theme1,
    cyanSlate: theme2,
    emeraldAmberForest: theme3,
    emeraldPink: theme4,
    fuchsiaEmerald: theme5,
    gray: theme6,
    indigoAmber: theme7,
    limeFuchsiaNeon: theme8,
    monokaiCyan: theme9,
    monokaiGreen: theme10,
    monokaiPink: theme11,
    orangePinkSunset: theme12,
    pinkEmerald: theme13,
    pinkTeal: theme14,
    purpleYellow: theme15,
    rainbow: theme16,
    redBlue: theme17,
    redCyan: theme18,
    redSky: theme19,
    redSkySlate: theme20,
    roseTeal: theme21,
    skyAmber: theme22,
    slateCyan: theme23,
    slateTealOcean: theme24,
    stone: theme25,
    stoneOrangeEarth: theme26,
    tealRose: theme27,
    violetLime: theme28,
    violetRoseDusk: theme29,
    zinc: theme30
};
function isSingleColorObject(value) {
    return typeof value === "object" && "DEFAULT" in value;
}
function deriveColorMixStates(cssVarRef, mode) {
    const mix = mode === "light" ? "black" : "white";
    return {
        hover: `color-mix(in oklch, ${cssVarRef}, ${mix} 10%)`,
        active: `color-mix(in oklch, ${cssVarRef}, ${mix} 20%)`
    };
}
function fillPairStates(pair, prefix, key, mode) {
    if (pair.hover !== undefined && pair.active !== undefined) {
        return pair;
    }
    const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, mode);
    return {
        ...pair,
        hover: pair.hover ?? derived.hover,
        active: pair.active ?? derived.active
    };
}
function fillColorValueStates(color, prefix, key, mode) {
    if (color.hover !== undefined && color.active !== undefined) {
        return color;
    }
    const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, mode);
    return {
        ...color,
        hover: color.hover ?? derived.hover,
        active: color.active ?? derived.active
    };
}
function generatePairedColorTokens(tokens, key, pair, prefix) {
    tokens[`${prefix}color-${key}`] = pair.DEFAULT;
    tokens[`${prefix}color-${key}-hover`] = pair.hover ?? pair.DEFAULT;
    tokens[`${prefix}color-${key}-active`] = pair.active ?? pair.DEFAULT;
    tokens[`${prefix}color-${key}-foreground`] = pair.foreground;
    tokens[`${prefix}color-${key}-foreground-hover`] = pair.foreground;
    tokens[`${prefix}color-${key}-foreground-active`] = pair.foreground;
}
function generateSingleColorTokens(tokens, key, color, prefix) {
    if (isSingleColorObject(color)) {
        tokens[`${prefix}color-${key}`] = color.DEFAULT;
        tokens[`${prefix}color-${key}-hover`] = color.hover ?? color.DEFAULT;
        tokens[`${prefix}color-${key}-active`] = color.active ?? color.DEFAULT;
    } else {
        tokens[`${prefix}color-${key}`] = color;
        tokens[`${prefix}color-${key}-hover`] = color;
        tokens[`${prefix}color-${key}-active`] = color;
    }
}
function generateCssTokens(schema, prefix, mode = "light") {
    const tokens = {};
    for (const [key, pair] of Object.entries(schema.colors.intent)){
        generatePairedColorTokens(tokens, key, fillPairStates(pair, prefix, key, mode), prefix);
    }
    const contrastMix = mode === "light" ? "black" : "white";
    for (const key of Object.keys(schema.colors.intent)){
        tokens[`${prefix}color-surface-${key}`] = `color-mix(in srgb, var(--${prefix}color-${key}) 15%, var(--${prefix}color-background))`;
        tokens[`${prefix}color-surface-${key}-foreground`] = `color-mix(in srgb, var(--${prefix}color-${key}), ${contrastMix} 10%)`;
        tokens[`${prefix}color-surface-${key}-border`] = `color-mix(in srgb, var(--${prefix}color-${key}) 30%, var(--${prefix}color-background))`;
    }
    for (const [key, pair] of Object.entries(schema.colors.role.paired)){
        const filled = key === "background" ? pair : fillPairStates(pair, prefix, key, mode);
        generatePairedColorTokens(tokens, key, filled, prefix);
    }
    for (const [key, color] of Object.entries(schema.colors.role.single)){
        if (isSingleColorObject(color)) {
            generateSingleColorTokens(tokens, key, fillColorValueStates(color, prefix, key, mode), prefix);
        } else {
            generateSingleColorTokens(tokens, key, color, prefix);
        }
    }
    return tokens;
}
function toCssString(tokens, selector = ":root") {
    const maxLen = Math.max(...Object.keys(tokens).map((k)=>`--${k}`.length));
    const getBaseColor = (key)=>{
        const match = key.match(/color-([a-z]+-?\d*)/);
        return match ? match[1] : key;
    };
    const groups = new Map();
    for (const [key, value] of Object.entries(tokens)){
        const base = getBaseColor(key);
        if (!groups.has(base)) groups.set(base, []);
        groups.get(base).push([
            key,
            value
        ]);
    }
    const formatVar = ([key, value])=>{
        const cssKey = `--${key}:`;
        return `\t${cssKey.padEnd(maxLen + 1)} ${value};`;
    };
    const parts = [];
    for (const entries of groups.values()){
        parts.push(entries.map(formatVar).join("\n"));
    }
    return `${selector} {\n${parts.join("\n\n")}\n}\n`;
}
export { colors as colors };
export { generateCssTokens as generateCssTokens, toCssString as toCssString };
function buildHexToNameMap(c) {
    const map = new Map();
    for (const [family, value] of Object.entries(c)){
        if (typeof value === "string") {
            map.set(value.toLowerCase(), family);
        } else {
            for (const [shade, hex] of Object.entries(value)){
                if (!map.has(hex.toLowerCase())) {
                    map.set(hex.toLowerCase(), `${family}-${shade}`);
                }
            }
        }
    }
    return map;
}
function parseRingValue(v) {
    const m = v.match(/color-mix\(in srgb,\s*(#[0-9a-fA-F]+)\s+(\d+)%,\s*transparent\)/);
    if (!m) return null;
    return {
        hex: m[1],
        percent: parseInt(m[2])
    };
}
function buildRingValue(hex, percent) {
    return `color-mix(in srgb, ${hex} ${percent}%, transparent)`;
}
function hexForSelection(c, family, shade) {
    if (family === "black") return c.black;
    if (family === "white") return c.white;
    const fam = c[family];
    if (fam && typeof fam === "object" && shade !== null) {
        return fam[String(shade)] ?? null;
    }
    return null;
}
function selectionForHex(hex, hexToName) {
    const name = hexToName.get(hex.toLowerCase());
    if (!name) return null;
    if (name === "black" || name === "white") return {
        family: name,
        shade: null
    };
    const idx = name.lastIndexOf("-");
    return {
        family: name.substring(0, idx),
        shade: parseInt(name.substring(idx + 1))
    };
}
function colorRef(hex, hexToName) {
    const sel = selectionForHex(hex, hexToName);
    if (!sel) return `"${hex}"`;
    if (sel.shade === null) return `colors.${sel.family}`;
    return `colors.${sel.family}[${sel.shade}]`;
}
function singleColorToTs(val, hexToName) {
    if (typeof val === "string") {
        const ring = parseRingValue(val);
        if (ring) {
            const ref = colorRef(ring.hex, hexToName);
            return `\`color-mix(in srgb, \${${ref}} ${ring.percent}%, transparent)\``;
        }
        return colorRef(val, hexToName);
    }
    const parts = [];
    parts.push(`DEFAULT: ${colorRef(val.DEFAULT, hexToName)}`);
    if (val.hover) parts.push(`hover: ${colorRef(val.hover, hexToName)}`);
    if (val.active) parts.push(`active: ${colorRef(val.active, hexToName)}`);
    return `{\n\t\t\t\t\t${parts.join(",\n\t\t\t\t\t")},\n\t\t\t\t}`;
}
function themeToTypeScript(schema, hexToName) {
    function modeToTs(mode) {
        const s = mode === "light" ? schema.light : schema.dark;
        if (!s) return "";
        const intentLines = [];
        for (const [key, pair] of Object.entries(s.colors.intent)){
            const parts = [
                `DEFAULT: ${colorRef(pair.DEFAULT, hexToName)}`,
                `foreground: ${colorRef(pair.foreground, hexToName)}`
            ];
            intentLines.push(`\t\t\t${key}: {\n\t\t\t\t${parts.join(",\n\t\t\t\t")},\n\t\t\t}`);
        }
        const pairedLines = [];
        for (const [key, pair] of Object.entries(s.colors.role.paired)){
            const parts = [
                `DEFAULT: ${colorRef(pair.DEFAULT, hexToName)}`,
                `foreground: ${colorRef(pair.foreground, hexToName)}`
            ];
            const qkey = key.includes("-") ? `"${key}"` : key;
            pairedLines.push(`\t\t\t\t${qkey}: {\n\t\t\t\t\t${parts.join(",\n\t\t\t\t\t")},\n\t\t\t\t}`);
        }
        const singleLines = [];
        for (const [key, val] of Object.entries(s.colors.role.single)){
            singleLines.push(`\t\t\t\t${key}: ${singleColorToTs(val, hexToName)}`);
        }
        return `const ${mode} = {
	colors: {
		intent: {
${intentLines.join(",\n")},
		},
		role: {
			paired: {
${pairedLines.join(",\n")},
			},
			single: {
${singleLines.join(",\n")},
			},
		},
	},
};`;
    }
    const lightTs = modeToTs("light");
    const darkTs = schema.dark ? modeToTs("dark") : "";
    let out = `import type { ThemeSchema } from "../types.ts";
import { colors } from "../colors.ts";

${lightTs}
`;
    if (darkTs) {
        out += `\n${darkTs}\n`;
    }
    out += `\nconst theme: ThemeSchema = { light${schema.dark ? ", dark" : ""} };\n\nexport default theme;\n`;
    return out;
}
export { mod as themes };
export { buildHexToNameMap as buildHexToNameMap };
export { parseRingValue as parseRingValue };
export { buildRingValue as buildRingValue };
export { hexForSelection as hexForSelection };
export { selectionForHex as selectionForHex };
export { themeToTypeScript as themeToTypeScript };
