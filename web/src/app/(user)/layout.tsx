"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppTopNav } from "@/components/layout/app-top-nav";
import { CanvasFloatingAgent } from "@/app/(user)/canvas/components/canvas-floating-agent";

export default function UserLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
            <AppTopNav />
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
            {!isHome ? <CanvasFloatingAgent /> : null}
        </div>
    );
}
