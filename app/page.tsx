"use client"

import { Shader, Swirl } from "shaders/react"

import { GrainOverlay } from "@/components/grain-overlay"
import { ContentSection } from "@/components/sections/content-section"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number | undefined>(undefined)

  const sections = [
    "Home",
    "The Problem",
    "Structural Reality",
    "Why AI Changes Everything",
    "The Solution",
    "Agent Gateway",
    "Business Case",
    "Start"
  ]

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < sections.length - 1) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection, sections.length])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= sections.length - 1) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection, sections.length])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">

      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#000000"
            colorB="#0066ff"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />

        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
      >
        <button
          onClick={() => scrollToSection(0)}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25">
            <span className="font-sans text-xl font-bold text-foreground">C</span>
          </div>
          <span className="font-sans text-xl font-semibold tracking-tight text-foreground">Context</span>
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {sections.map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative font-sans text-sm font-medium transition-colors ${currentSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                  }`}
              />
            </button>
          ))}
        </div>

        <MagneticButton variant="secondary" onClick={() => scrollToSection(sections.length - 1)}>
          Get Started
        </MagneticButton>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">The Context-First Organisation</p>
            </div>
            <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl">
              <span className="text-balance">
                Show me the context,
                <br />
                and I’ll show you the output.
              </span>
            </h1>
            <p className="mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
              <span className="text-pretty">
                Why AI demands we rethink how we work. The bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well.
              </span>
            </p>
            <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center">
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1)}>
                Read the Paper
              </MagneticButton>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
              <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <ContentSection title="The Context Flow Problem" subtitle="Executive Summary">
          <div>
            <p className="mb-4">
              “Too many meetings. Too many emails.” How many times have you heard this?
            </p>
            <p className="mb-4">
              We have a context flow problem. Critical knowledge is trapped in people’s heads, accessible only through endless meetings and emails. Unsolved, this could be a huge constraint on AI adoption and our ability to leverage AI to help us deliver value.
            </p>
            <p>
              Why? The bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well. Quality context availability, not execution capability, tool availability or people’s ability to prompt, is now the limiting factor for AI value.
            </p>
          </div>
          <div>
            <p className="mb-4">
              The Context-First Framework is built on producing curated <strong>Context Artefacts</strong> by combining a structured approach to curating organisational context and changing our patterns of work to produce it. It provides a practical pathway to solve the context flow problem, unlock experts, and build an organisation that learns and adapts at the speed of change.
            </p>
            <p>
              The ROI isn’t just faster execution; it’s dramatically reduced rework, earlier issue detection, and genuine AI adoption by our people.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="Structural Reality" subtitle="Why The Experience Differs">
          <div>
            <p className="mb-4">
              If you observe an organisation as a network graph, you begin to understand why the experience of work feels so different depending on where you sit.
            </p>
            <p className="mb-4">
              Consider the experience of a CEO compared to a delivery lead. It is not uncommon to hear of senior leaders who send surprisingly few emails a day. To a team member drowning in notifications, this reality can feel impossible or disconnected. However, this is rarely about personal discipline alone; it is a structural function of the organisational graph.
            </p>
            <p>
              At the top, context flows down as strategic direction. Leaders can often dictate the terms by which they engage.
            </p>
          </div>
          <div>
            <p className="mb-4">
              But move down to the teams that deliver, and the structural reality shifts. These teams exist in a dense web of dependencies: coordinating with other teams, clarifying requirements, validating with risk and compliance. They cannot simply "opt out"; they must respond to the coordination demands their role creates.
            </p>
            <p>
              The critical knowledge isn’t in a system; it’s in people’s heads. Bottlenecks form around key people because that’s where the context is trapped. Delivery can only move as fast as their capacity allows.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="Why AI Changes Everything" subtitle="The Adoption Paradox">
          <div>
            <p className="mb-4">
              We are investing in AI tools to help us accelerate. But the bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well.
            </p>
            <p className="mb-4">
              Think about how we actually spend time today. Writing the code, creating the analysis, drafting the document often takes less time than gathering the context needed to do it right. We spend hours in meetings clarifying requirements, days waiting for answers about constraints.
            </p>
            <p>
              If AI can’t access the context it needs, it will produce faster wrong answers. Context availability, not execution capability, becomes the limiting factor for AI value.
            </p>
          </div>
          <div>
            <p className="mb-4">
              Much of the excitement in AI adoption has centered on “finding use cases”. This energy is positive, but these tools are not magic; they are reasoning engines that require fuel—context—to operate effectively.
            </p>
            <p>
              The path to transformative AI isn’t just top-down use case hunting. It’s bottom-up enablement: give people the context infrastructure so AI becomes genuinely useful in their own work.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="The Solution" subtitle="Context-First Framework">
          <div>
            <p className="mb-4">
              We must change our approach. Instead of using collaboration to find context, we need to create context to enable collaboration. This new approach is built on producing, managing, and leveraging <strong>Context Artefacts</strong>.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-foreground">1. Context Cascade</h3>
            <p className="mb-4">
              Inspired by cascading style sheets, Context Cascade establishes a hierarchy of shared context that flows throughout the organisation. Each level inherits context from the levels higher.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-foreground">2. Context Core</h3>
            <p>
              The operational hub: a team’s knowledge hub for its Context Artefacts, serving as a living, queryable repository.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">3. Changing Our Patterns of Work</h3>
            <p className="mb-4">
              The shift from “docs-last” to context-first execution.
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>
                <strong>Pause:</strong> Take a short, focused pause before jumping into building. Use this time to write down the “why,” the “what,” and the guiding principles into an initial Context Artefact.
              </li>
              <li>
                <strong>Prime:</strong> Immediately publish the seed Context Artefact to all stakeholders and systems. So all that are involved get this context from day zero.
              </li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection title="Agent Gateway" subtitle="Designing for Context">
          <div>
            <p className="mb-4">
              We need to think about agent design as a mechanism to solve the context flow problem itself. We should design agents that don't just consume context to do a job, but actively help users <strong>build context</strong> as part of the process.
            </p>
            <p className="mb-4">
              Currently, a request often bounces back and forth between a requester and a specialist multiple times. By placing an agent—empowered with Context Artefacts—between these nodes, we absorb these preliminary iterations.
            </p>
          </div>
          <div>
            <p className="mb-4">
              <strong>For the Non-Specialist:</strong> The agent acts as a Gatekeeper and Coach. It asks specific questions and flags obvious gaps, helping the user curate a complete "context packet".
            </p>
            <p>
              <strong>For the Specialist:</strong> They use the agent as a Synthesizer and Quality Checker. This ensures that the human expert operates at the top of their license—analysing and deciding—rather than spending their time collecting basic information.
            </p>
          </div>
        </ContentSection>

        <ContentSection title="Business Case" subtitle="Why Context is Worth the Investment">
          <div>
            <p className="mb-4">
              Upgrading your AI model might net you a 10-20% gain in output quality. In contrast, giving that same AI high-quality, relevant context can yield performance improvements in the hundreds of percent.
            </p>
            <table className="w-full text-left text-sm mt-4 border-collapse">
              <thead>
                <tr className="border-b border-foreground/20">
                  <th className="py-2">Approach</th>
                  <th className="py-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-foreground/10">
                  <td className="py-2 pr-4">Waterfall</td>
                  <td className="py-2 text-red-400">Negative ROI</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-2 pr-4">Agile</td>
                  <td className="py-2">~100% ROI</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Context-First</td>
                  <td className="py-2 text-green-400">Exponential ROI</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Expected Benefits</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Eliminating Context-Gathering Overhead:</strong> Teams start work with clarity rather than assumptions.</li>
              <li><strong>Cycle Time Improvements:</strong> Validation activities happen in parallel.</li>
              <li><strong>Early Issue Detection:</strong> Problems caught before significant work is invested.</li>
              <li><strong>Organisational Learning:</strong> New projects don’t start from zero.</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection title="Start" subtitle="Where and How to Start">
          <div>
            <p className="mb-4">
              The immediate value demonstration is simple: take a strategic document (quarterly priorities, team vision) and include it in your AI prompts. Ask AI to draft something with that context attached. Then try without it.
            </p>
            <p className="mb-4">
              The difference is immediate and visceral. Without context, AI gives you generic corporate-speak. With context, it gives you something aligned, specific, and much closer to what you actually need.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Leverage Context-Dense Moments</h3>
            <p className="mb-4">
              Identify events where strategic thinking is already being shared: annual planning, quarterly planning, town halls. Capture the output as structured, persistent Context Artefacts.
            </p>
            <p>
              The economics have shifted. Context is no longer overhead; it’s infrastructure. It’s the fuel that makes AI transformative.
            </p>
          </div>
        </ContentSection>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}

