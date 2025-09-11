import { useState, useEffect, useRef, useCallback } from 'react'

export interface TextSlide {
  id: string
  title?: string
  content: string
  author?: string
  position?: string
}

interface TextCarouselProps {
  slides: TextSlide[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
}

export const TextCarousel = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 4000,
//   showDots = true,
  showArrows = true,
  className = ''
}: TextCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, autoPlayInterval)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, autoPlay, autoPlayInterval, slides.length])

  // Navigation functions
//   const goToSlide = useCallback((index: number) => {
//     setCurrentSlide(index)
//   }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key === 'ArrowRight') {
        nextSlide()
      } else if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    const currentRef = carouselRef.current
    if (currentRef) {
      currentRef.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isPlaying, nextSlide, prevSlide])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Pause on hover
  const handleMouseEnter = () => {
    if (autoPlay) setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    if (autoPlay) setIsPlaying(true)
  }

  if (slides.length === 0) {
    return <div className="text-center text-gray-500">No slides to display</div>
  }

  return (
    <div
      ref={carouselRef}
      className={`relative w-full max-w-4xl mx-auto ${className}`}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fa744c] to-[#e8633f] shadow-xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 px-8 py-12 md:px-16 md:py-16 text-center text-white"
            >
              {slide.title && (
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  {slide.title}
                </h3>
              )}

              <div className="text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                {slide.content}
              </div>

              {(slide.author || slide.position) && (
                <div className="text-white text-opacity-80">
                  {slide.author && (
                    <div className="font-semibold text-lg">{slide.author}</div>
                  )}
                  {slide.position && (
                    <div className="text-sm mt-1">{slide.position}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fa744c]"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fa744c]"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {/* {showDots && slides.length > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.id}`}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#fa744c] ${
                index === currentSlide
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )} */}

      {/* Play/Pause indicator */}
      {autoPlay && (
        <div className="absolute top-4 right-4">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-300'}`} />
        </div>
      )}

      {/* Progress bar */}
      {/* {autoPlay && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{
              width: `${((Date.now() % autoPlayInterval) / autoPlayInterval) * 100}%`
            }}
          />
        </div>
      )} */}
    </div>
  )
}
