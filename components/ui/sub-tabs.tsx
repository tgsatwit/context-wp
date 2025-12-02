"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SubTab {
    label: string
    content: React.ReactNode
}

interface SubTabsProps {
    tabs: SubTab[]
    className?: string
}

export function SubTabs({ tabs, className }: SubTabsProps) {
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div className={cn("flex flex-col space-y-6", className)}>
            {/* Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                            activeTab === index
                                ? "bg-white/10 text-foreground"
                                : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="relative min-h-[200px]">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={cn(
                            "transition-all duration-500",
                            activeTab === index
                                ? "visible opacity-100 relative"
                                : "invisible opacity-0 absolute inset-0"
                        )}
                    >
                        <div className="prose prose-invert max-w-none text-base leading-relaxed text-foreground/80">
                            {tab.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
