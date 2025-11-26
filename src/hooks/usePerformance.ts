import { useEffect, useRef, useCallback } from 'react'

// Performance monitoring and optimization utilities
export function usePerformanceMonitor() {
  const performanceData = useRef({
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  })

  const startTime = useRef(performance.now())

  useEffect(() => {
    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        performanceData.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }
    }

    // Monitor load time
    const measureLoadTime = () => {
      performanceData.current.loadTime = performance.now() - startTime.current
    }

    // Monitor render performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          performanceData.current.renderTime = entry.duration
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    // Check memory every 30 seconds
    const memoryInterval = setInterval(checkMemory, 30000)
    
    // Measure load time after initial render
    setTimeout(measureLoadTime, 100)

    return () => {
      observer.disconnect()
      clearInterval(memoryInterval)
    }
  }, [])

  return performanceData.current
}

// Memory leak prevention
export function useMemoryLeakPrevention() {
  const cleanupRefs = useRef<(() => void)[]>([])

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRefs.current.push(cleanup)
  }, [])

  useEffect(() => {
    return () => {
      // Run all cleanup functions on unmount
      cleanupRefs.current.forEach(cleanup => cleanup())
      cleanupRefs.current = []
    }
  }, [])

  return { addCleanup }
}

// Bundle optimization
export function useBundleOptimization() {
  const loadedModules = useRef<Set<string>>(new Set())

  const trackModuleLoad = useCallback((moduleName: string) => {
    loadedModules.current.add(moduleName)
    
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Module loaded: ${moduleName}`)
    }
  }, [])

  const getLoadedModules = useCallback(() => {
    return Array.from(loadedModules.current)
  }, [])

  return { trackModuleLoad, getLoadedModules }
}

// Image optimization
export function useImageOptimization() {
  const preloadImage = useCallback((src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })
  }, [])

  const lazyLoadImage = useCallback((src: string, placeholder?: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.src = src
      
      if (placeholder) {
        resolve(placeholder)
      }
    })
  }, [])

  return { preloadImage, lazyLoadImage }
}

// Debounced function for performance
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    }) as T,
    [callback, delay]
  )
}

// Throttled function for performance
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastCall.current >= delay) {
        callback(...args)
        lastCall.current = now
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }
        lastCallTimer.current = setTimeout(() => {
          callback(...args)
          lastCall.current = Date.now()
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [callback, options])

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element)
    }
  }, [])

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
    }
  }, [])

  return { observe, unobserve }
}




