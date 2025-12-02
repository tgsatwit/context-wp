"use client"

import { useReveal } from "@/hooks/use-reveal"
import { ReactNode } from "react"

interface ContentSectionProps {
    title: string
    subtitle?: string
    children: ReactNode
    className?: string
}

export function ContentSection({ title, subtitle, children, className = "" }: ContentSectionProps) {
    const { ref, isVisible } = useReveal(0.2)

    return (
        <section
            ref={ref}
            className={`flex h-screen w-screen shrink-0 snap-start flex-col overflow-y-auto px-6 pt-24 md:items-center md:justify-center md:overflow-hidden md:px-12 md:pt-0 lg:px-16 ${className}`}
        >
            <div className="mx-auto w-full max-w-7xl pb-24 md:pb-0">
                <div
                    className={`mb-8 transition-all duration-700 md:mb-12 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
                        }`}
                >
                    <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="font-mono text-sm text-foreground/60 md:text-base">/ {subtitle}</p>
                    )}
                </div>

                <div
                    className={`prose prose-invert max-w-none transition-all duration-700 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                        }`}
                >
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-16 text-lg leading-relaxed text-foreground/80">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}
