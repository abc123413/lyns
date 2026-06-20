"use client";

import { ArrowRight, Bot, ImageIcon, Layers } from "lucide-react";
import { Button } from "antd";

const features = [
    { icon: Layers, title: "无限画布", desc: "在节点间自由连线，组织思路与素材，让创作像思考一样流动。" },
    { icon: ImageIcon, title: "AI 生图", desc: "接入你自己的模型 API，一键生成高质量图片并直接落入画布。" },
    { icon: Bot, title: "对话式创作", desc: "通过悬浮 Agent 用自然语言操作画布，灵感即刻化为画面。" },
];

export default function IndexPage() {
    return (
        <main className="relative h-full overflow-y-auto bg-background text-stone-950 dark:text-stone-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,130,255,.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(168,130,255,.12),transparent_60%)]" />
            <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
                <h1 className="mt-6 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-amber-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
                    灵思
                </h1>
                <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-stone-500 dark:text-stone-400">
                    一张画布，无限可能。用对话驱动 AI 创作，让灵感从生成到推演一气呵成。
                </p>

                <div className="mt-12 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center gap-3 rounded-xl border border-stone-200/60 bg-white/50 px-5 py-6 backdrop-blur dark:border-stone-800/60 dark:bg-stone-900/40">
                            <feature.icon className="size-6 text-violet-500" />
                            <h3 className="text-sm font-semibold">{feature.title}</h3>
                            <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                    <Button type="primary" size="large" href="/image">
                        开始创作 <ArrowRight className="ml-1 inline size-4" />
                    </Button>
                    <Button size="large" href="/canvas">
                        打开画布
                    </Button>
                </div>
            </section>
        </main>
    );
}
