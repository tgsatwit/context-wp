"use client"

import { Shader, Swirl } from "shaders/react"
import NextImage from "next/image"

import { GrainOverlay } from "@/components/grain-overlay"
import { ContentSection } from "@/components/sections/content-section"
import { TabbedContentSection } from "@/components/sections/tabbed-content-section"
import { FrameworkSection } from "@/components/sections/framework-section"
import { SubTabs } from "@/components/ui/sub-tabs"
import { MagneticButton } from "@/components/magnetic-button"
import { MobileNav } from "@/components/mobile-nav"
import { useRef, useEffect, useState } from "react"

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number | undefined>(undefined)
  const isScrollingRef = useRef(false)

  const sections = [
    "Home",
    "The Problem",
    "Structural Reality",
    "Why AI Changes Everything",
    "Responsibility Shift",
    "The Solution",

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
      // Check if we are on mobile (vertical layout) or desktop (horizontal layout)
      const isMobile = window.innerWidth < 768 // md breakpoint

      if (isMobile) {
        const container = scrollContainerRef.current
        const sectionElement = container.children[index] as HTMLElement
        if (sectionElement) {
          const top = sectionElement.offsetTop
          window.scrollTo({
            top: top, // We might need to scroll the window or the container depending on setup. 
            // In this refactor, the container is the main scroller on desktop, but on mobile we might want window scroll or container scroll.
            // Let's stick to container scroll for consistency if possible, but usually vertical scroll is window.
            // Actually, if we change the container to be vertical flex, we can just scroll the container if it's h-screen overflow-y-auto.
            // BUT, standard mobile behavior is usually window scroll. 
            // Let's try to keep the container as the scroller for now to minimize disruption, just changing direction.
            behavior: "smooth"
          })
          // If we use window scroll, we need to scroll the window.
          // If we use container scroll (h-screen overflow-y-auto), we scroll the container.
          // Let's assume we keep the container as the scrollable element for now.
          container.scrollTo({
            top: sectionElement.offsetTop,
            behavior: "smooth"
          })
        }
      } else {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true
          const sectionWidth = scrollContainerRef.current.offsetWidth
          scrollContainerRef.current.scrollTo({
            left: sectionWidth * index,
            behavior: "smooth",
          })

          setTimeout(() => {
            isScrollingRef.current = false
          }, 700)
        }
      }
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current || isScrollingRef.current) return

      // Only apply custom horizontal scroll logic on desktop
      if (window.innerWidth < 768) return

      const container = scrollContainerRef.current
      const currentSectionElement = container.children[currentSection] as HTMLElement

      if (!currentSectionElement) return

      const isVerticalScrollable = currentSectionElement.scrollHeight > currentSectionElement.clientHeight
      const isAtTop = currentSectionElement.scrollTop <= 0
      const isAtBottom = Math.abs(currentSectionElement.scrollHeight - currentSectionElement.clientHeight - currentSectionElement.scrollTop) < 1

      // If scrolling vertically (more Y than X)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Ignore small movements (trackpad noise)
        if (Math.abs(e.deltaY) < 20) return

        // If scrolling down
        if (e.deltaY > 0) {
          if (isVerticalScrollable && !isAtBottom) {
            // Allow native vertical scroll
            return
          } else if (currentSection < sections.length - 1) {
            // Navigate to next section
            e.preventDefault()
            scrollToSection(currentSection + 1)
          }
        }
        // If scrolling up
        else {
          if (isVerticalScrollable && !isAtTop) {
            // Allow native vertical scroll
            return
          } else if (currentSection > 0) {
            // Navigate to previous section
            e.preventDefault()
            scrollToSection(currentSection - 1)
          }
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
  }, [currentSection, sections.length])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const isMobile = window.innerWidth < 768

        if (isMobile) {
          // Vertical scroll tracking
          // This is a bit complex because sections might have different heights.
          // Simple IntersectionObserver might be better, but let's try basic offset tracking.
          const container = scrollContainerRef.current
          const scrollTop = container.scrollTop
          const containerHeight = container.clientHeight // or window height

          // Find which section is most visible
          let maxVisibility = 0
          let bestSection = currentSection

          Array.from(container.children).forEach((child, index) => {
            const element = child as HTMLElement
            const rect = element.getBoundingClientRect()

            // Calculate intersection with viewport
            const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
            if (visibleHeight > maxVisibility) {
              maxVisibility = visibleHeight
              bestSection = index
            }
          })

          if (bestSection !== currentSection) {
            setCurrentSection(bestSection)
          }

        } else {
          const sectionWidth = scrollContainerRef.current.offsetWidth
          const scrollLeft = scrollContainerRef.current.scrollLeft
          const newSection = Math.round(scrollLeft / sectionWidth)

          if (newSection !== currentSection && newSection >= 0 && newSection <= sections.length - 1) {
            setCurrentSection(newSection)
          }
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Show me the context, and I’ll show you the output.",
    "description": "Why AI demands we rethink how we work. The bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well.",
    "author": {
      "@type": "Person",
      "name": "Tim Gillam"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Context-First Organisation",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    },
    "datePublished": "2025-12-02",
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


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

      <MobileNav
        sections={sections}
        currentSection={currentSection}
        onSectionSelect={scrollToSection}
      />

      <nav
        className={`fixed left-0 right-0 top-0 z-50 hidden items-center justify-center px-6 py-6 transition-opacity duration-700 md:flex md:px-12 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
      >


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


      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden md:flex-row md:snap-x md:snap-mandatory md:overflow-x-auto md:overflow-y-hidden transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-full shrink-0 flex-col justify-center px-6 pb-16 pt-24 md:h-screen md:w-screen md:snap-start md:justify-end md:overflow-hidden md:px-12 md:pb-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
              <p className="font-mono text-xs text-foreground/90">The Context-First Organisation</p>
            </div>
            <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-4xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-6xl lg:text-7xl">
              <span className="text-balance">
                Show me the context,
                <br />
                and I’ll show you the output.
              </span>
            </h1>
            <p className="mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 text-base leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-lg">
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

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500 hidden md:block">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80">Scroll to explore</p>
              <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
              </div>
            </div>
          </div>
        </section>

        <TabbedContentSection
          title="The Context Flow Problem"
          subtitle="Executive Summary"
          imagePosition="right"
          tabs={[
            {
              label: "The Problem",
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visualization of a network bottleneck",
              content: (
                <>
                  <p className="mb-4">
                    “Too many meetings. Too many emails.” How many times have you heard this?
                  </p>
                  <p className="mb-4">
                    We have a context flow problem. Critical knowledge is trapped in people’s heads, accessible only through endless meetings and emails. Unsolved, this could be a huge constraint on AI adoption and our ability to leverage AI to help us deliver value.
                  </p>
                  <p>
                    Why? The bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well. Quality context availability, not execution capability, tool availability or people’s ability to prompt, is now the limiting factor for AI value.
                  </p>
                </>
              ),
            },
            {
              label: "The Solution",
              // TODO: Generate image: context-solution-framework.png
              // Prompt: Abstract 3D visualization of a framework structure. Building blocks of context. Organized, stable, foundational. Glowing blue elements. Dark background. Minimalist. Represents 'The Solution'. 8k resolution.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: The Solution",
              content: (
                <>
                  <p className="mb-4">
                    The Context-First Framework is built on producing curated <strong>Context Artefacts</strong> (think Claude skills, but for organisational context) by combining a structured approach to curating organisational context and changing our patterns of work to produce it.
                  </p>
                  <p>
                    It provides a practical pathway to solve the context flow problem, unlock experts, and build an organisation that learns and adapts at the speed of change.
                  </p>
                </>
              ),
            },
            {
              label: "The ROI",
              // TODO: Generate image: context-roi-graph.png
              // Prompt: Abstract 3D chart showing exponential growth. Glowing blue line rising sharply. Dark background. Minimalist, financial, high tech. Represents ROI. 8k resolution.
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: The ROI",
              content: (
                <p>
                  The ROI isn’t just faster execution; it’s dramatically reduced rework, earlier issue detection, and genuine AI adoption by our people.
                </p>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="Structural Reality"
          subtitle="Why The Experience Differs"
          imagePosition="left"
          tabs={[
            {
              label: "The Hierarchy",
              imageSrc: "/structural-reality.png",
              imageAlt: "Abstract network graph showing organizational complexity",
              content: (
                <>
                  <p className="mb-4">
                    If you observe an organisation as a network graph, you begin to understand why the experience of work feels so different depending on where you sit.
                  </p>
                  <p className="mb-4">
                    Consider the experience of a CEO compared to a delivery lead. It is not uncommon to hear of senior leaders who send surprisingly few emails a day. To a team member drowning in notifications, this reality can feel impossible or disconnected. However, this is rarely about personal discipline alone; it is a structural function of the organisational graph.
                  </p>
                  <p>
                    At the top, context flows down as strategic direction. Leaders can often dictate the terms by which they engage.
                  </p>
                </>
              ),
            },
            {
              label: "The Delivery Trap",
              // TODO: Generate image: delivery-trap-web.png
              // Prompt: Abstract 3D visualization of a tangled web or knot. Chaos, complexity, entrapment. Dark, moody, blue and grey. Represents 'The Delivery Trap'.
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: The Delivery Trap",
              content: (
                <>
                  <p className="mb-4">
                    But move down to the teams that deliver, and the structural reality shifts. These teams exist in a dense web of dependencies: coordinating with other teams, clarifying requirements, validating with risk and compliance.
                  </p>
                  <p className="mb-4">
                    The critical knowledge isn’t in a system; it’s in people’s heads. Bottlenecks form around key people because that’s where the context is trapped. Delivery can only move as fast as their capacity allows.
                  </p>
                  <p className="mb-4">
                    We use meetings and emails as a way to transfer context - but it's incredibly inefficient, the context is often available to those involved at that time.
                  </p>
                  <p className="mb-4">
                    Our failing response is to add more people. When we need to speed up, we add more nodes to the bottleneck, which exponentially increases the connections and noise, compounding the problem (the birthday paradox).
                  </p>
                  <p>
                    Thinking of the organisation as a graph, you can envisage how complex this web gets and how many iterations there are between these nodes transferring context. This is often what can slow delivery.
                  </p>
                </>
              ),
            },
            {
              label: "Strategy Refresh Example",
              // TODO: Generate image: strategy-fragmentation.png
              // Prompt: Abstract 3D visualization of a fragmented document or puzzle. Disconnected pieces. Searching for alignment. Dark background. Blue accents.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Strategy Refresh",
              content: (
                <>
                  <p className="mb-4">
                    Earlier this year, we went through an organisational strategy refresh. Communicated through the typical mechanism: leadership forums, targeted sessions, presentations. When it was time to return to work, we were left with a PowerPoint slide.
                  </p>
                  <p className="mb-4">
                    As a leader, I needed to understand: Are we still aligned? What needs to shift? To do this analysis effectively, particularly with AI assistance, I needed more than bullet points. I needed the rationale. Why these priorities? Why now?
                  </p>
                  <p>
                    This information existed, but scattered across intranet sites. I had to visit over 20 different pages to assemble something comparable. This is the context problem in practice.
                  </p>
                </>
              ),
            },
            {
              label: "Quarterly Planning Cycle",
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: Quarterly Planning Cycle",
              content: (
                <>
                  <p className="mb-4">
                    The strategy refresh is periodic, but the same pattern plays out every quarter. Group leader calls. Divisional town halls. Organisation-wide town halls. Each grounded in strategy, but also reflecting on achievements, examining what could have been done differently, and assessing how the current context shapes priorities ahead.
                  </p>
                  <p className="mb-4">
                    These sessions are genuinely valuable—you receive the full context, the rationale, the nuance. They equip you with talking points to cascade to your team. The problem isn't the quality of what's communicated; it's the form.
                  </p>
                  <p className="mb-4">
                    Everything is delivered verbally, supported by a PowerPoint with dot points. When the session ends, every recipient must interpret what it means for their team and document it themselves.
                  </p>
                  <p className="mb-4">
                    <strong>The compounding implications:</strong> Exponential duplication (100 leaders each doing the same translation work), lossy transmission creating variance across teams, and a barrier to AI adoption—you must write all that context yourself before AI becomes useful.
                  </p>
                  <p>
                    Imagine instead receiving a comprehensive document post-session. You could immediately combine it with your team's context and use AI to analyse implications. The barrier disappears.
                  </p>
                </>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="Why AI Changes Everything"
          subtitle="The Adoption Paradox"
          imagePosition="right"
          tabs={[
            {
              label: "The AI Bottleneck",
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Data flowing into an AI core",
              content: (
                <>
                  <p className="mb-4">
                    We are investing in AI tools to help us accelerate. The promise is compelling: AI that can write code, analyse data, draft documents, identify risks. These capabilities will naturally continue to improve.
                  </p>
                  <p className="mb-4">
                    But the bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well.
                  </p>
                  <p className="mb-4">
                    Think about how we actually spend time today. Writing the code, creating the analysis, drafting the document often takes less time than gathering the context needed to do it right. We spend hours in meetings clarifying requirements, days waiting for answers about constraints, weeks iterating because critical information surfaced too late.
                  </p>
                  <p className="mb-4">
                    AI capabilities for task execution will improve on their own. But without changing how we organise and share context, that improved capability hits a ceiling. If AI can’t access the context it needs, it will produce faster wrong answers.
                  </p>
                  <p>
                    This is the fundamental shift: context availability, not execution capability, becomes the limiting factor for AI value.
                  </p>
                </>
              ),
            },
            {
              label: "Adoption Paradox",
              // TODO: Generate image: adoption-paradox-key.png
              // Prompt: Abstract 3D visualization of a key that doesn't fit a lock, or a puzzle piece that doesn't fit. Friction. Dark background. Blue glowing edges.
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: Adoption Paradox",
              content: (
                <>
                  <p className="mb-4">
                    Much of the excitement in AI adoption has centered on “finding use cases”: identifying specific problems where AI might help, building agents, and rolling them out. This energy is positive, but in the rush to build, non-experts have perhaps gotten a little carried away without fully understanding the fundamentals of how these tools work.
                  </p>
                  <p className="mb-4">
                    These tools are not magic; they are reasoning engines that require fuel, context, to operate effectively.
                  </p>
                  <p className="mb-4">
                    If our people can’t use AI effectively to solve their own daily work problems because they lack the context to make AI useful, how will they possibly create AI solutions that help our customers?
                  </p>
                  <p>
                    The path to transformative AI isn’t just top-down use case hunting. It’s bottom-up enablement: give people the context infrastructure so AI becomes genuinely useful in their own work. When they experience AI helping them deliver higher quality faster because it has the right context, they’ll naturally identify opportunities to apply that same approach to customer problems.
                  </p>
                </>
              ),
            },
            {
              label: "The Agile 'Bug'",
              // TODO: Generate image: agile-bug-glitch.png
              // Prompt: Abstract 3D visualization of a glitch or bug in a digital system. Matrix-like code rain but distorted. Dark background. Blue and white.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: The Agile Bug",
              content: (
                <>
                  <p className="mb-4">
                    There is a fundamental tension between how we have been trained to work and what AI requires to function. The Agile Manifesto’s "Working software over comprehensive documentation" was a necessary correction to Waterfall, but in the age of AI, this mindset has become antithetical to progress.
                  </p>
                  <p className="mb-4">
                    Traditional Agile relies on tacit knowledge and conversation. We minimise documentation because we assume we can "set up a quick meeting" or "jump on a standup" to fill the gaps. The documentation that <em>does</em> exist is almost always created post-hoc, after the work is done.
                  </p>
                  <p className="mb-4">
                    <strong>This approach is fatal for AI adoption.</strong>
                  </p>
                  <p className="mb-4">
                    AI cannot "set up a meeting" to clarify a requirement. It cannot read your mind during a standup. It requires explicit, structured context <em>before</em> the work starts. If the context is trapped in your head, the AI is useless.
                  </p>
                  <p>
                    By clinging to the Agile habit of "docs last" (or docs never), we are actively blocking our ability to leverage these tools.
                  </p>
                </>
              ),
            },
            {
              label: "Tacit vs Explicit",
              // TODO: Generate image: tacit-explicit-comparison.png
              // Prompt: Abstract 3D comparison. One side blurry/foggy (Tacit), one side sharp/crystal clear (Explicit). Dark background. Blue lighting.
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: Tacit vs Explicit",
              content: (
                <>
                  <p className="mb-4">
                    Without explicit guidance, AI executes 80% of the task perfectly but fails on the critical last 20% because that final mile relies on tacit knowledge. Here’s where Agile’s preference for implicit communication has become a liability.
                  </p>
                  <p className="mb-4">
                    AI forces us to make our standards explicit. If you give AI only the ‘what’ from the PowerPoint, it will make up the why. It cannot guess your quality criteria; they must be concrete enough to verify.
                  </p>
                  <p className="mb-4">
                    This is why the economics of documentation have flipped. Before AI, writing extensive documentation was expensive and often wasteful. Now, creating structured <strong>Context Artefacts</strong> is cheap (thanks to AI assistance) and essential.
                  </p>
                  <p className="mb-4">
                    We need to move from unstructured "documents" (slide decks, loose wiki pages) to structured <strong>Context Artefacts</strong> designed for consumption. These artefacts translate tacit "hero" knowledge into the explicit standards AI needs to be reliable.
                  </p>
                  <p>
                    In simple terms: Bad context + AI = Bad output + Low trust. Good context + AI = High-quality output + High adoption.
                  </p>
                </>
              ),
            },
          ]}
        />

        <ContentSection
          title="The Responsibility Shift"
          subtitle="From Broadcaster to Publisher"
        >
          <div>
            <p className="mb-4">
              The emergence of AI and modern tooling has further exposed the context flow problem. It highlights that verbally communicating context is no longer sufficient.
            </p>
            <p>
              This creates a new responsibility: the holder of the context must share it in a form that allows the recipient to consume it effectively with AI tools.
            </p>
          </div>
          <div>
            <p className="mb-4">
              The context holder must now be a "publisher," not just a broadcaster. Thankfully, there’s a great new tool to help them do this… AI to document the context in long form.
            </p>
            <p>
              By providing this detailed, accessible context, they enable their teams to immediately leverage it in their own AI workflows, preventing massive duplication of effort and misalignment.
            </p>
          </div>
        </ContentSection>



        <FrameworkSection
          title="The Solution"
          subtitle="Context-First Framework"
          tabs={[
            {
              label: "Overview",
              content: (
                <>
                  <p className="mb-4">
                    We must change our approach. Instead of using collaboration to find context, we need to create context to enable collaboration. This new approach is built on producing, managing, and leveraging <strong>Context Artefacts</strong>: high-leverage, structured context documents that are readable by humans but built for AI.
                  </p>
                  <div className="my-6 rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-foreground/90">
                      <strong>Low-Tech, High-Impact:</strong> This solution is relatively low-tech. While it can be supported by purpose-built tools, it can simply be specifically created Word/PDF documents. The innovation is in changing how we operate to adapt to AI, not in buying new software.
                    </p>
                  </div>
                  <p>
                    This new operating model is built on three pillars:
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 mt-4">
                    <li><strong>Context Cascade:</strong> The process of distilling and flowing Context Artefacts down through the organisation.</li>
                    <li><strong>Context Core:</strong> The practice of using foundational context to easily create detailed context for specific components. It is the central engine that allows you to build out knowledge efficiently.</li>
                    <li><strong>Patterns of Work:</strong> The new patterns of work that are oriented around the creation, distribution and use of Context Artefacts.</li>
                  </ol>
                </>
              ),
            },
            {
              label: "1. Context Cascade",
              content: (
                <SubTabs
                  tabs={[
                    {
                      label: "What is it?",
                      content: (
                        <>
                          <p className="mb-4">
                            Context Cascade establishes a hierarchy of shared context that flows throughout the organisation. It supplements traditional communication with structured <strong>Context Artefacts</strong>:
                          </p>
                          <ul className="list-disc pl-4 space-y-2 mb-4">
                            <li>
                              <strong>Group Level:</strong> The primary source of truth. It is a living document that evolves quarter-to-quarter, structured into two layers:
                              <ul className="list-disc pl-4 mt-2 space-y-1">
                                <li><strong>The Fixed Components:</strong> Enduring elements like Strategy, Vision, Values, and Leadership Principles.</li>
                                <li><strong>The Variable Components:</strong> The specific priorities for the upcoming quarter and reflections on the last. This explicitly captures the narrative often lost in leadership calls, the rationale, the "why now," and the nuance, so it can be reused.</li>
                              </ul>
                            </li>
                            <li>
                              <strong>Division/Domain Level:</strong> Similar structure, but more detail for that division (Tech, Operations, Retail, etc) showing how they align to and extend the Group context.
                            </li>
                            <li>
                              <strong>Team Level:</strong> Teams can then query these documents with AI to understand implications for their specific work.
                            </li>
                          </ul>
                          <p>
                            <strong>How it works:</strong> Shared context flows down, local context extends and refines it (adding intended outcomes, acceptance criteria), and consistency consolidates upward.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Why it matters",
                      content: (
                        <>
                          <p className="mb-4">
                            <strong>Solves the "Strategy Refresh" Scavenger Hunt:</strong> Remember the example of visiting 20 pages to reconstruct the strategy? Context Cascade eliminates this.
                          </p>
                          <p className="mb-4">
                            Instead of leaders spending days hunting and synthesising context, they receive curated artefacts they can immediately use.
                          </p>
                          <p>
                            It ensures that when a team uses AI to plan their backlog, they are aligned with the CEO's actual intent (the "why" and "rationale"), not just a guess based on a bullet point.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <p>
                          The CEO publishes the quarterly strategy (Group). The CTO extends this with a technical roadmap (Division). A Product Team imports both into their AI context window to generate a backlog that is technically sound and strategically aligned (Team).
                        </p>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: "2. Context Core",
              content: (
                <SubTabs
                  tabs={[
                    {
                      label: "What is it?",
                      content: (
                        <>
                          <p className="mb-4">
                            The Context Core is the operational hub—a team’s living repository of <strong>Context Artefacts</strong>. It is where knowledge moves from people’s heads into shared, queryable assets.
                          </p>
                          <p className="mb-4">
                            Ideally, you should think about starting with your highest leverage artifacts at the core as foundational and build out knowledge from there. A foundational set might contain:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 mb-4">
                            <li><strong>Vision/Purpose:</strong> The fundamental purpose, problem, and intended outcomes.</li>
                            <li><strong>Annual/Quarterly Priorities:</strong> The "why-now" rationale and OKRs.</li>
                            <li><strong>Reflections / Decision Log:</strong> A running log of key decisions and learnings.</li>
                            <li><strong>Dependencies:</strong> Key dependencies, interfaces, and owners.</li>
                            <li><strong>Explicit Definition of Done:</strong> What “done” looks like. This is where “instinct” becomes a concrete, verifiable standard.</li>
                          </ul>
                          <p className="mb-4">
                            From this core, you can build detailed context for new features, ensuring every user story is aligned with upstream context.
                          </p>
                          <p>
                            <strong>How it works:</strong> "Resolve it in the hub." Before calling a meeting, check the hub. If the answer isn't there, update the artefact <em>then</em> share it.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Why it matters",
                      content: (
                        <>
                          <p className="mb-4">
                            <strong>Solves the "Telephone Game" of Context:</strong> Consider a leadership call with 50 people. Without a Context Artefact, every recipient has to take the PowerPoint slide, capture their own version of what they heard, and put it into a prompt to understand the impact.
                          </p>
                          <p className="mb-4">
                            This leads to 50 different interpretations. Context Core ensures consistency across the organisation, as everyone builds from the description provided by the <em>original holder</em> of the context.
                          </p>
                          <p>
                            It saves massive duplication of effort and ensures that the AI is grounded in the source of truth, not a translation of a translation.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <p>
                          Instead of a 1-hour meeting to debate "quality," a team refers to their "Explicit Definition of Done" artefact in the Core. They use AI to check their code against this standard, resolving the issue in minutes without a meeting.
                        </p>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: "3. Patterns of Work",
              content: (
                <SubTabs
                  tabs={[
                    {
                      label: "What is it?",
                      content: (
                        <>
                          <p className="mb-4">
                            The shift from "docs-last" (Agile default) to "context-first" execution. It changes <em>when</em> and <em>how</em> we capture knowledge using two steps:
                          </p>
                          <ul className="list-disc pl-4 space-y-4">
                            <li>
                              <strong>Pause:</strong> Take a short, focused pause before jumping into building. Use this time to write down the “why,” the “what,” and the guiding principles <em>into an initial Context Artefact</em>. This is not waterfall planning; it is the minimal critical act of making your intent explicit. It prevents the trap of automating inefficient processes.
                            </li>
                            <li>
                              <strong>Prime:</strong> Immediately publish the seed <strong>Context Artefact</strong> to all stakeholders and systems. So all that are involved (Risk, Compliance, Engineering) get this context from day zero.
                            </li>
                          </ul>
                        </>
                      ),
                    },
                    {
                      label: "Why it matters",
                      content: (
                        <>
                          <p className="mb-4">
                            <strong>Solves the "Coordination Tax":</strong> Currently, we pay a high tax to coordinate work—endless kickoff meetings, email chains, and "syncs" just to get started.
                          </p>
                          <p className="mb-4">
                            By "Priming" stakeholders with context <em>before</em> they engage, you remove the friction of getting started. It allows Risk, Compliance, and Engineering to work in parallel from day one.
                          </p>
                          <p>
                            It turns coordination from a reactive bottleneck (waiting for a meeting) into a proactive platform for speed.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <p>
                          A Product Manager writes a 1-page "Context Brief" (Pause) and shares it with Engineering and Legal (Prime) <em>before</em> the kickoff meeting. The meeting is then used for high-value problem solving, not basic information sharing.
                        </p>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="Business Case"
          subtitle="Why Context is Worth the Investment"
          imagePosition="right"
          tabs={[
            {
              label: "The ROI",
              // TODO: Generate image: business-roi-exponential.png
              // Prompt: Abstract 3D visualization of a blooming flower or expanding network. Growth, positive outcome. Glowing blue. Dark background. (Alternative to previous ROI).
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: The ROI",
              content: (
                <>
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
                </>
              ),
            },
            {
              label: "Expected Benefits",
              // TODO: Generate image: benefits-network-growth.png
              // Prompt: Abstract 3D visualization of a network connecting and lighting up. Speed, efficiency. Glowing blue. Dark background.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Expected Benefits",
              content: (
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>Eliminating Context-Gathering Overhead:</strong> Teams start work with clarity rather than assumptions.</li>
                  <li><strong>Cycle Time Improvements:</strong> Validation activities happen in parallel.</li>
                  <li><strong>Early Issue Detection:</strong> Problems caught before significant work is invested.</li>
                  <li><strong>Organisational Learning:</strong> New projects don’t start from zero.</li>
                  <li><strong>Employee Experience:</strong> Work feels more proactive than reactive.</li>
                </ul>
              ),
            },
            {
              label: "How Work Changes",
              // TODO: Generate image: work-transformation-morph.png
              // Prompt: Abstract 3D visualization of a transformation. Morphing from chaotic to organized. Dark background. Blue light.
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: How Work Changes",
              content: (
                <div className="space-y-4">
                  <div>
                    <strong className="block text-sm text-foreground/60">Traditional Habit (Agile)</strong>
                    <p>Docs-last: Created after development.</p>
                  </div>
                  <div>
                    <strong className="block text-sm text-foreground/60">Context-First Practice</strong>
                    <p>Context-first: Critical context written <em>before</em> work starts.</p>
                  </div>
                  <hr className="border-white/10" />
                  <div>
                    <strong className="block text-sm text-foreground/60">Traditional Habit (Agile)</strong>
                    <p>Status meetings for updates.</p>
                  </div>
                  <div>
                    <strong className="block text-sm text-foreground/60">Context-First Practice</strong>
                    <p>Update-don’t-meet: Teams post updates in the context hub.</p>
                  </div>
                </div>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="Start"
          subtitle="Where and How to Start"
          imagePosition="left"
          tabs={[
            {
              label: "Immediate Start",
              // TODO: Generate image: start-ignition-spark.png
              // Prompt: Abstract 3D visualization of a start button or ignition. Spark of energy. Beginning. Glowing blue. Dark background.
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: Immediate Start",
              content: (
                <>
                  <p className="mb-4">
                    The immediate value demonstration is simple: take a strategic document (quarterly priorities, team vision) and include it in your AI prompts. Ask AI to draft something with that context attached. Then try without it.
                  </p>
                  <p>
                    The difference is immediate and visceral. Without context, AI gives you generic corporate-speak. With context, it gives you something aligned, specific, and much closer to what you actually need.
                  </p>
                </>
              ),
            },
            {
              label: "Context Tiers",
              // TODO: Generate image: context-tiers-pyramid.png
              // Prompt: Abstract 3D visualization of a layered pyramid or tiered structure. Levels of importance. Glowing blue edges. Dark background.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Context Tiers",
              content: (
                <>
                  <p className="mb-4">
                    Not everything should be documented. The key is understanding the relationship between a document’s leverage and the structure it requires.
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-base">
                    <li><strong>Tier 1 - Strategic Context (Highest Leverage):</strong> Annual strategy, OKRs. Seeds context for hundreds.</li>
                    <li><strong>Tier 2 - Domain/Team Context (High Leverage):</strong> Quarterly memos, architectural decisions.</li>
                    <li><strong>Tier 3 - Project Context (Medium Leverage):</strong> Feature specs.</li>
                    <li><strong>Tier 4 - Tactical (Low Leverage):</strong> Bug tickets, meeting notes.</li>
                  </ul>
                </>
              ),
            },
            {
              label: "Quarterly Memo",
              // TODO: Generate image: quarterly-memo-tablet.png
              // Prompt: Abstract 3D visualization of a digital document or tablet. Glowing with information. Important, central. Dark background. Blue accents.
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: Quarterly Memo",
              content: (
                <>
                  <p className="mb-4">
                    There’s already a quarterly memo that delivery domains and teams complete. This quarterly context memo should be restored and enhanced as a key <strong>Context Artefact</strong>.
                  </p>
                  <p>
                    It becomes the living Context Core. Rather than a point-in-time status report, it becomes the maintained hub that gets continuously updated.
                  </p>
                </>
              ),
            },
            {
              label: "Addressing Objections",
              // TODO: Generate image: objections-shield-dissolve.png
              // Prompt: Abstract 3D visualization of a shield or barrier being dissolved. Overcoming resistance. Dark background. Blue light.
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: Addressing Objections",
              content: (
                <div className="space-y-4">
                  <div>
                    <strong className="block text-foreground">“This Sounds Like Waterfall 2.0”</strong>
                    <p className="text-sm">Context Artefacts are about making intent explicit, not locking in detailed specs. They are living documents.</p>
                  </div>
                  <div>
                    <strong className="block text-foreground">“People Will Revert to Old Habits”</strong>
                    <p className="text-sm">Make the new way easier. AI transcription, context answering questions faster than meetings.</p>
                  </div>
                  <div>
                    <strong className="block text-foreground">“Maintenance Nightmare”</strong>
                    <p className="text-sm">Maintenance is a core responsibility. The trade-off: 15 mins updating a doc vs hours in repetitive meetings.</p>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
      >
        <a
          href="mailto:timothygillam@gmail.com"
          className="font-mono text-xs text-foreground/40 transition-colors hover:text-foreground"
        >
          Written by Tim Gillam
        </a>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
