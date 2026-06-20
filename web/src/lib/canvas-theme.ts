export type CanvasColorTheme = "light" | "dark";
export type CanvasBackgroundMode = "white-paper" | "kraft" | "dark-canvas" | "blueprint";

export const canvasBackgroundLabels: Record<CanvasBackgroundMode, string> = {
    "white-paper": "白纸",
    kraft: "牛皮纸",
    "dark-canvas": "深色画布",
    blueprint: "蓝图",
};

function paperTextureSvg(color: string, opacity: number) {
    const encoded = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="200" height="200" fill="${color}"/><rect width="200" height="200" filter="url(#n)" opacity="${opacity}"/></svg>`,
    );
    return `url("data:image/svg+xml,${encoded}")`;
}

export function canvasBackgroundStyle(mode: CanvasBackgroundMode) {
    switch (mode) {
        case "white-paper":
            return { background: "#f8f7f4", backgroundImage: paperTextureSvg("#f8f7f4", 0.03) };
        case "kraft":
            return { background: "#d4c4a8", backgroundImage: paperTextureSvg("#d4c4a8", 0.06) };
        case "dark-canvas":
            return { background: "#1a1918", backgroundImage: paperTextureSvg("#1a1918", 0.04) };
        case "blueprint":
            return { background: "#1e3a5f", backgroundImage: paperTextureSvg("#1e3a5f", 0.03) };
    }
}

export const canvasThemes = {
    light: {
        canvas: {
            background: "#f8f7f4",
            dot: "rgba(68,64,60,.28)",
            line: "rgba(68,64,60,.12)",
            selectionStroke: "#1c1917",
            selectionFill: "rgba(28,25,23,.06)",
        },
        node: {
            label: "#57534e",
            fill: "#e7e5df",
            panel: "#fbfaf7",
            stroke: "#d6d3ca",
            activeStroke: "#1c1917",
            placeholder: "#8a8479",
            text: "#292524",
            muted: "#78716c",
            faint: "#a8a29e",
        },
        toolbar: {
            panel: "rgba(251,250,247,.96)",
            border: "#d6d3ca",
            item: "#57534e",
            itemHover: "#e7e5df",
            activeBg: "#e7e5df",
            activeText: "#292524",
        },
    },
    dark: {
        canvas: {
            background: "#1a1918",
            dot: "rgba(245,245,244,.24)",
            line: "rgba(245,245,244,.10)",
            selectionStroke: "#fafaf9",
            selectionFill: "rgba(250,250,249,.10)",
        },
        node: {
            label: "#d6d3d1",
            fill: "#292524",
            panel: "#1f1d1a",
            stroke: "#44403c",
            activeStroke: "#fafaf9",
            placeholder: "#a8a29e",
            text: "#f5f5f4",
            muted: "#d6d3d1",
            faint: "#78716c",
        },
        toolbar: {
            panel: "rgba(31,29,26,.96)",
            border: "#44403c",
            item: "#d6d3d1",
            itemHover: "#292524",
            activeBg: "#3a3631",
            activeText: "#f5f5f4",
        },
    },
} as const;

export type CanvasTheme = (typeof canvasThemes)[CanvasColorTheme];
