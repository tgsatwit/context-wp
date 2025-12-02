"use client"

import { useState } from "react"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

interface Tab {
    label: string
    content: React.ReactNode
}

interface FrameworkSectionProps {
    title: string
    subtitle?: string
    tabs: Tab[]
    className?: string
}

export function FrameworkSection({
    title,
    subtitle,
    tabs,
    className = "",
}: FrameworkSectionProps) {
    const { ref, isVisible } = useReveal(0.2)
    const [activeTab, setActiveTab] = useState(0)

    return (
        <section
            ref={ref}
            className={cn(
                "flex min-h-screen w-full md:w-screen shrink-0 snap-start flex-col px-6 py-24 md:items-center md:justify-center md:overflow-y-auto md:overflow-x-hidden md:px-12 md:py-0 lg:px-16",
                className
            )}
        >
            <div className="mx-auto w-full max-w-7xl">
                {/* Header */}
                <div
                    className={cn(
                        "mb-8 transition-all duration-700 md:mb-16",
                        isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
                    )}
                >
                    <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="font-mono text-sm text-foreground/60 md:text-base">/ {subtitle}</p>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid gap-8 md:grid-cols-12 lg:gap-16 items-start">
                    {/* Tabs Column - 4/12 */}
                    <div
                        className={cn(
                            "flex flex-col transition-all duration-700 delay-200 md:col-span-4",
                            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                        )}
                    >
                        <div className="flex flex-row flex-wrap pb-4 md:flex-col md:flex-nowrap md:pb-0 gap-2">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "whitespace-nowrap rounded-lg px-6 py-4 text-left text-lg font-medium transition-all duration-300 border-l-2",
                                        activeTab === index
                                            ? "border-foreground bg-white/5 text-foreground"
                                            : "border-transparent text-foreground/60 hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Column - 8/12 */}
                    <div
                        className={cn(
                            "flex flex-col transition-all duration-700 delay-300 md:col-span-8",
                            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                        )}
                    >
                        <div className="grid items-start">
                            {tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "col-start-1 row-start-1 transition-all duration-500",
                                        activeTab === index
                                            ? "z-10 opacity-100 translate-x-0 relative"
                                            : "z-0 opacity-0 translate-x-8 pointer-events-none absolute" // Keep absolute for hidden items if we want to avoid them taking up space? 
                                        // Actually, if we want the container to be as tall as the TALLEST item, we keep them all relative (or grid stack).
                                        // If we want it to be as tall as the CURRENT item, we need to hide the others from flow.
                                        // Grid stack does NOT hide from flow, it takes max height.
                                        // To take current height, we can use 'hidden' for inactive, but that kills transition.
                                        // Or we can use the grid stack but ensure inactive ones don't contribute to height? No, grid cell is max of all.
                                        // Wait, if we want smooth transition of height, that's hard with just CSS.
                                        // But 'max height' is probably fine/better than 'clipped'.
                                        // Let's stick with grid stack (max height) for now as it's robust.
                                        // Actually, if one tab is very long and others short, it will leave empty space.
                                        // Maybe we should just use 'display: none' after transition?
                                        // Or just let it be max height.
                                        // Let's try max height first.
                                    )}
                                >
                                    <div className="prose prose-invert max-w-none text-base leading-relaxed text-foreground/80">
                                        {tab.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
