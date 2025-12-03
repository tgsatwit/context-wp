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
    "Executive Summary",
    "The Problem",
    "Why AI Changes Everything",
    "The Solution",
    "Business Case",
    "Getting Started"
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

        <ContentSection
          title="Executive Summary"
          subtitle="The Context-First Organisation"
        >
          <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
            <p>
              <strong>The Problem:</strong> Critical organizational knowledge is trapped in people&apos;s heads, accessible only through meetings and emails. This &quot;context flow problem&quot; creates a bottleneck that prevents effective AI adoption, as AI requires explicit context to function reliably.
            </p>
            <p>
              <strong>The Solution:</strong> The Context-First Framework solves this by shifting from a &quot;broadcaster&quot; model to a &quot;publisher&quot; model. By creating structured Context Artefacts—high-leverage documents designed for both human and AI consumption—we unlock the context needed for AI to deliver value.
            </p>
            <p>
              <strong>The Value:</strong> This approach transforms AI from a tool that produces &quot;faster wrong answers&quot; into a genuine productivity engine. The result is not just efficiency, but an organization that learns, adapts, and aligns at the speed of AI.
            </p>
          </div>
        </ContentSection>

        <TabbedContentSection
          title="The Problem"
          subtitle="Why Context is the New Bottleneck"
          imagePosition="right"
          tabs={[
            {
              label: "The Context Flow Problem",
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
              label: "The Structural Reality",
              imageSrc: "/structural-reality.png",
              imageAlt: "Abstract network graph showing organizational complexity",
              content: (
                <>
                  <p className="mb-4">
                    If you observe an organisation as a network graph, you begin to understand why the experience of work feels so different depending on where you sit. At the top, context flows down as strategic direction. Leaders can often dictate the terms by which they engage.
                  </p>
                  <p className="mb-4">
                    But move down to the teams that deliver, and the structural reality shifts. These teams exist in a dense web of dependencies. The critical knowledge isn’t in a system; it’s in people’s heads. Bottlenecks form around key people because that’s where the context is trapped.
                  </p>
                  <p className="mb-4">
                    We use meetings and emails as a way to transfer context - but it&apos;s incredibly inefficient. Our failing response is to add more people. When we need to speed up, we add more nodes to the bottleneck, which exponentially increases the connections and noise, compounding the problem.
                  </p>
                </>
              ),
            },
            {
              label: "Real-World Examples",
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Strategy Refresh",
              content: (
                <>
                  <p className="mb-4">
                    Consider the typical organisational strategy refresh. It is communicated through leadership forums and presentations, but when it&apos;s time to return to work, teams are often left with just a PowerPoint slide.
                  </p>
                  <p className="mb-4">
                    As a leader, I needed to understand: Are we still aligned? What needs to shift? To do this analysis effectively, particularly with AI assistance, I needed the rationale. This information existed, but scattered across intranet sites. I had to visit over 20 different pages to assemble it.
                  </p>
                  <p className="mb-4">
                    This same pattern plays out every quarter. Sessions are valuable, but the context is delivered verbally. When the session ends, every recipient must interpret what it means for their team and document it themselves.
                  </p>
                  <p>
                    <strong>The compounding implications:</strong> Exponential duplication (100 leaders each doing the same translation work), lossy transmission creating variance across teams, and a barrier to AI adoption—you must write all that context yourself before AI becomes useful.
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
              label: "The New Bottleneck",
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
              label: "The Documentation Inversion",
              // TODO: Generate image: agile-bug-glitch.png
              // Prompt: Abstract 3D visualization of a glitch or bug in a digital system. Matrix-like code rain but distorted. Dark background. Blue and white.
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: The Agile Bug",
              content: (
                <>
                  <p className="mb-4">
                    There is a fundamental tension between how we have been trained to work and what AI requires to function. The Agile Manifesto’s &quot;Working software over comprehensive documentation&quot; was a necessary correction to Waterfall, but in the age of AI, this mindset has become antithetical to progress.
                  </p>
                  <p className="mb-4">
                    Traditional Agile relies on tacit knowledge and conversation. We minimise documentation because we assume we can &quot;set up a quick meeting&quot; to fill the gaps. <strong>This approach is fatal for AI adoption.</strong> AI cannot &quot;set up a meeting&quot; to clarify a requirement. It requires explicit, structured context <em>before</em> the work starts.
                  </p>
                  <p className="mb-4">
                    Without explicit guidance, AI executes 80% of the task perfectly but fails on the critical last 20% because that final mile relies on tacit knowledge. AI forces us to make our standards explicit. If you give AI only the ‘what’, it will make up the ‘why’.
                  </p>
                  <p className="mb-4">
                    This is why the economics of documentation have flipped. Before AI, writing extensive documentation was expensive. Now, creating structured <strong>Context Artefacts</strong> is cheap and essential. We must move from unstructured &quot;documents&quot; to structured assets designed for consumption.
                  </p>
                  <p>
                    In simple terms: Bad context + AI = Bad output + Low trust. Good context + AI = High-quality output + High adoption.
                  </p>
                </>
              ),
            },
            {
              label: "The Responsibility Shift",
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: Tacit vs Explicit",
              content: (
                <>
                  <p className="mb-4">
                    The emergence of AI and modern tooling has further exposed the context flow problem. It highlights that verbally communicating context is no longer sufficient.
                  </p>
                  <p className="mb-4">
                    This creates a new responsibility: the holder of the context must share it in a form that allows the recipient to consume it effectively with AI tools.
                  </p>
                  <p className="mb-4">
                    The context holder must now be a &quot;publisher,&quot; not just a broadcaster. Thankfully, there’s a great new tool to help them do this… AI to document the context in long form.
                  </p>
                  <p>
                    By providing this detailed, accessible context, they enable their teams to immediately leverage it in their own AI workflows, preventing massive duplication of effort and misalignment.
                  </p>
                </>
              ),
            },
          ]}
        />



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
              label: "Context Cascade",
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
                                <li><strong>The Variable Components:</strong> The specific priorities for the upcoming quarter and reflections on the last. This explicitly captures the narrative often lost in leadership calls, the rationale, the &quot;why now,&quot; and the nuance, so it can be reused.</li>
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
                            <strong>Solves the &quot;Strategy Refresh&quot; Scavenger Hunt:</strong> Remember the example of visiting 20 pages to reconstruct the strategy? Context Cascade eliminates this. Instead of leaders spending days hunting and synthesising context, they receive curated artefacts they can immediately use.
                          </p>
                          <p>
                            It ensures that when a team uses AI to plan their backlog, they are aligned with the CEO&apos;s actual intent (the &quot;why&quot; and &quot;rationale&quot;), not just a guess based on a bullet point.
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
              label: "Context Core",
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
                            <li><strong>Annual/Quarterly Priorities:</strong> The &quot;why-now&quot; rationale and OKRs.</li>
                            <li><strong>Reflections / Decision Log:</strong> A running log of key decisions and learnings.</li>
                            <li><strong>Dependencies:</strong> Key dependencies, interfaces, and owners.</li>
                            <li><strong>Explicit Definition of Done:</strong> What “done” looks like. This is where “instinct” becomes a concrete, verifiable standard.</li>
                          </ul>
                          <p>
                            <strong>How it works:</strong> &quot;Resolve it in the hub.&quot; Before calling a meeting, check the hub. If the answer isn&apos;t there, update the artefact <em>then</em> share it.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Why it matters",
                      content: (
                        <>
                          <p className="mb-4">
                            <strong>Unlocks AI for Delivery:</strong> By building from foundational context, teams have the clarity to use AI for planning and prioritization in daily agile ceremonies. It shifts the focus from "requirements gathering" to "context shaping."
                          </p>
                          <p className="mb-4">
                            <strong>Enables Parallel Execution:</strong> Context holders define the "what" and "why" first. This allows AI to help shape the solution and enables stakeholders (Risk, Compliance, Change) to engage <em>earlier</em>.
                          </p>
                          <p>
                            They can validate the intent and context immediately, rather than waiting for a built solution. This means these critical activities start at day zero, preventing late-stage blockers.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <p>
                          Instead of a 1-hour meeting to debate &quot;quality,&quot; a team refers to their &quot;Explicit Definition of Done&quot; artefact in the Core. They use AI to check their code against this standard, resolving the issue in minutes without a meeting.
                        </p>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: "Quarterly Planning",
              content: (
                <div className="space-y-6">
                  <p className="mb-4">
                    How does this come together? Here is the workflow for a context-first quarterly planning cycle:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <strong className="block text-lg text-foreground mb-1">1. The Inputs (Context Cascade)</strong>
                      <p className="text-foreground/80">
                        Leaders hold their usual town halls to share operating context and reflections. Crucially, <em>after</em> this, every delivery team receives a structured <strong>Context Artefact</strong> containing the Group, Division, and Domain context. No guessing required.
                      </p>
                    </div>
                    <div>
                      <strong className="block text-lg text-foreground mb-1">2. The Planning (BRP)</strong>
                      <p className="text-foreground/80">
                        Delivery teams combine this cascaded context with their own <strong>Persistent Team Context</strong> (who they are, their purpose). They use this combined clarity to plan and prioritize effectively during Big Room Planning (BRP).
                      </p>
                    </div>
                    <div>
                      <strong className="block text-lg text-foreground mb-1">3. The Outputs (Context Core)</strong>
                      <p className="text-foreground/80">
                        By the end of BRP, teams update their own local <strong>Context Artefacts</strong> (Quarterly Priorities, Value Links, Strategy Alignment). This becomes their foundational <strong>Context Core</strong> for the quarter—used to seed context for every feature and manage the backlog.
                      </p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: "Patterns of Work",
              content: (
                <div className="space-y-6">
                  <p className="mb-4">
                    We must shift our operating rhythm to prioritize the creation and maintenance of context. This means replacing the &quot;meeting-to-align&quot; habit with a &quot;read-then-act&quot; habit.
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Context Creation:</strong> Context is created <em>before</em> the work starts, not documented after.</li>
                    <li><strong>Responsibility Shift:</strong> The context holder moves from being a "broadcaster" of verbal updates to a "publisher" of structured, AI-ready assets.</li>
                    <li><strong>Context Curation:</strong> The Context Core is maintained as a living asset, not a static archive.</li>
                    <li><strong>Context Consumption:</strong> Teams query the context with AI to answer questions before asking a human.</li>
                    <li><strong>Update-don&apos;t-meet:</strong> Status updates are posted to the hub, freeing up meeting time for high-value problem solving.</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="The Business Case"
          subtitle="The Investment Case"
          imagePosition="left"
          tabs={[
            {
              label: "The ROI",
              imageSrc: "/ai-context-fuel.png",
              imageAlt: "Visual: The ROI",
              content: (
                <>
                  <p className="mb-4">
                    The ROI isn’t just faster execution; it’s dramatically reduced rework, earlier issue detection, and genuine AI adoption by our people.
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Reduced Rework:</strong> By providing explicit context upfront, we eliminate the &quot;guessing game&quot; that leads to wrong outputs.</li>
                    <li><strong>Faster Onboarding:</strong> New team members (and AI agents) can get up to speed in minutes by querying the Context Core.</li>
                    <li><strong>Higher Quality:</strong> Outputs are consistently aligned with strategy and quality standards.</li>
                  </ul>
                </>
              ),
            },
            {
              label: "How Work Changes",
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
            {
              label: "Success Indicators",
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Success Indicators",
              content: (
                <>
                  <p className="mb-4">
                    How do you know it&apos;s working? Look for these signs:
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Adoption:</strong> Teams voluntarily using the Context Core because it makes their work easier.</li>
                    <li><strong>Speed:</strong> A noticeable reduction in &quot;clarification meetings&quot; and time spent waiting for answers.</li>
                    <li><strong>Quality:</strong> AI outputs that are aligned with strategy and require significantly less rework.</li>
                    <li><strong>Alignment:</strong> Everyone working from the same &quot;source of truth,&quot; reducing friction and misalignment.</li>
                  </ul>
                </>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="Getting Started"
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
      </div >

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
    </main >
  )
}
