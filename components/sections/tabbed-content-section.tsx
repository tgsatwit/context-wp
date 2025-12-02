"use client"

import { useState } from "react"
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
}

export function TabbedContentSection({
    title,
    subtitle,
    imagePosition = "right",
    tabs,
    className = "",
}: TabbedContentSectionProps) {
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
                        "mb-8 transition-all duration-700 md:mb-12",
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
                                    activeTab === index ? "opacity-100 z-10" : "opacity-0 z-0"
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
                                    onClick={() => setActiveTab(index)}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                                        activeTab === index
                                            ? "bg-foreground text-background"
                                            : "bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-foreground"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="relative min-h-[300px]">
                            {tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "absolute inset-0 transition-all duration-500",
                                        activeTab === index
                                            ? "visible translate-x-0 opacity-100"
                                            : "invisible translate-x-8 opacity-0"
                                    )}
                                >
                                    <div className="prose prose-invert max-w-none text-lg leading-relaxed text-foreground/80">
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
