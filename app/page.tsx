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
              <strong>The Problem:</strong> Critical organizational knowledge is trapped in people&apos;s heads, and our primary method for transmitting it is through meetings and emails. This &quot;context flow problem&quot; creates a bottleneck that prevents effective AI adoption, as AI requires explicit context to function reliably.
            </p>
            <p>
              <strong>The Solution:</strong> The Context-First Framework solves this by shifting from a &quot;broadcaster&quot; model to a &quot;publisher&quot; model. By creating structured Context Artefacts, high-leverage documents designed for both human and AI consumption, we unlock the context needed for AI to deliver value.
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
              label: "The Organisational Graph",
              imageSrc: "/structural-reality.png",
              imageAlt: "Abstract network graph showing organizational complexity",
              content: (
                <>
                  <p className="mb-4">
                    Work doesn't happen in clean vertical lines. It happens in a dense, chaotic web of dependencies. Every meeting, every email, every Teams message is a &quot;transaction&quot; someone, who holds context, required to pass context from one person to another to perform their function.
                  </p>
                  <p className="mb-4">
                    When we fall behind, our instinct is to add more people. But, in an organisational context, adding more nodes (people) to a network (group of people doing work) doesn't increase speed; it exponentially increases the connections and the noise and increases the coordination tax to get things done. This is why &quot;adding resources&quot; can often not yield the benefits we expect or just pushes the bottleneck somewhere else. They in turn add more people and the problem compounds.
                  </p>
                  <p className="mb-4">
                    <strong>Real-World Example: Risk Assessment</strong>
                  </p>
                  <p className="mb-4">
                    Consider a Risk Assessment. It rarely takes long to <em>do</em>, but it takes weeks to <em>start</em>. Why? Because the Risk Specialist needs to gather context from various people accrued over time to perform their task, it often happens late in the delivery which increases pressure, so we bring in more people, these people then need the context (more meetings and emails), they then need to get their assessment approved as they're not senior enough... so on, and so on. The bottleneck isn't the task; it's the &quot;transactional volume&quot; of meetings and emails required to get the context.
                  </p>
                </>
              ),
            },
            {
              label: "The AI Ceiling",
              imageSrc: "/structural-reality.png",
              imageAlt: "Visual: Strategy Refresh",
              content: (
                <>
                  <p className="mb-4">
                    There's so much energy pushing towards building AI agents to do tasks. Teach people how to prompt. But an AI agent is just another node in this chaotic graph. If the bottleneck is <em>gathering context</em>, AI doesn't help. It just generates &quot;faster wrong answers.&quot;
                  </p>
                  <p className="mb-4">
                    To get adoption, we must give people the right context to use in the tools to yield useful outputs. And reduce the barriers to do so.
                  </p>
                  <p className="mb-4">
                    To get value, we must reduce the <em>volume of transactions</em> by establishing context <em>before</em> the work starts.
                  </p>
                  <p className="mb-4">
                    <strong>Real-World Example: Strategy Refresh</strong>
                  </p>
                  <p className="mb-4">
                    When strategy is communicated via PowerPoint, people are left after the session with the burden of then documenting the &quot;why.&quot; To use AI effectively, I need the rationale, not just the bullet points. Without a structured <strong>Context Artefact</strong>, I have to write that context myself before AI becomes useful. Most people won't do that, so the AI remains a toy and under-utlised.
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
                    AI capabilities for task execution will improve on their own. More tools, better models and better prompting will only get you so far. Without changing how we organise and share context, that improved capability hits a ceiling. If AI can’t access the context it needs, it will produce faster wrong or incomplete answers, which will lead people to revert back to pre-AI practices.
                  </p>
                  <p>
                    Context availability, not execution capability, becomes the limiting factor for AI value.
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
                  <p>
                    This new operating model is built on four components:
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 mt-4">
                    <li><strong>Context Artefacts:</strong> Structured, high-leverage documents designed to be used as seed context for AI.</li>
                    <li><strong>Context Cascade:</strong> The process of distilling and flowing Context Artefacts down through the organisation.</li>
                    <li><strong>Context Core:</strong> The practice of using foundational context to easily create detailed context for specific components. It is the central engine that allows you to build out knowledge efficiently.</li>
                    <li><strong>Patterns of Work:</strong> The new patterns of work that are oriented around the creation, distribution and use of Context Artefacts.</li>
                  </ol>
                  <p className="mt-6">
                    <strong>Low-Tech, High-Impact:</strong> This solution is relatively low-tech. While it can be supported by purpose-built tools, it can simply be specifically created Word/PDF documents. The innovation is in changing how we operate to adapt to AI, not in buying new software.
                  </p>
                </>
              ),
            },
            {
              label: "Context Artefacts",
              content: (
                <div className="space-y-6">
                  <p>
                    Think of <strong>Context Artefacts</strong> as &quot;Claude Skills&quot; but for organisational context. They are curated, high-leverage documents designed to be used as seed context when your people use AI tools.
                  </p>
                  <div>
                    <strong className="block text-foreground mb-2">Two Types of Artefacts</strong>
                    <ul className="list-disc pl-4 space-y-2 text-foreground/80">
                      <li>
                        <strong>Fixed Artefacts:</strong> Enduring context that rarely changes (e.g., Group or Divisional Strategy, Team Purpose and Objectives, Customer Personas, Leadership Principles).
                      </li>
                      <li>
                        <strong>Variable Artefacts:</strong> Context that evolves over time (e.g., Quarterly OKRs, Priorities, Reflections). These are refreshed during cycles like quarterly planning.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="block text-foreground mb-2">The Intent</strong>
                    <p className="text-foreground/80 mb-4">
                      To improve the quality of context available to your people. By making high-quality context easily accessible, we reduce the barriers to using AI effectively. It becomes much easier to construct prompts and get valuable outputs when you have the right context ready to go.
                    </p>
                    <p className="text-foreground/80">
                      These artefacts should be constructed with the help of AI, whether by an individual using AI to structure their thoughts, or by analysing transcripts of team sessions to distill key context.
                    </p>
                  </div>
                </div>
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
                            <strong>Alignment through Inheritance:</strong> The intent is to cascade context so that each level of the organisation inherits the full context from the levels above. This ensures that every team is working from a single, shared source of truth, rather than relying on fragmented or conflicting interpretations.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <div className="space-y-4">
                          <p>
                            <strong>The Quarterly Leaders&apos; Call:</strong> Imagine a CEO presenting strategy to 1,000 leaders, sharing achievements, reflections, and priorities via slides and talk-track.
                          </p>
                          <p>
                            <strong>Without Context Cascade:</strong> 1,000 leaders individually interpret this message. You get 1,000 different versions of the strategy fed into 1,000 different AI tools. The result is noise and misalignment.
                          </p>
                          <p>
                            <strong>With Context Cascade:</strong> This context is captured in a structured artefact. All 1,000 leaders inherit the <em>exact same</em> context to seed their team&apos;s planning. You get 1,000 teams perfectly aligned to the core strategy.
                          </p>
                        </div>
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
                            The Context Core is a teams local context store - a team’s living repository of <strong>Context Artefacts</strong>. It is where knowledge moves from people’s heads into shared, queryable assets.
                          </p>
                          <p className="mb-4">
                            It starts with the context inherited from the organisation (Context Cascade). You then build your local core with foundational artifacts:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 mb-4">
                            <li><strong>Vision/Purpose:</strong> The fundamental purpose, problem, and intended outcomes.</li>
                            <li><strong>Product Overview:</strong> High-level description of the product and its core value.</li>
                            <li><strong>Annual/Quarterly Priorities:</strong> The &quot;why-now&quot; rationale and OKRs.</li>
                            <li><strong>Reflections / Decision Log:</strong> A running log of key decisions and learnings.</li>
                          </ul>
                          <p>
                            These foundational artifacts are then used to seed the creation of new context (e.g., feature specs, tickets). Whenever there is a concentration of emails or meetings on a topic, it&apos;s a signal that context is missing and should be written down.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Why it matters",
                      content: (
                        <>
                          <p className="mb-4">
                            <strong>1. Reducing the &quot;Meeting Loop&quot;:</strong> The goal is to document context, not just requirements—to reduce the volume of meetings and emails. Instead of explaining the same context in repetitive meetings, stakeholders consume the Context Artefacts asynchronously.
                          </p>
                          <p className="mb-4">
                            <strong>2. Seed Context for Delivery:</strong> Without the Context Core, using AI to document your work means starting from a blank canvas.
                          </p>
                          <p>
                            Curated <strong>Context Artefacts</strong> provide the essential "seed context" for your AI tools during delivery. This lowers the barrier to creating high-quality output because the AI isn't guessing, it's building upon a foundation of established truth.
                          </p>
                        </>
                      ),
                    },
                    {
                      label: "Example",
                      content: (
                        <div className="space-y-4">
                          <p>
                            <strong>New Feature Context:</strong> A team is kicking off a new feature. Instead of calling a meeting to explain the &quot;why&quot; and &quot;what&quot; to Product, Engineering, and Design separately:
                          </p>
                          <p>
                            1. They use their <strong>Product Overview</strong> and <strong>Quarterly Priorities</strong> artifacts to seed an AI session.
                          </p>
                          <p>
                            2. They generate a <strong>Feature Context</strong> artifact that clearly articulates the intent, alignment to strategy, and core requirements.
                          </p>
                          <p>
                            3. Stakeholders review this artifact <em>before</em> any meeting. The meeting (if needed) focuses on solving problems, not sharing information.
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              label: "Patterns of Work",
              content: (
                <div className="space-y-6">
                  <p className="mb-4">
                    We must shift our operating rhythm to prioritize the creation and maintenance of context. We need to unlearn the Agile habit of low documentation and place a new emphasis on creating context to be used in AI tools, training, and delivery.
                  </p>
                  <div>
                    <strong className="block text-foreground mb-2">The Responsibility Shift</strong>
                    <p className="text-foreground/80 mb-2">
                      The context holder has a responsibility to create the context. If they don&apos;t, they are simply passing this responsibility on to others.
                    </p>
                    <p className="text-foreground/80">
                      This increases the probability of inaccurate translation variants and productivity impacts as multiple people duplicate the work of recreating that context. It creates a barrier for recipients to use AI because they must first do the work to document the context themselves. Inevitably, it becomes easier to just ask for another meeting or send another email.
                    </p>
                  </div>
                  <div>
                    <strong className="block text-foreground mb-2">The Methodology: Pause and Prime</strong>
                    <ul className="list-disc pl-4 space-y-2 text-foreground/80">
                      <li>
                        <strong>Pause:</strong> Take a short, focused pause before jumping into building to write down the &quot;why&quot; and &quot;what&quot; into an initial Context Artefact.
                      </li>
                      <li>
                        <strong>Prime:</strong> Immediately publish this seed context to all stakeholders (Risk, Change, Engineering) so they have context from day zero.
                      </li>
                    </ul>
                  </div>
                  <p>
                    This allows us to create context <em>before</em> we start, enabling parallel delivery. Experts typically engaged later can be brought in earlier because they have the context to perform their function immediately. The result is fewer meetings and emails needed to transfer this context.
                  </p>
                </div>
              ),
            },
            {
              label: "Stitching It Together",
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
                        By the end of BRP, teams update their own local <strong>Context Artefacts</strong> (Quarterly Priorities, Value Links, Strategy Alignment). This becomes their foundational <strong>Context Core</strong> for the quarter, used to seed context for every feature and manage the backlog.
                      </p>
                    </div>
                  </div>
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
              label: "Quarterly Planning",
              // TODO: Generate image: quarterly-memo-tablet.png
              // Prompt: Abstract 3D visualization of a digital document or tablet. Glowing with information. Important, central. Dark background. Blue accents.
              imageSrc: "/context-flow-problem.png",
              imageAlt: "Visual: Quarterly Planning",
              content: (
                <>
                  <p className="mb-4">
                    Quarterly planning (leaders&apos; calls, town halls) is a context-dense period where context cascades down through the organisation. Currently, recipients bear the burden of individually transcribing this context to use AI effectively.
                  </p>
                  <p className="mb-4">
                    This is a critical opportunity to demonstrate the power of context. By providing leaders with the distilled context they need, rather than forcing them to create it, we make it easy for them to understand what the strategy means for their teams.
                  </p>
                  <p className="mb-4">
                    When we provide the right context, we unlock the ability for AI to be genuinely effective, turning a burden into a strategic advantage.
                  </p>
                  <p>
                    We should start by providing attendees of these sessions with a long-form Context Artefact of what was communicated in the session, so they can immediately jump into AI tools to work through what it means to them - armed with the same context to ensure alignment, consistency and reduce the barriers to start.
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
