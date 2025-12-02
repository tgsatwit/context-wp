"use client"

import { Shader, Swirl } from "shaders/react"
import NextImage from "next/image"

import { GrainOverlay } from "@/components/grain-overlay"
import { ContentSection } from "@/components/sections/content-section"
import { TabbedContentSection } from "@/components/sections/tabbed-content-section"
import { MagneticButton } from "@/components/magnetic-button"
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
    if (scrollContainerRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)

      setTimeout(() => {
        isScrollingRef.current = false
      }, 700)
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current || isScrollingRef.current) return

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

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-center px-6 py-6 transition-opacity duration-700 md:px-12 ${isLoaded ? "opacity-100" : "opacity-0"
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
        className={`relative z-10 flex h-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex h-screen w-screen shrink-0 snap-start flex-col overflow-y-auto px-6 pb-16 pt-24 md:min-h-screen md:justify-end md:overflow-hidden md:px-12 md:pb-24">
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: The Solution",
              content: (
                <>
                  <p className="mb-4">
                    The Context-First Framework is built on producing curated <strong>Context Artefacts</strong> by combining a structured approach to curating organisational context and changing our patterns of work to produce it.
                  </p>
                  <p>
                    It provides a practical pathway to solve the context flow problem, unlock experts, and build an organisation that learns and adapts at the speed of change.
                  </p>
                </>
              ),
            },
            {
              label: "The ROI",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: The Delivery Trap",
              content: (
                <>
                  <p className="mb-4">
                    But move down to the teams that deliver, and the structural reality shifts. These teams exist in a dense web of dependencies: coordinating with other teams, clarifying requirements, validating with risk and compliance.
                  </p>
                  <p className="mb-4">
                    They cannot simply "opt out"; they must respond to the coordination demands their role creates. The number of connections, and therefore the coordination overhead, grows exponentially.
                  </p>
                  <p>
                    The critical knowledge isn’t in a system; it’s in people’s heads. Bottlenecks form around key people because that’s where the context is trapped. Delivery can only move as fast as their capacity allows.
                  </p>
                </>
              ),
            },
            {
              label: "Strategy Refresh Example",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
                    We are investing in AI tools to help us accelerate. But the bottleneck isn’t AI’s ability to do tasks. It’s our ability to give AI the context it needs to do them well.
                  </p>
                  <p className="mb-4">
                    Think about how we actually spend time today. Writing the code, creating the analysis, drafting the document often takes less time than gathering the context needed to do it right. We spend hours in meetings clarifying requirements, days waiting for answers about constraints.
                  </p>
                  <p>
                    If AI can’t access the context it needs, it will produce faster wrong answers. Context availability, not execution capability, becomes the limiting factor for AI value.
                  </p>
                </>
              ),
            },
            {
              label: "Adoption Paradox",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Adoption Paradox",
              content: (
                <>
                  <p className="mb-4">
                    Much of the excitement in AI adoption has centered on “finding use cases”. This energy is positive, but these tools are not magic; they are reasoning engines that require fuel—context—to operate effectively.
                  </p>
                  <p className="mb-4">
                    If our people can’t use AI effectively to solve their own daily work problems because they lack the context to make AI useful, how will they possibly create AI solutions that help our customers?
                  </p>
                  <p>
                    The path to transformative AI isn’t just top-down use case hunting. It’s bottom-up enablement: give people the context infrastructure so AI becomes genuinely useful in their own work.
                  </p>
                </>
              ),
            },
            {
              label: "The Agile 'Bug'",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: The Agile Bug",
              content: (
                <>
                  <p className="mb-4">
                    Traditional Agile relies on <strong>tacit knowledge</strong> and <strong>conversation</strong>. We minimise documentation because we assume we can "set up a quick meeting".
                  </p>
                  <p className="mb-4">
                    <strong>This approach is fatal for AI adoption.</strong> AI cannot "set up a meeting" to clarify a requirement. It requires explicit, structured context <em>before</em> the work starts.
                  </p>
                  <p>
                    By clinging to the Agile habit of "docs last", we are actively blocking our ability to leverage these tools.
                  </p>
                </>
              ),
            },
            {
              label: "Tacit vs Explicit",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Tacit vs Explicit",
              content: (
                <>
                  <p className="mb-4">
                    Without explicit guidance, AI executes 80% of the task perfectly but fails on the critical last 20% because that final mile relies on tacit knowledge.
                  </p>
                  <p className="mb-4">
                    AI forces us to make our standards explicit. If you give AI only the ‘what’ from the PowerPoint, it will make up the why. It cannot guess your quality criteria; they must be concrete enough to verify.
                  </p>
                  <p>
                    In simple terms: Bad context + AI = Bad output + Low trust. Good context + AI = High-quality output + High adoption.
                  </p>
                </>
              ),
            },
          ]}
        />

        <TabbedContentSection
          title="The Solution"
          subtitle="Context-First Framework"
          imagePosition="left"
          tabs={[
            {
              label: "Overview",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Overview",
              content: (
                <>
                  <p className="mb-4">
                    We must change our approach. Instead of using collaboration to find context, we need to create context to enable collaboration. This new approach is built on producing, managing, and leveraging <strong>Context Artefacts</strong>.
                  </p>
                  <p>
                    This new operating model is built on three pillars: Context Cascade, Context Core, and Changing Our Patterns of Work.
                  </p>
                </>
              ),
            },
            {
              label: "1. Context Cascade",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Context Cascade",
              content: (
                <>
                  <p className="mb-4">
                    Inspired by cascading style sheets, Context Cascade establishes a hierarchy of shared context that flows throughout the organisation. Each level inherits context from the levels higher.
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-base">
                    <li><strong>Group level:</strong> Enduring elements like Strategy, Vision, Values.</li>
                    <li><strong>Division/Domain level:</strong> Specific detail showing alignment to Group context.</li>
                    <li><strong>Team level:</strong> Teams query these documents with AI to understand implications.</li>
                  </ul>
                </>
              ),
            },
            {
              label: "2. Context Core",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Context Core",
              content: (
                <>
                  <p className="mb-4">
                    The operational hub: a team’s knowledge hub for its Context Artefacts, serving as a living, queryable repository.
                  </p>
                  <p className="mb-4">
                    A foundational set of Context Artefacts might contain: Vision/Purpose, Annual/Quarterly Priorities, Decision Log, Dependencies, and Explicit Definition of Done.
                  </p>
                  <p>
                    Critically, the Context Core is where work happens first. “Resolve it in the hub before calling a meeting.”
                  </p>
                </>
              ),
            },
            {
              label: "3. Patterns of Work",
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
              imageAlt: "Visual: Patterns of Work",
              content: (
                <>
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
                </>
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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
              imageSrc: "bg-gradient-to-br from-blue-900/20 to-black",
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

