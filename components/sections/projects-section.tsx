"use client"

import { useState, useRef, useEffect } from "react"
import ProjectCard from "@/components/cards/project-card"
import ProjectModal from "@/components/modals/project-modal"
import { projects, type Project } from "@/lib/projects-data"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(1)
  const cardWidth = 344 // 340px card + 4px gap

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setModalOpen(true)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = cardWidth * visibleCount
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
      // update active index immediately so dots respond right away
      const newIndex = Math.round(newScrollLeft / cardWidth)
      setActiveIndex(Math.max(0, Math.min(newIndex, projects.length - 1)))
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const left = index * cardWidth
      scrollContainerRef.current.scrollTo({ left, behavior: 'smooth' })
      setActiveIndex(index)
    }
  }
  // track scroll to update activeIndex
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newIndex = Math.round(scrollLeft / cardWidth)
        setActiveIndex(newIndex)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [cardWidth])

  // compute how many cards fit in the container (visible count)
  useEffect(() => {
    const updateVisible = () => {
      const container = scrollContainerRef.current
      if (container) {
        const count = Math.max(1, Math.floor(container.clientWidth / cardWidth))
        setVisibleCount(count)
      } else {
        // fallback for SSR or initial render
        const width = typeof window !== 'undefined' ? window.innerWidth : 1200
        setVisibleCount(Math.max(1, Math.floor(width / cardWidth)))
      }
    }
    updateVisible()
    window.addEventListener('resize', updateVisible)
    return () => window.removeEventListener('resize', updateVisible)
  }, [cardWidth])

  return (
    <section 
      id="projects" 
      className="py-12 md:py-16 group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Featured Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            Scroll to explore • Click cards for details
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-8 w-8 text-foreground/70 hover:text-foreground drop-shadow-lg" strokeWidth={2.5} />
          </button>

          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/50 to-transparent z-[5] pointer-events-none -ml-20" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/50 to-transparent z-[5] pointer-events-none -mr-20" />

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {projects.map((project, index) => (
              <div key={index} className="flex-shrink-0 w-[340px]">
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  image={project.image}
                  tags={project.tags}
                  onClick={() => handleProjectClick(project)}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-8 w-8 text-foreground/70 hover:text-foreground drop-shadow-lg" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scroll Indicator Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index * 2)}
              className={`transition-all duration-300 rounded-full ${
                Math.floor(activeIndex / 2) === index 
                  ? 'w-8 h-2 bg-primary' 
                  : 'w-2 h-2 bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`Go to projects ${index * 2 + 1}-${Math.min((index + 1) * 2, projects.length)}`}
            />
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  )
}
