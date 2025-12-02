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
                "flex min-h-screen w-screen shrink-0 snap-start flex-col overflow-y-auto px-6 py-24 md:items-center md:justify-center md:overflow-hidden md:px-12 md:py-0 lg:px-16",
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
                        <div className="flex flex-row overflow-x-auto pb-4 md:flex-col md:overflow-visible md:pb-0 gap-2">
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
                        <div className="relative min-h-[400px]">
                            {tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "absolute inset-0 transition-all duration-500",
                                        activeTab === index
                                            ? "visible translate-x-0 opacity-100 relative"
                                            : "invisible translate-x-8 opacity-0 absolute"
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
