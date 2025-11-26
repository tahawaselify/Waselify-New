import React from 'react'

// Performance Monitoring & Analytics
// Comprehensive performance tracking, user analytics, and optimization monitoring

import { useCallback, useEffect, useRef } from 'react'

// Performance Metrics Interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
  
  // Custom Metrics
  appLoadTime: number
  componentRenderTime: number
  apiResponseTime: number
  memoryUsage: number
  
  // User Interaction Metrics
  timeToInteractive: number
  firstMeaningfulPaint: number
  domContentLoaded: number
  windowLoad: number
}

// User Interaction Tracking
interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'error'
  element: string
  timestamp: number
  duration?: number
  metadata?: Record<string, any>
}

// Performance Monitoring Class
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
    appLoadTime: 0,
    componentRenderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    timeToInteractive: 0,
    firstMeaningfulPaint: 0,
    domContentLoaded: 0,
    windowLoad: 0
  }

  private interactions: UserInteraction[] = []
  private observers: PerformanceObserver[] = []
  private startTime: number = performance.now()

  constructor() {
    this.initializeObservers()
    this.trackCoreWebVitals()
    this.trackCustomMetrics()
  }

  // Initialize Performance Observers
  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        this.logMetric('LCP', this.metrics.lcp)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.logMetric('FID', this.metrics.fid)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.cls = clsValue
        this.logMetric('CLS', this.metrics.cls)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      this.observers.push(lcpObserver, fidObserver, clsObserver)
    }
  }

  // Track Core Web Vitals
  private trackCoreWebVitals() {
    // TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      this.logMetric('TTFB', this.metrics.ttfb)
    }

    // FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
      this.metrics.fcp = fcpEntry.startTime
      this.logMetric('FCP', this.metrics.fcp)
    }

    // DOM Content Loaded
    this.metrics.domContentLoaded = navigationEntry?.domContentLoadedEventEnd - navigationEntry?.domContentLoadedEventStart || 0
    this.logMetric('DOMContentLoaded', this.metrics.domContentLoaded)

    // Window Load
    this.metrics.windowLoad = navigationEntry?.loadEventEnd - navigationEntry?.loadEventStart || 0
    this.logMetric('WindowLoad', this.metrics.windowLoad)
  }

  // Track Custom Metrics
  private trackCustomMetrics() {
    // App Load Time
    this.metrics.appLoadTime = performance.now() - this.startTime
    this.logMetric('AppLoadTime', this.metrics.appLoadTime)

    // Memory Usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      this.logMetric('MemoryUsage', this.metrics.memoryUsage)
    }

    // Time to Interactive (approximation)
    this.metrics.timeToInteractive = this.metrics.domContentLoaded + 1000 // Rough estimate
    this.logMetric('TimeToInteractive', this.metrics.timeToInteractive)
  }

  // Track Component Render Time
  trackComponentRender(componentName: string, renderTime: number) {
    this.metrics.componentRenderTime = renderTime
    this.logMetric(`ComponentRender_${componentName}`, renderTime)
  }

  // Track API Response Time
  trackApiResponse(endpoint: string, responseTime: number) {
    this.metrics.apiResponseTime = responseTime
    this.logMetric(`API_${endpoint}`, responseTime)
  }

  // Track User Interactions
  trackInteraction(interaction: UserInteraction) {
    this.interactions.push(interaction)
    this.logInteraction(interaction)
  }

  // Track Errors
  trackError(error: Error, context?: string) {
    this.trackInteraction({
      type: 'error',
      element: context || 'unknown',
      timestamp: performance.now(),
      metadata: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    })
  }

  // Log Metrics
  private logMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`)
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('metric', { name, value })
    }
  }

  // Log Interactions
  private logInteraction(interaction: UserInteraction) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`👆 Interaction: ${interaction.type} on ${interaction.element}`)
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('interaction', interaction)
    }
  }

  // Send to Analytics Service
  private sendToAnalytics(type: string, data: any) {
    // In production, send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    try {
      // Example implementation
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() })
      }).catch(() => {
        // Silently fail if analytics service is unavailable
      })
    } catch (error) {
      // Silently fail
    }
  }

  // Get Performance Report
  getPerformanceReport(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Get Interaction History
  getInteractionHistory(): UserInteraction[] {
    return [...this.interactions]
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
  }
}

// Global Performance Monitor Instance
export const performanceMonitor = new PerformanceMonitor()

// Performance Hooks
export const usePerformanceTracking = () => {
  const renderStartTime = useRef<number>(0)

  const startRenderTracking = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  const endRenderTracking = useCallback((componentName: string) => {
    const renderTime = performance.now() - renderStartTime.current
    performanceMonitor.trackComponentRender(componentName, renderTime)
  }, [])

  const trackInteraction = useCallback((type: UserInteraction['type'], element: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackInteraction({
      type,
      element,
      timestamp: performance.now(),
      metadata
    })
  }, [])

  const trackError = useCallback((error: Error, context?: string) => {
    performanceMonitor.trackError(error, context)
  }, [])

  return {
    startRenderTracking,
    endRenderTracking,
    trackInteraction,
    trackError
  }
}

// Component Performance Wrapper
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { startRenderTracking, endRenderTracking } = usePerformanceTracking()

    useEffect(() => {
      startRenderTracking()
      return () => {
        endRenderTracking(componentName)
      }
    }, [startRenderTracking, endRenderTracking])

    return <WrappedComponent {...props} ref={ref} />
  })
}

// Bundle Size Monitoring
export const useBundleSizeMonitoring = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor bundle size in development
      const scriptElements = document.querySelectorAll('script[src]')
      let totalSize = 0

      scriptElements.forEach(script => {
        const src = script.getAttribute('src')
        if (src && src.includes('assets')) {
          // Estimate size based on URL patterns
          totalSize += 100 // Rough estimate
        }
      })

      console.log(`📦 Estimated Bundle Size: ${totalSize}KB`)
    }
  }, [])
}

// Memory Leak Detection
export const useMemoryLeakDetection = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory
          const usedMB = memory.usedJSHeapSize / 1024 / 1024
          const totalMB = memory.totalJSHeapSize / 1024 / 1024
          
          if (usedMB > totalMB * 0.8) {
            console.warn('⚠️ High memory usage detected:', usedMB.toFixed(2), 'MB')
          }
        }
      }

      const interval = setInterval(checkMemory, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [])
}

// Network Performance Monitoring
export const useNetworkMonitoring = () => {
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const logNetworkInfo = () => {
        console.log('🌐 Network Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }

      connection.addEventListener('change', logNetworkInfo)
      logNetworkInfo()

      return () => connection.removeEventListener('change', logNetworkInfo)
    }
  }, [])
}

// Performance Optimization Utilities
export const performanceUtils = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },

  // Lazy load images
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src
          observer.unobserve(img)
        }
      })
    })
    observer.observe(img)
  },

  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

// Performance Context
export const PerformanceContext = React.createContext<{
  trackInteraction: (type: UserInteraction['type'], element: string, metadata?: Record<string, any>) => void
  trackError: (error: Error, context?: string) => void
  getMetrics: () => PerformanceMetrics
}>({
  trackInteraction: () => {},
  trackError: () => {},
  getMetrics: () => performanceMonitor.getPerformanceReport()
})

// Performance Provider
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackInteraction, trackError } = usePerformanceTracking()

  const getMetrics = useCallback(() => {
    return performanceMonitor.getPerformanceReport()
  }, [])

  return (
    <PerformanceContext.Provider value={{
      trackInteraction,
      trackError,
      getMetrics
    }}>
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook to use performance context
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}




