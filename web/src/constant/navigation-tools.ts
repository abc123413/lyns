import { ImagePlus, Maximize2 } from "lucide-react";

export const navigationTools = [
    {
        slug: "canvas",
        label: "画布",
        icon: Maximize2,
    },
    {
        slug: "image",
        label: "生图工作台",
        icon: ImagePlus,
    },
] as const;

export type NavigationToolSlug = (typeof navigationTools)[number]["slug"];
