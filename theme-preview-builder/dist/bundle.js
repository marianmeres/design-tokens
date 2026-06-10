const MAX_UPDATE_DEPTH = 1000;
const Scheduler = (()=>{
    const queues = {
        microtask: {
            map: new Map(),
            scheduled: false,
            arm: (cb)=>queueMicrotask(cb)
        },
        raf: {
            map: new Map(),
            scheduled: false,
            arm: (cb)=>requestAnimationFrame(cb)
        }
    };
    let flushing = false;
    let chainDepth = 0;
    function flush(kind) {
        const q = queues[kind];
        const entries = q.map;
        q.map = new Map();
        q.scheduled = false;
        flushing = true;
        try {
            entries.forEach((read, fn)=>fn(read()));
        } finally{
            flushing = false;
        }
    }
    function enqueue(fn, kind, read) {
        const q = queues[kind] ?? queues.microtask;
        const arming = !q.scheduled;
        if (arming) {
            if (flushing) {
                if (++chainDepth > 1000) {
                    chainDepth = 0;
                    throw new Error(`vanilla: maximum update depth exceeded (${1000}) — ` + `likely a feedback loop where an effect's set() retriggers ` + `itself (a writes b, b writes a, …). Check your reactTo/computed ` + `wiring, or make the loop converge so the equality guard can ` + `stop it.`);
                }
            } else {
                chainDepth = 0;
            }
        }
        q.map.set(fn, read);
        if (arming) {
            q.scheduled = true;
            q.arm(()=>flush(kind));
        }
    }
    return {
        enqueue
    };
})();
let computing = 0;
function withinCompute(calc) {
    computing++;
    try {
        return calc();
    } finally{
        computing--;
    }
}
function observable(value) {
    const subs = new Map();
    function notify() {
        subs.forEach((kind, fn)=>Scheduler.enqueue(fn, kind, ()=>value));
    }
    const self = {
        get: ()=>value,
        set (v) {
            if (computing > 0) {
                throw new Error("vanilla: cannot set() an observable from inside a computed's " + "calc — calc must be a pure derivation of its sources (no writes " + "/ side effects). Move the write into a reactTo(...) effect.");
            }
            if (v === value) return;
            value = v;
            notify();
        },
        update (fn) {
            self.set(fn(value));
        },
        subscribe (fn, { immediate = true, scheduler = "microtask" } = {}) {
            subs.set(fn, scheduler);
            if (immediate) fn(value);
            return ()=>{
                subs.delete(fn);
            };
        }
    };
    return self;
}
function reactTo(sources, fn, { immediate = true, scheduler = "microtask" } = {}) {
    const unsubs = sources.map((o)=>o.subscribe(fn, {
            immediate: false,
            scheduler
        }));
    if (immediate) fn();
    return ()=>unsubs.forEach((u)=>u());
}
function computed(sources, calc, { scheduler = "microtask" } = {}) {
    const out = observable(withinCompute(calc));
    reactTo(sources, ()=>out.set(withinCompute(calc)), {
        immediate: false,
        scheduler
    });
    return {
        get: out.get,
        subscribe: out.subscribe
    };
}
function fromTemplate(id) {
    const tpl = document.getElementById(id);
    if (!tpl) throw new Error(`Template not found: #${id}`);
    const first = tpl.content.firstElementChild;
    if (!first) throw new Error(`Template #${id} has no element content`);
    return first.cloneNode(true);
}
function refs(root) {
    const map = {};
    const self = root;
    if (self.matches?.("[data-ref]")) map[self.dataset.ref] = self;
    root.querySelectorAll("[data-ref]").forEach((el)=>{
        map[el.dataset.ref] = el;
    });
    return map;
}
const BIND_ALIAS = {
    text: "textContent",
    html: "innerHTML",
    class: "className"
};
function applyBindings(root, data) {
    const targets = [
        ...root.matches?.("[data-bind]") ? [
            root
        ] : [],
        ...root.querySelectorAll("[data-bind]")
    ];
    targets.forEach((el)=>{
        el.dataset.bind.split(";").forEach((rule)=>{
            const [kind, field] = rule.split(":").map((s)=>s.trim());
            if (!kind) return;
            const prop = BIND_ALIAS[kind] ?? kind;
            el[prop] = data[field];
        });
    });
}
function tracker() {
    const cleanups = [];
    return {
        track: (unsub)=>{
            cleanups.push(unsub);
            return unsub;
        },
        dispose: ()=>{
            cleanups.forEach((fn)=>fn());
            cleanups.length = 0;
        }
    };
}
function createView(mountFn) {
    const { track, dispose } = tracker();
    const api = mountFn(track) ?? {};
    return {
        ...api,
        destroy () {
            dispose();
            api.el?.remove();
        }
    };
}
function enhance(target, mountFn) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) throw new Error(`enhance: no element matches ${JSON.stringify(target)}`);
    const { track, dispose } = tracker();
    const api = mountFn(el, track) ?? {};
    return {
        ...api,
        el,
        destroy () {
            dispose();
        }
    };
}
function delegate(root, handlers) {
    const seen = new Set();
    const collect = (scope)=>scope.querySelectorAll("[data-on]").forEach((el)=>el.dataset.on.split(";").forEach((r)=>seen.add(r.split(":")[0].trim())));
    collect(root);
    document.querySelectorAll("template").forEach((t)=>collect(t.content));
    const unsubs = [];
    seen.forEach((evt)=>{
        const listener = (e)=>{
            const el = e.target?.closest("[data-on]");
            if (!el || !root.contains(el)) return;
            el.dataset.on.split(";").forEach((rule)=>{
                const [type, action] = rule.split(":").map((s)=>s.trim());
                if (type === evt && handlers[action]) handlers[action](e, el);
            });
        };
        root.addEventListener(evt, listener);
        unsubs.push(()=>root.removeEventListener(evt, listener));
    });
    return ()=>unsubs.forEach((u)=>u());
}
function mount(track, slot, vf, props) {
    const view = typeof vf === "function" ? vf(props) : vf;
    track(view.destroy);
    if (view.el) slot.appendChild(view.el);
    return view;
}
function adoptTemplates(doc) {
    doc.querySelectorAll("template").forEach((t)=>{
        if (t.id && !document.getElementById(t.id)) {
            document.body.appendChild(document.importNode(t, true));
        }
    });
}
function adoptStyles(doc, src) {
    doc.querySelectorAll("style").forEach((s)=>{
        const clone = document.importNode(s, true);
        clone.dataset.vanillaSrc = src;
        document.head.appendChild(clone);
    });
}
function resolveAssetUrl(url, base = document.baseURI) {
    const u = new URL(url, base);
    u.username = "";
    u.password = "";
    return u.href;
}
const _templateLoads = new Map();
function loadTemplates(url) {
    const abs = resolveAssetUrl(url);
    let p = _templateLoads.get(abs);
    if (!p) {
        p = fetch(abs).then((r)=>r.text()).then((html)=>adoptTemplates(new DOMParser().parseFromString(html, "text/html")));
        _templateLoads.set(abs, p);
    }
    return p;
}
const _componentLoads = new Map();
function loadComponent(url) {
    const abs = resolveAssetUrl(url);
    let p = _componentLoads.get(abs);
    if (!p) {
        p = (async ()=>{
            const html = await fetch(abs).then((r)=>r.text());
            const doc = new DOMParser().parseFromString(html, "text/html");
            adoptTemplates(doc);
            adoptStyles(doc, abs);
            const script = doc.querySelector('script[type="module"]');
            if (!script) return {};
            const blobUrl = URL.createObjectURL(new Blob([
                script.textContent ?? ""
            ], {
                type: "text/javascript"
            }));
            try {
                return await import(blobUrl);
            } finally{
                URL.revokeObjectURL(blobUrl);
            }
        })();
        _componentLoads.set(abs, p);
    }
    return p;
}
export { MAX_UPDATE_DEPTH as MAX_UPDATE_DEPTH };
export { observable as observable };
export { reactTo as reactTo };
export { computed as computed };
export { fromTemplate as fromTemplate };
export { refs as refs };
export { applyBindings as applyBindings };
export { createView as createView };
export { enhance as enhance };
export { delegate as delegate };
export { mount as mount };
export { resolveAssetUrl as resolveAssetUrl };
export { loadTemplates as loadTemplates };
export { loadComponent as loadComponent };
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
    olive: {
        50: "#fbfbf9",
        100: "#f4f4f0",
        200: "#e8e8e3",
        300: "#d8d8d0",
        400: "#abab9c",
        500: "#7c7c67",
        600: "#5b5b4b",
        700: "#474739",
        800: "#2b2b22",
        900: "#1d1d16",
        950: "#0c0c09"
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
    taupe: {
        50: "#fbfaf9",
        100: "#f3f1f1",
        200: "#e8e4e3",
        300: "#d8d2d0",
        400: "#aba09c",
        500: "#7c6d67",
        600: "#5b4f4b",
        700: "#473c39",
        800: "#2b2422",
        900: "#1d1816",
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
    mauve: {
        50: "#fafafa",
        100: "#f3f1f3",
        200: "#e7e4e7",
        300: "#d7d0d7",
        400: "#a89ea9",
        500: "#79697b",
        600: "#594c5b",
        700: "#463947",
        800: "#2a212c",
        900: "#1d161e",
        950: "#0c090c"
    },
    mist: {
        50: "#f9fbfb",
        100: "#f1f3f3",
        200: "#e3e7e8",
        300: "#d0d6d8",
        400: "#9ca8ab",
        500: "#67787c",
        600: "#4b585b",
        700: "#394447",
        800: "#22292b",
        900: "#161b1d",
        950: "#090b0c"
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
                DEFAULT: colors.amber[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.olive[700],
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
                    DEFAULT: colors.olive[50],
                    foreground: colors.olive[900]
                },
                muted: {
                    DEFAULT: colors.olive[100],
                    foreground: colors.olive[500]
                },
                surface: {
                    DEFAULT: colors.olive[200],
                    foreground: colors.olive[900]
                },
                "surface-1": {
                    DEFAULT: colors.olive[300],
                    foreground: colors.olive[900]
                }
            },
            single: {
                foreground: colors.olive[900],
                border: {
                    DEFAULT: colors.olive[300]
                },
                input: {
                    DEFAULT: colors.olive[50],
                    hover: colors.olive[100]
                },
                ring: `color-mix(in srgb, ${colors.amber[600]} 20%, transparent)`
            }
        }
    }
};
const dark = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.amber[500],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.olive[400],
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
                    DEFAULT: colors.olive[900],
                    foreground: colors.olive[50]
                },
                muted: {
                    DEFAULT: colors.olive[800],
                    foreground: colors.olive[400]
                },
                surface: {
                    DEFAULT: colors.olive[700],
                    foreground: colors.olive[300]
                },
                "surface-1": {
                    DEFAULT: colors.olive[600],
                    foreground: colors.olive[200]
                }
            },
            single: {
                foreground: colors.olive[50],
                border: {
                    DEFAULT: colors.olive[600]
                },
                input: {
                    DEFAULT: colors.olive[900],
                    hover: colors.olive[800]
                },
                ring: `color-mix(in srgb, ${colors.amber[500]} 25%, transparent)`
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
const dark1 = {
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
const dark2 = {
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
const theme2 = {
    light: light2,
    dark: dark2
};
const light3 = {
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
const dark3 = {
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
const theme3 = {
    light: light3,
    dark: dark3
};
const light4 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.yellow[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.pink[500],
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.mauve[50],
                    foreground: colors.mauve[900]
                },
                muted: {
                    DEFAULT: colors.mauve[100],
                    foreground: colors.mauve[500]
                },
                surface: {
                    DEFAULT: colors.mauve[200],
                    foreground: colors.mauve[900]
                },
                "surface-1": {
                    DEFAULT: colors.mauve[300],
                    foreground: colors.mauve[900]
                }
            },
            single: {
                foreground: colors.mauve[900],
                border: {
                    DEFAULT: colors.mauve[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.mauve[50]
                },
                ring: `color-mix(in srgb, ${colors.yellow[400]} 20%, transparent)`
            }
        }
    }
};
const dark4 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.yellow[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.pink[400],
                foreground: colors.white
            },
            destructive: {
                DEFAULT: colors.rose[500],
                foreground: colors.white
            },
            warning: {
                DEFAULT: colors.orange[400],
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
                    DEFAULT: colors.violet[950],
                    foreground: colors.violet[50]
                },
                muted: {
                    DEFAULT: colors.violet[900],
                    foreground: colors.violet[300]
                },
                surface: {
                    DEFAULT: colors.violet[800],
                    foreground: colors.violet[200]
                },
                "surface-1": {
                    DEFAULT: colors.violet[700],
                    foreground: colors.violet[100]
                }
            },
            single: {
                foreground: colors.violet[50],
                border: {
                    DEFAULT: colors.violet[800]
                },
                input: {
                    DEFAULT: colors.violet[950],
                    hover: colors.violet[900]
                },
                ring: `color-mix(in srgb, ${colors.yellow[400]} 25%, transparent)`
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
                DEFAULT: colors.blue[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.lime[400],
                foreground: colors.black
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.yellow[50],
                    foreground: colors.yellow[950]
                },
                muted: {
                    DEFAULT: colors.yellow[100],
                    foreground: colors.yellow[700]
                },
                surface: {
                    DEFAULT: colors.yellow[200],
                    foreground: colors.yellow[950]
                },
                "surface-1": {
                    DEFAULT: colors.yellow[300],
                    foreground: colors.yellow[950]
                }
            },
            single: {
                foreground: colors.yellow[950],
                border: {
                    DEFAULT: colors.yellow[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.yellow[50]
                },
                ring: `color-mix(in srgb, ${colors.blue[600]} 20%, transparent)`
            }
        }
    }
};
const dark5 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.blue[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.lime[400],
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
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.sky[950],
                    foreground: colors.sky[50]
                },
                muted: {
                    DEFAULT: colors.sky[900],
                    foreground: colors.sky[400]
                },
                surface: {
                    DEFAULT: colors.sky[800],
                    foreground: colors.sky[200]
                },
                "surface-1": {
                    DEFAULT: colors.sky[700],
                    foreground: colors.sky[100]
                }
            },
            single: {
                foreground: colors.sky[50],
                border: {
                    DEFAULT: colors.sky[800]
                },
                input: {
                    DEFAULT: colors.sky[950],
                    hover: colors.sky[900]
                },
                ring: `color-mix(in srgb, ${colors.blue[400]} 25%, transparent)`
            }
        }
    }
};
const theme5 = {
    light: light5,
    dark: dark5
};
const light6 = {
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
const dark6 = {
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
const theme6 = {
    light: light6,
    dark: dark6
};
const light7 = {
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
const dark7 = {
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
const theme7 = {
    light: light7,
    dark: dark7
};
const light8 = {
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
const dark8 = {
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
const theme8 = {
    light: light8,
    dark: dark8
};
const theme9 = {
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
const pink = "#f6329b";
const mint = "#5deab5";
const light9 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: pink,
                foreground: colors.white
            },
            accent: {
                DEFAULT: mint,
                foreground: colors.emerald[950]
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
                    DEFAULT: colors.teal[50],
                    foreground: colors.teal[950]
                },
                muted: {
                    DEFAULT: colors.teal[100],
                    foreground: colors.teal[700]
                },
                surface: {
                    DEFAULT: colors.teal[200],
                    foreground: colors.teal[950]
                },
                "surface-1": {
                    DEFAULT: colors.teal[300],
                    foreground: colors.teal[950]
                }
            },
            single: {
                foreground: colors.teal[950],
                border: {
                    DEFAULT: colors.teal[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.teal[50]
                },
                ring: `color-mix(in srgb, ${pink} 20%, transparent)`
            }
        }
    }
};
const dark9 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: pink,
                foreground: colors.white
            },
            accent: {
                DEFAULT: mint,
                foreground: colors.emerald[950]
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
                    DEFAULT: colors.teal[950],
                    foreground: colors.teal[50]
                },
                muted: {
                    DEFAULT: colors.teal[900],
                    foreground: colors.teal[400]
                },
                surface: {
                    DEFAULT: colors.teal[800],
                    foreground: colors.teal[200]
                },
                "surface-1": {
                    DEFAULT: colors.teal[700],
                    foreground: colors.teal[100]
                }
            },
            single: {
                foreground: colors.teal[50],
                border: {
                    DEFAULT: colors.teal[800]
                },
                input: {
                    DEFAULT: colors.teal[950],
                    hover: colors.teal[900]
                },
                ring: `color-mix(in srgb, ${pink} 25%, transparent)`
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
const dark10 = {
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
const theme11 = {
    light: light10,
    dark: dark10
};
const light11 = {
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
const dark11 = {
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
const theme12 = {
    light: light11,
    dark: dark11
};
const theme13 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.mauve[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.mauve[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.mauve[50],
                        foreground: colors.mauve[900]
                    },
                    muted: {
                        DEFAULT: colors.mauve[100],
                        foreground: colors.mauve[500]
                    },
                    surface: {
                        DEFAULT: colors.mauve[200],
                        foreground: colors.mauve[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.mauve[300],
                        foreground: colors.mauve[900]
                    }
                },
                single: {
                    foreground: colors.mauve[900],
                    border: {
                        DEFAULT: colors.mauve[300]
                    },
                    input: {
                        DEFAULT: colors.mauve[50],
                        hover: colors.mauve[100]
                    },
                    ring: `color-mix(in srgb, ${colors.mauve[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.mauve[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.mauve[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.mauve[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.mauve[900],
                        foreground: colors.mauve[50]
                    },
                    muted: {
                        DEFAULT: colors.mauve[800],
                        foreground: colors.mauve[400]
                    },
                    surface: {
                        DEFAULT: colors.mauve[700],
                        foreground: colors.mauve[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.mauve[600],
                        foreground: colors.mauve[200]
                    }
                },
                single: {
                    foreground: colors.mauve[50],
                    border: {
                        DEFAULT: colors.mauve[700]
                    },
                    input: {
                        DEFAULT: colors.mauve[900],
                        hover: colors.mauve[800]
                    },
                    ring: `color-mix(in srgb, ${colors.mauve[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light12 = {
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
                    DEFAULT: colors.mauve[100],
                    foreground: colors.mauve[900]
                },
                muted: {
                    DEFAULT: colors.mauve[200],
                    foreground: colors.mauve[500]
                },
                surface: {
                    DEFAULT: colors.mauve[300],
                    foreground: colors.mauve[900]
                },
                "surface-1": {
                    DEFAULT: colors.mauve[400],
                    foreground: colors.mauve[900]
                }
            },
            single: {
                foreground: colors.mauve[900],
                border: {
                    DEFAULT: colors.mauve[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.mauve[100]
                },
                ring: `color-mix(in srgb, ${colors.lime[500]} 25%, transparent)`
            }
        }
    }
};
const dark12 = {
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
                    DEFAULT: colors.mauve[950],
                    foreground: colors.mauve[50]
                },
                muted: {
                    DEFAULT: colors.mauve[900],
                    foreground: colors.mauve[500]
                },
                surface: {
                    DEFAULT: colors.mauve[800],
                    foreground: colors.mauve[400]
                },
                "surface-1": {
                    DEFAULT: colors.mauve[700],
                    foreground: colors.mauve[300]
                }
            },
            single: {
                foreground: colors.mauve[50],
                border: {
                    DEFAULT: colors.mauve[700]
                },
                input: {
                    DEFAULT: colors.mauve[950],
                    hover: colors.mauve[900]
                },
                ring: `color-mix(in srgb, ${colors.lime[400]} 30%, transparent)`
            }
        }
    }
};
const theme14 = {
    light: light12,
    dark: dark12
};
const light13 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.mauve[700],
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
                    DEFAULT: colors.mauve[50],
                    foreground: colors.mauve[900]
                },
                muted: {
                    DEFAULT: colors.mauve[100],
                    foreground: colors.mauve[500]
                },
                surface: {
                    DEFAULT: colors.mauve[200],
                    foreground: colors.mauve[900]
                },
                "surface-1": {
                    DEFAULT: colors.mauve[300],
                    foreground: colors.mauve[900]
                }
            },
            single: {
                foreground: colors.mauve[900],
                border: {
                    DEFAULT: colors.mauve[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.mauve[50]
                },
                ring: `color-mix(in srgb, ${colors.mauve[700]} 20%, transparent)`
            }
        }
    }
};
const dark13 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.mauve[400],
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
                    DEFAULT: colors.mauve[900],
                    foreground: colors.mauve[50]
                },
                muted: {
                    DEFAULT: colors.mauve[800],
                    foreground: colors.mauve[400]
                },
                surface: {
                    DEFAULT: colors.mauve[700],
                    foreground: colors.mauve[300]
                },
                "surface-1": {
                    DEFAULT: colors.mauve[600],
                    foreground: colors.mauve[200]
                }
            },
            single: {
                foreground: colors.mauve[50],
                border: {
                    DEFAULT: colors.mauve[700]
                },
                input: {
                    DEFAULT: colors.mauve[900],
                    hover: colors.mauve[800]
                },
                ring: `color-mix(in srgb, ${colors.mauve[400]} 25%, transparent)`
            }
        }
    }
};
const theme15 = {
    light: light13,
    dark: dark13
};
const theme16 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.mist[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.mist[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.mist[50],
                        foreground: colors.mist[900]
                    },
                    muted: {
                        DEFAULT: colors.mist[100],
                        foreground: colors.mist[500]
                    },
                    surface: {
                        DEFAULT: colors.mist[200],
                        foreground: colors.mist[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.mist[300],
                        foreground: colors.mist[900]
                    }
                },
                single: {
                    foreground: colors.mist[900],
                    border: {
                        DEFAULT: colors.mist[300]
                    },
                    input: {
                        DEFAULT: colors.mist[50],
                        hover: colors.mist[100]
                    },
                    ring: `color-mix(in srgb, ${colors.mist[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.mist[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.mist[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.mist[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.mist[900],
                        foreground: colors.mist[50]
                    },
                    muted: {
                        DEFAULT: colors.mist[800],
                        foreground: colors.mist[400]
                    },
                    surface: {
                        DEFAULT: colors.mist[700],
                        foreground: colors.mist[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.mist[600],
                        foreground: colors.mist[200]
                    }
                },
                single: {
                    foreground: colors.mist[50],
                    border: {
                        DEFAULT: colors.mist[700]
                    },
                    input: {
                        DEFAULT: colors.mist[900],
                        hover: colors.mist[800]
                    },
                    ring: `color-mix(in srgb, ${colors.mist[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light14 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.indigo[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[500],
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.mist[50],
                    foreground: colors.mist[900]
                },
                muted: {
                    DEFAULT: colors.mist[100],
                    foreground: colors.mist[500]
                },
                surface: {
                    DEFAULT: colors.mist[200],
                    foreground: colors.mist[900]
                },
                "surface-1": {
                    DEFAULT: colors.mist[300],
                    foreground: colors.mist[900]
                }
            },
            single: {
                foreground: colors.mist[900],
                border: {
                    DEFAULT: colors.mist[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.mist[50]
                },
                ring: `color-mix(in srgb, ${colors.indigo[600]} 20%, transparent)`
            }
        }
    }
};
const dark14 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.indigo[400],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.sky[400],
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
                    DEFAULT: colors.mist[900],
                    foreground: colors.mist[50]
                },
                muted: {
                    DEFAULT: colors.mist[800],
                    foreground: colors.mist[400]
                },
                surface: {
                    DEFAULT: colors.mist[700],
                    foreground: colors.mist[300]
                },
                "surface-1": {
                    DEFAULT: colors.mist[600],
                    foreground: colors.mist[200]
                }
            },
            single: {
                foreground: colors.mist[50],
                border: {
                    DEFAULT: colors.mist[700]
                },
                input: {
                    DEFAULT: colors.mist[900],
                    hover: colors.mist[800]
                },
                ring: `color-mix(in srgb, ${colors.indigo[400]} 25%, transparent)`
            }
        }
    }
};
const theme17 = {
    light: light14,
    dark: dark14
};
const light15 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[600],
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.mist[50],
                    foreground: colors.mist[900]
                },
                muted: {
                    DEFAULT: colors.mist[100],
                    foreground: colors.mist[500]
                },
                surface: {
                    DEFAULT: colors.mist[200],
                    foreground: colors.mist[900]
                },
                "surface-1": {
                    DEFAULT: colors.mist[300],
                    foreground: colors.mist[900]
                }
            },
            single: {
                foreground: colors.mist[900],
                border: {
                    DEFAULT: colors.mist[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.mist[50]
                },
                ring: `color-mix(in srgb, ${colors.violet[500]} 20%, transparent)`
            }
        }
    }
};
const dark15 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.violet[400],
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
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.mist[950],
                    foreground: colors.mist[50]
                },
                muted: {
                    DEFAULT: colors.mist[900],
                    foreground: colors.mist[500]
                },
                surface: {
                    DEFAULT: colors.mist[800],
                    foreground: colors.mist[400]
                },
                "surface-1": {
                    DEFAULT: colors.mist[700],
                    foreground: colors.mist[300]
                }
            },
            single: {
                foreground: colors.mist[50],
                border: {
                    DEFAULT: colors.mist[700]
                },
                input: {
                    DEFAULT: colors.mist[950],
                    hover: colors.mist[900]
                },
                ring: `color-mix(in srgb, ${colors.violet[400]} 25%, transparent)`
            }
        }
    }
};
const theme18 = {
    light: light15,
    dark: dark15
};
const light16 = {
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
const dark16 = {
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
const theme19 = {
    light: light16,
    dark: dark16
};
const light17 = {
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
const dark17 = {
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
const theme20 = {
    light: light17,
    dark: dark17
};
const light18 = {
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
const dark18 = {
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
const theme21 = {
    light: light18,
    dark: dark18
};
const light19 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.fuchsia[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[400],
                foreground: colors.cyan[950]
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
                    DEFAULT: colors.violet[50],
                    foreground: colors.violet[950]
                },
                muted: {
                    DEFAULT: colors.violet[100],
                    foreground: colors.violet[600]
                },
                surface: {
                    DEFAULT: colors.violet[200],
                    foreground: colors.violet[950]
                },
                "surface-1": {
                    DEFAULT: colors.violet[300],
                    foreground: colors.violet[950]
                }
            },
            single: {
                foreground: colors.violet[950],
                border: {
                    DEFAULT: colors.violet[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.violet[50]
                },
                ring: `color-mix(in srgb, ${colors.fuchsia[600]} 20%, transparent)`
            }
        }
    }
};
const dark19 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.fuchsia[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.cyan[400],
                foreground: colors.cyan[950]
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
                    DEFAULT: colors.indigo[950],
                    foreground: colors.indigo[50]
                },
                muted: {
                    DEFAULT: colors.indigo[900],
                    foreground: colors.indigo[300]
                },
                surface: {
                    DEFAULT: colors.indigo[800],
                    foreground: colors.indigo[200]
                },
                "surface-1": {
                    DEFAULT: colors.indigo[700],
                    foreground: colors.indigo[100]
                }
            },
            single: {
                foreground: colors.indigo[50],
                border: {
                    DEFAULT: colors.indigo[800]
                },
                input: {
                    DEFAULT: colors.indigo[950],
                    hover: colors.indigo[900]
                },
                ring: `color-mix(in srgb, ${colors.fuchsia[400]} 25%, transparent)`
            }
        }
    }
};
const theme22 = {
    light: light19,
    dark: dark19
};
const theme23 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.olive[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.olive[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.olive[50],
                        foreground: colors.olive[900]
                    },
                    muted: {
                        DEFAULT: colors.olive[100],
                        foreground: colors.olive[500]
                    },
                    surface: {
                        DEFAULT: colors.olive[200],
                        foreground: colors.olive[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.olive[300],
                        foreground: colors.olive[900]
                    }
                },
                single: {
                    foreground: colors.olive[900],
                    border: {
                        DEFAULT: colors.olive[300]
                    },
                    input: {
                        DEFAULT: colors.olive[50],
                        hover: colors.olive[100]
                    },
                    ring: `color-mix(in srgb, ${colors.olive[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.olive[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.olive[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.olive[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.olive[900],
                        foreground: colors.olive[50]
                    },
                    muted: {
                        DEFAULT: colors.olive[800],
                        foreground: colors.olive[400]
                    },
                    surface: {
                        DEFAULT: colors.olive[700],
                        foreground: colors.olive[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.olive[600],
                        foreground: colors.olive[200]
                    }
                },
                single: {
                    foreground: colors.olive[50],
                    border: {
                        DEFAULT: colors.olive[700]
                    },
                    input: {
                        DEFAULT: colors.olive[900],
                        hover: colors.olive[800]
                    },
                    ring: `color-mix(in srgb, ${colors.olive[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light20 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.olive[700],
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
                    DEFAULT: colors.olive[50],
                    foreground: colors.olive[900]
                },
                muted: {
                    DEFAULT: colors.olive[100],
                    foreground: colors.olive[500]
                },
                surface: {
                    DEFAULT: colors.olive[200],
                    foreground: colors.olive[900]
                },
                "surface-1": {
                    DEFAULT: colors.olive[300],
                    foreground: colors.olive[900]
                }
            },
            single: {
                foreground: colors.olive[900],
                border: {
                    DEFAULT: colors.olive[300]
                },
                input: {
                    DEFAULT: colors.olive[50],
                    hover: colors.olive[100]
                },
                ring: `color-mix(in srgb, ${colors.olive[700]} 20%, transparent)`
            }
        }
    }
};
const dark20 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.olive[400],
                foreground: colors.black
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
                    DEFAULT: colors.olive[900],
                    foreground: colors.olive[50]
                },
                muted: {
                    DEFAULT: colors.olive[800],
                    foreground: colors.olive[400]
                },
                surface: {
                    DEFAULT: colors.olive[700],
                    foreground: colors.olive[300]
                },
                "surface-1": {
                    DEFAULT: colors.olive[600],
                    foreground: colors.olive[200]
                }
            },
            single: {
                foreground: colors.olive[50],
                border: {
                    DEFAULT: colors.olive[600]
                },
                input: {
                    DEFAULT: colors.olive[900],
                    hover: colors.olive[800]
                },
                ring: `color-mix(in srgb, ${colors.olive[400]} 25%, transparent)`
            }
        }
    }
};
const theme24 = {
    light: light20,
    dark: dark20
};
const light21 = {
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
const dark21 = {
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
const theme25 = {
    light: light21,
    dark: dark21
};
const light22 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.teal[600],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.fuchsia[500],
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.teal[50],
                    foreground: colors.teal[950]
                },
                muted: {
                    DEFAULT: colors.teal[100],
                    foreground: colors.teal[700]
                },
                surface: {
                    DEFAULT: colors.teal[200],
                    foreground: colors.teal[950]
                },
                "surface-1": {
                    DEFAULT: colors.teal[300],
                    foreground: colors.teal[950]
                }
            },
            single: {
                foreground: colors.teal[950],
                border: {
                    DEFAULT: colors.teal[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.teal[50]
                },
                ring: `color-mix(in srgb, ${colors.teal[600]} 20%, transparent)`
            }
        }
    }
};
const dark22 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.teal[500],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.fuchsia[400],
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
                    DEFAULT: colors.teal[950],
                    foreground: colors.teal[50]
                },
                muted: {
                    DEFAULT: colors.teal[900],
                    foreground: colors.teal[400]
                },
                surface: {
                    DEFAULT: colors.teal[800],
                    foreground: colors.teal[200]
                },
                "surface-1": {
                    DEFAULT: colors.teal[700],
                    foreground: colors.teal[100]
                }
            },
            single: {
                foreground: colors.teal[50],
                border: {
                    DEFAULT: colors.teal[800]
                },
                input: {
                    DEFAULT: colors.teal[950],
                    hover: colors.teal[900]
                },
                ring: `color-mix(in srgb, ${colors.teal[400]} 25%, transparent)`
            }
        }
    }
};
const theme26 = {
    light: light22,
    dark: dark22
};
const light23 = {
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
const dark23 = {
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
const theme27 = {
    light: light23,
    dark: dark23
};
const light24 = {
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
const dark24 = {
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
const theme28 = {
    light: light24,
    dark: dark24
};
const light25 = {
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
const dark25 = {
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
const theme29 = {
    light: light25,
    dark: dark25
};
const light26 = {
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
const dark26 = {
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
const theme30 = {
    light: light26,
    dark: dark26
};
const light27 = {
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
const dark27 = {
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
const theme31 = {
    light: light27,
    dark: dark27
};
const light28 = {
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
const dark28 = {
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
const theme32 = {
    light: light28,
    dark: dark28
};
const light29 = {
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
const dark29 = {
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
const theme33 = {
    light: light29,
    dark: dark29
};
const light30 = {
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
const dark30 = {
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
const theme34 = {
    light: light30,
    dark: dark30
};
const light31 = {
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
const dark31 = {
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
const theme35 = {
    light: light31,
    dark: dark31
};
const light32 = {
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
const dark32 = {
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
const theme36 = {
    light: light32,
    dark: dark32
};
const light33 = {
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
const dark33 = {
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
const theme37 = {
    light: light33,
    dark: dark33
};
const light34 = {
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
const dark34 = {
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
const theme38 = {
    light: light34,
    dark: dark34
};
const theme39 = {
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
const light35 = {
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
const dark35 = {
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
const theme40 = {
    light: light35,
    dark: dark35
};
const theme41 = {
    light: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.taupe[800],
                    foreground: colors.white
                },
                accent: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.taupe[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.taupe[50],
                        foreground: colors.taupe[900]
                    },
                    muted: {
                        DEFAULT: colors.taupe[100],
                        foreground: colors.taupe[500]
                    },
                    surface: {
                        DEFAULT: colors.taupe[200],
                        foreground: colors.taupe[900]
                    },
                    "surface-1": {
                        DEFAULT: colors.taupe[300],
                        foreground: colors.taupe[900]
                    }
                },
                single: {
                    foreground: colors.taupe[900],
                    border: {
                        DEFAULT: colors.taupe[300]
                    },
                    input: {
                        DEFAULT: colors.taupe[50],
                        hover: colors.taupe[100]
                    },
                    ring: `color-mix(in srgb, ${colors.taupe[800]} 20%, transparent)`
                }
            }
        }
    },
    dark: {
        colors: {
            intent: {
                primary: {
                    DEFAULT: colors.taupe[200],
                    foreground: colors.black
                },
                accent: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                },
                destructive: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                },
                warning: {
                    DEFAULT: colors.taupe[400],
                    foreground: colors.black
                },
                success: {
                    DEFAULT: colors.taupe[500],
                    foreground: colors.white
                }
            },
            role: {
                paired: {
                    background: {
                        DEFAULT: colors.taupe[900],
                        foreground: colors.taupe[50]
                    },
                    muted: {
                        DEFAULT: colors.taupe[800],
                        foreground: colors.taupe[400]
                    },
                    surface: {
                        DEFAULT: colors.taupe[700],
                        foreground: colors.taupe[300]
                    },
                    "surface-1": {
                        DEFAULT: colors.taupe[600],
                        foreground: colors.taupe[200]
                    }
                },
                single: {
                    foreground: colors.taupe[50],
                    border: {
                        DEFAULT: colors.taupe[700]
                    },
                    input: {
                        DEFAULT: colors.taupe[900],
                        hover: colors.taupe[800]
                    },
                    ring: `color-mix(in srgb, ${colors.taupe[200]} 25%, transparent)`
                }
            }
        }
    }
};
const light36 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.taupe[700],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.olive[600],
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
                DEFAULT: colors.olive[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.taupe[50],
                    foreground: colors.taupe[900]
                },
                muted: {
                    DEFAULT: colors.taupe[100],
                    foreground: colors.taupe[500]
                },
                surface: {
                    DEFAULT: colors.taupe[200],
                    foreground: colors.taupe[900]
                },
                "surface-1": {
                    DEFAULT: colors.taupe[300],
                    foreground: colors.taupe[900]
                }
            },
            single: {
                foreground: colors.taupe[900],
                border: {
                    DEFAULT: colors.taupe[300]
                },
                input: {
                    DEFAULT: colors.taupe[50],
                    hover: colors.taupe[100]
                },
                ring: `color-mix(in srgb, ${colors.taupe[700]} 20%, transparent)`
            }
        }
    }
};
const dark36 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.taupe[300],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.olive[400],
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
                DEFAULT: colors.olive[400],
                foreground: colors.black
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.taupe[900],
                    foreground: colors.taupe[50]
                },
                muted: {
                    DEFAULT: colors.taupe[800],
                    foreground: colors.taupe[400]
                },
                surface: {
                    DEFAULT: colors.taupe[700],
                    foreground: colors.taupe[300]
                },
                "surface-1": {
                    DEFAULT: colors.taupe[600],
                    foreground: colors.taupe[200]
                }
            },
            single: {
                foreground: colors.taupe[50],
                border: {
                    DEFAULT: colors.taupe[700]
                },
                input: {
                    DEFAULT: colors.taupe[900],
                    hover: colors.taupe[800]
                },
                ring: `color-mix(in srgb, ${colors.taupe[300]} 25%, transparent)`
            }
        }
    }
};
const theme42 = {
    light: light36,
    dark: dark36
};
const light37 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[600],
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
                    DEFAULT: colors.taupe[50],
                    foreground: colors.taupe[900]
                },
                muted: {
                    DEFAULT: colors.taupe[100],
                    foreground: colors.taupe[500]
                },
                surface: {
                    DEFAULT: colors.taupe[200],
                    foreground: colors.taupe[900]
                },
                "surface-1": {
                    DEFAULT: colors.taupe[300],
                    foreground: colors.taupe[900]
                }
            },
            single: {
                foreground: colors.taupe[900],
                border: {
                    DEFAULT: colors.taupe[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.taupe[50]
                },
                ring: `color-mix(in srgb, ${colors.rose[600]} 20%, transparent)`
            }
        }
    }
};
const dark37 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[400],
                foreground: colors.white
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
                    DEFAULT: colors.taupe[900],
                    foreground: colors.taupe[50]
                },
                muted: {
                    DEFAULT: colors.taupe[800],
                    foreground: colors.taupe[400]
                },
                surface: {
                    DEFAULT: colors.taupe[700],
                    foreground: colors.taupe[300]
                },
                "surface-1": {
                    DEFAULT: colors.taupe[600],
                    foreground: colors.taupe[200]
                }
            },
            single: {
                foreground: colors.taupe[50],
                border: {
                    DEFAULT: colors.taupe[700]
                },
                input: {
                    DEFAULT: colors.taupe[900],
                    hover: colors.taupe[800]
                },
                ring: `color-mix(in srgb, ${colors.rose[400]} 25%, transparent)`
            }
        }
    }
};
const theme43 = {
    light: light37,
    dark: dark37
};
const light38 = {
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
const dark38 = {
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
const theme44 = {
    light: light38,
    dark: dark38
};
const light39 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[900],
                foreground: colors.white
            },
            accent: {
                DEFAULT: colors.amber[400],
                foreground: colors.black
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
                DEFAULT: colors.emerald[600],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.rose[50],
                    foreground: colors.rose[950]
                },
                muted: {
                    DEFAULT: colors.rose[100],
                    foreground: colors.rose[700]
                },
                surface: {
                    DEFAULT: colors.rose[200],
                    foreground: colors.rose[950]
                },
                "surface-1": {
                    DEFAULT: colors.rose[300],
                    foreground: colors.rose[950]
                }
            },
            single: {
                foreground: colors.rose[950],
                border: {
                    DEFAULT: colors.rose[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: colors.rose[50]
                },
                ring: `color-mix(in srgb, ${colors.rose[900]} 20%, transparent)`
            }
        }
    }
};
const dark39 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: colors.rose[400],
                foreground: colors.black
            },
            accent: {
                DEFAULT: colors.amber[400],
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
                DEFAULT: colors.emerald[500],
                foreground: colors.white
            }
        },
        role: {
            paired: {
                background: {
                    DEFAULT: colors.rose[950],
                    foreground: colors.rose[50]
                },
                muted: {
                    DEFAULT: colors.rose[900],
                    foreground: colors.rose[300]
                },
                surface: {
                    DEFAULT: colors.rose[800],
                    foreground: colors.rose[200]
                },
                "surface-1": {
                    DEFAULT: colors.rose[700],
                    foreground: colors.rose[100]
                }
            },
            single: {
                foreground: colors.rose[50],
                border: {
                    DEFAULT: colors.rose[800]
                },
                input: {
                    DEFAULT: colors.rose[950],
                    hover: colors.rose[900]
                },
                ring: `color-mix(in srgb, ${colors.rose[400]} 25%, transparent)`
            }
        }
    }
};
const theme45 = {
    light: light39,
    dark: dark39
};
const light40 = {
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
const dark40 = {
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
const theme46 = {
    light: light40,
    dark: dark40
};
const light41 = {
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
const dark41 = {
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
const theme47 = {
    light: light41,
    dark: dark41
};
const pink1 = "#f6329b";
const mint1 = "#5deab5";
const rind = {
    50: "#f2faf6",
    100: "#e4f2ea",
    200: "#d2e7dc",
    300: "#bedacb",
    500: "#5f7a6c",
    900: "#14281e"
};
const flesh = {
    50: "#fbf3f7",
    200: "#e7d4dd",
    300: "#d4bac7",
    400: "#b394a4",
    600: "#5a384c",
    700: "#482b3d",
    800: "#36202e",
    900: "#251521"
};
const light42 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: pink1,
                foreground: colors.white
            },
            accent: {
                DEFAULT: mint1,
                foreground: colors.emerald[950]
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
                    DEFAULT: rind[50],
                    foreground: rind[900]
                },
                muted: {
                    DEFAULT: rind[100],
                    foreground: rind[500]
                },
                surface: {
                    DEFAULT: rind[200],
                    foreground: rind[900]
                },
                "surface-1": {
                    DEFAULT: rind[300],
                    foreground: rind[900]
                }
            },
            single: {
                foreground: rind[900],
                border: {
                    DEFAULT: rind[300]
                },
                input: {
                    DEFAULT: colors.white,
                    hover: rind[50]
                },
                ring: `color-mix(in srgb, ${pink1} 20%, transparent)`
            }
        }
    }
};
const dark42 = {
    colors: {
        intent: {
            primary: {
                DEFAULT: pink1,
                foreground: colors.white
            },
            accent: {
                DEFAULT: mint1,
                foreground: colors.emerald[950]
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
                    DEFAULT: flesh[900],
                    foreground: flesh[50]
                },
                muted: {
                    DEFAULT: flesh[800],
                    foreground: flesh[400]
                },
                surface: {
                    DEFAULT: flesh[700],
                    foreground: flesh[300]
                },
                "surface-1": {
                    DEFAULT: flesh[600],
                    foreground: flesh[200]
                }
            },
            single: {
                foreground: flesh[50],
                border: {
                    DEFAULT: flesh[700]
                },
                input: {
                    DEFAULT: flesh[900],
                    hover: flesh[800]
                },
                ring: `color-mix(in srgb, ${pink1} 25%, transparent)`
            }
        }
    }
};
const theme48 = {
    light: light42,
    dark: dark42
};
const theme49 = {
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
const themeNames = [
    "amber-olive-safari",
    "blue-orange",
    "cyan-red",
    "cyan-slate",
    "disco",
    "electric-lemonade",
    "emerald-amber-forest",
    "emerald-pink",
    "fuchsia-emerald",
    "gray",
    "hummingbird",
    "indigo-amber",
    "lime-fuchsia-neon",
    "mauve",
    "mauve-lime-electric",
    "mauve-teal",
    "mist",
    "mist-indigo-fjord",
    "mist-violet-aurora",
    "monokai-cyan",
    "monokai-green",
    "monokai-pink",
    "nebula",
    "olive",
    "olive-amber-safari",
    "orange-pink-sunset",
    "peacock",
    "pink-emerald",
    "pink-teal",
    "purple-yellow",
    "rainbow",
    "red-blue",
    "red-cyan",
    "red-sky",
    "red-sky-slate",
    "rose-teal",
    "sky-amber",
    "slate-cyan",
    "slate-teal-ocean",
    "stone",
    "stone-orange-earth",
    "taupe",
    "taupe-olive-clay",
    "taupe-rose-blush",
    "teal-rose",
    "velvet",
    "violet-lime",
    "violet-rose-dusk",
    "watermelon",
    "zinc"
];
const bundledThemes = {
    amberOliveSafari: theme,
    blueOrange: theme1,
    cyanRed: theme2,
    cyanSlate: theme3,
    disco: theme4,
    electricLemonade: theme5,
    emeraldAmberForest: theme6,
    emeraldPink: theme7,
    fuchsiaEmerald: theme8,
    gray: theme9,
    hummingbird: theme10,
    indigoAmber: theme11,
    limeFuchsiaNeon: theme12,
    mauve: theme13,
    mauveLimeElectric: theme14,
    mauveTeal: theme15,
    mist: theme16,
    mistIndigoFjord: theme17,
    mistVioletAurora: theme18,
    monokaiCyan: theme19,
    monokaiGreen: theme20,
    monokaiPink: theme21,
    nebula: theme22,
    olive: theme23,
    oliveAmberSafari: theme24,
    orangePinkSunset: theme25,
    peacock: theme26,
    pinkEmerald: theme27,
    pinkTeal: theme28,
    purpleYellow: theme29,
    rainbow: theme30,
    redBlue: theme31,
    redCyan: theme32,
    redSky: theme33,
    redSkySlate: theme34,
    roseTeal: theme35,
    skyAmber: theme36,
    slateCyan: theme37,
    slateTealOcean: theme38,
    stone: theme39,
    stoneOrangeEarth: theme40,
    taupe: theme41,
    taupeOliveClay: theme42,
    taupeRoseBlush: theme43,
    tealRose: theme44,
    velvet: theme45,
    violetLime: theme46,
    violetRoseDusk: theme47,
    watermelon: theme48,
    zinc: theme49
};
const bundledThemeNames = Object.keys(bundledThemes);
function getBundledTheme(name) {
    return bundledThemes[name];
}
const mod = {
    amberOliveSafari: theme,
    blueOrange: theme1,
    cyanRed: theme2,
    cyanSlate: theme3,
    disco: theme4,
    electricLemonade: theme5,
    emeraldAmberForest: theme6,
    emeraldPink: theme7,
    fuchsiaEmerald: theme8,
    gray: theme9,
    hummingbird: theme10,
    indigoAmber: theme11,
    limeFuchsiaNeon: theme12,
    mauve: theme13,
    mauveLimeElectric: theme14,
    mauveTeal: theme15,
    mist: theme16,
    mistIndigoFjord: theme17,
    mistVioletAurora: theme18,
    monokaiCyan: theme19,
    monokaiGreen: theme20,
    monokaiPink: theme21,
    nebula: theme22,
    olive: theme23,
    oliveAmberSafari: theme24,
    orangePinkSunset: theme25,
    peacock: theme26,
    pinkEmerald: theme27,
    pinkTeal: theme28,
    purpleYellow: theme29,
    rainbow: theme30,
    redBlue: theme31,
    redCyan: theme32,
    redSky: theme33,
    redSkySlate: theme34,
    roseTeal: theme35,
    skyAmber: theme36,
    slateCyan: theme37,
    slateTealOcean: theme38,
    stone: theme39,
    stoneOrangeEarth: theme40,
    taupe: theme41,
    taupeOliveClay: theme42,
    taupeRoseBlush: theme43,
    tealRose: theme44,
    velvet: theme45,
    violetLime: theme46,
    violetRoseDusk: theme47,
    watermelon: theme48,
    zinc: theme49,
    themeNames: themeNames,
    bundledThemes: bundledThemes,
    bundledThemeNames: bundledThemeNames,
    getBundledTheme: getBundledTheme
};
function normalizePrefix(prefix) {
    if (prefix === "") return "";
    return prefix.endsWith("-") ? prefix : prefix + "-";
}
function isSingleColorObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) && "DEFAULT" in value;
}
function deriveColorMixStates(cssVarRef, strategy) {
    const target = strategy.kind === "contrast" ? strategy.mode === "light" ? "black" : "white" : strategy.ref;
    return {
        hover: `color-mix(in oklab, ${cssVarRef}, ${target} 10%)`,
        active: `color-mix(in oklab, ${cssVarRef}, ${target} 20%)`
    };
}
function fillPairStates(pair, prefix, key, strategy) {
    if (pair.hover !== undefined && pair.active !== undefined) return pair;
    const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, strategy);
    return {
        ...pair,
        hover: pair.hover ?? derived.hover,
        active: pair.active ?? derived.active
    };
}
function fillColorValueStates(color, prefix, key, strategy) {
    if (color.hover !== undefined && color.active !== undefined) return color;
    const derived = deriveColorMixStates(`var(--${prefix}color-${key})`, strategy);
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
    tokens[`${prefix}color-${key}-foreground-hover`] = pair.foregroundHover ?? pair.foreground;
    tokens[`${prefix}color-${key}-foreground-active`] = pair.foregroundActive ?? pair.foreground;
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
function generateCssTokens(schema, prefix, options = {}) {
    const opts = typeof options === "string" ? {
        mode: options
    } : options;
    const mode = opts.mode ?? "light";
    const deriveStates = opts.deriveStates ?? true;
    const surfaceContrast = opts.surfaceForegroundContrast ?? 50;
    const p = normalizePrefix(prefix);
    const tokens = {};
    const intentStrategy = {
        kind: "contrast",
        mode
    };
    for (const [key, pair] of Object.entries(schema.colors.intent)){
        const filled = deriveStates ? fillPairStates(pair, p, key, intentStrategy) : pair;
        generatePairedColorTokens(tokens, key, filled, p);
    }
    const contrastMix = mode === "light" ? "black" : "white";
    for (const key of Object.keys(schema.colors.intent)){
        tokens[`${p}color-surface-${key}`] = `color-mix(in srgb, var(--${p}color-${key}) 15%, var(--${p}color-background))`;
        tokens[`${p}color-surface-${key}-foreground`] = `color-mix(in srgb, var(--${p}color-${key}), ${contrastMix} ${surfaceContrast}%)`;
        tokens[`${p}color-surface-${key}-border`] = `color-mix(in srgb, var(--${p}color-${key}) 30%, var(--${p}color-background))`;
    }
    const roleStrategy = {
        kind: "foreground",
        ref: `var(--${p}color-foreground)`
    };
    for (const [key, pair] of Object.entries(schema.colors.role.paired)){
        const filled = key === "background" || !deriveStates ? pair : fillPairStates(pair, p, key, roleStrategy);
        generatePairedColorTokens(tokens, key, filled, p);
    }
    for (const [key, color] of Object.entries(schema.colors.role.single)){
        if (isSingleColorObject(color) && deriveStates) {
            generateSingleColorTokens(tokens, key, fillColorValueStates(color, p, key, roleStrategy), p);
        } else {
            generateSingleColorTokens(tokens, key, color, p);
        }
    }
    return tokens;
}
function getBaseColor(key) {
    const match = key.match(/color-([a-z]+)/);
    return match ? match[1] : key;
}
function toCssString(tokens, selector = ":root") {
    const keys = Object.keys(tokens);
    if (keys.length === 0) return `${selector} {\n}\n`;
    const maxLen = Math.max(...keys.map((k)=>`--${k}`.length));
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
    if (name === "black" || name === "white") {
        return {
            family: name,
            shade: null
        };
    }
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
    if (val.active) {
        parts.push(`active: ${colorRef(val.active, hexToName)}`);
    }
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
