"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

interface MobileNavProps {
    sections: string[]
    currentSection: number
    onSectionSelect: (index: number) => void
}

export function MobileNav({ sections, currentSection, onSectionSelect }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 bg-background/80 backdrop-blur-md transition-opacity hover:bg-foreground/10"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5 text-foreground" />
            </button>

            {/* Full Screen Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] flex flex-col bg-background transition-all duration-500 ease-in-out",
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                )}
            >
                {/* Header with Title and Close Button */}
                <div className="flex items-start justify-between p-6">
                    <h1 className="max-w-[80%] font-serif text-xl leading-tight text-foreground">
                        Show me the context, and I’ll show you the output.
                    </h1>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/20 bg-background/80 transition-colors hover:bg-foreground/10"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5 text-foreground" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
                    {sections.map((section, index) => (
                        <button
                            key={section}
                            onClick={() => {
                                onSectionSelect(index)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "text-xl font-light tracking-tight transition-colors",
                                currentSection === index
                                    ? "text-foreground"
                                    : "text-foreground/60 hover:text-foreground"
                            )}
                        >
                            {section}
                        </button>
                    ))}
                </nav>

                {/* Footer / Branding */}
                <div className="p-8 text-center">
                    <p className="font-mono text-xs text-foreground/40">The Context-First Organisation</p>
                </div>
            </div>
        </div>
    )
}
