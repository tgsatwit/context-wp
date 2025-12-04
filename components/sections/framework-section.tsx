"use client"

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
    currentTab?: number
    onTabChange?: (index: number) => void
}

export function FrameworkSection({
    title,
    subtitle,
    tabs,
    className = "",
    currentTab = 0,
    onTabChange,
}: FrameworkSectionProps) {
    const { ref, isVisible } = useReveal(0.2)

    return (
        <section
            ref={ref}
            className={cn(
                "relative flex w-full md:w-screen shrink-0 snap-start flex-col px-6 py-24 md:items-center md:justify-center md:overflow-y-auto md:overflow-x-hidden md:px-12 md:py-0 lg:px-16",
                className
            )}
        >
            <div className="md:mx-auto w-full max-w-7xl md:h-full md:flex md:flex-col md:justify-center sticky top-0 h-screen md:static md:h-auto flex flex-col justify-center">
                {/* Header */}
                <div
                    className={cn(
                        "mb-8 transition-all duration-700 md:mb-16 shrink-0",
                        isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
                    )}
                >
                    <h2 className="mb-2 font-sans text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground text-balance">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="font-mono text-xs md:text-sm text-foreground/60 md:text-base">/ {subtitle}</p>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid gap-8 md:grid-cols-12 lg:gap-16 items-start grow md:grow-0">
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
                                    onClick={() => onTabChange?.(index)}
                                    className={cn(
                                        "whitespace-nowrap rounded-lg px-4 py-2 md:px-6 md:py-4 text-left text-sm md:text-lg font-medium transition-all duration-300 border-l-2",
                                        currentTab === index
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
                                        currentTab === index
                                            ? "z-10 opacity-100 translate-x-0"
                                            : "z-0 opacity-0 translate-x-8 pointer-events-none"
                                    )}
                                >
                                    <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed text-foreground/80">
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
