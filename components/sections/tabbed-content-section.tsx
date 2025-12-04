"use client"

import NextImage from "next/image"
import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

interface Tab {
    label: string
    content: React.ReactNode
    imageSrc: string
    imageAlt: string
}

interface TabbedContentSectionProps {
    title: string
    subtitle?: string
    imagePosition?: "left" | "right"
    tabs: Tab[]
    className?: string
    currentTab?: number
    onTabChange?: (index: number) => void
}

export function TabbedContentSection({
    title,
    subtitle,
    imagePosition = "right",
    tabs,
    className = "",
    currentTab = 0,
    onTabChange,
}: TabbedContentSectionProps) {
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
                        "mb-8 transition-all duration-700 md:mb-12 shrink-0",
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
                    {/* Image Column - Reduced width (5/12) */}
                    <div
                        className={cn(
                            "relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-700 delay-200 md:col-span-5",
                            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                            imagePosition === "left" ? "md:order-1" : "md:order-2"
                        )}
                    >
                        {tabs.map((tab, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "absolute inset-0 transition-opacity duration-500",
                                    currentTab === index ? "opacity-100 z-10" : "opacity-0 z-0"
                                )}
                            >
                                {tab.imageSrc.startsWith("/") ? (
                                    <NextImage
                                        src={tab.imageSrc}
                                        alt={tab.imageAlt}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className={cn("absolute inset-0", tab.imageSrc)} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Text/Tabs Column - Increased width (7/12) */}
                    <div
                        className={cn(
                            "flex flex-col transition-all duration-700 delay-300 md:col-span-7",
                            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                            imagePosition === "left" ? "md:order-2" : "md:order-1"
                        )}
                    >
                        {/* Tab Navigation */}
                        <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => onTabChange?.(index)}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-300",
                                        currentTab === index
                                            ? "bg-foreground text-background"
                                            : "bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
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
