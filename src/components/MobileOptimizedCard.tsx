import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useMobileOptimization } from '@/hooks/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MobileOptimizedCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'elevated' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

const MobileOptimizedCard = forwardRef<HTMLDivElement, MobileOptimizedCardProps>(
  ({ 
    title, 
    description, 
    children, 
    className, 
    onClick, 
    disabled = false,
    loading = false,
    variant = 'default',
    size = 'md'
  }, ref) => {
    const { isMobile, isTouchDevice, shouldOptimize } = useMobileOptimization()

    const cardVariants = {
      default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
      elevated: 'bg-white border-0 shadow-lg hover:shadow-xl',
      outlined: 'bg-transparent border-2 border-gray-300 hover:border-gray-400'
    }

    const sizeVariants = {
      sm: 'p-3',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8'
    }

    const touchOptimizations = {
      // Larger touch targets on mobile
      minHeight: isMobile ? '44px' : 'auto',
      // Disable hover effects on touch devices
      hoverEffects: !isTouchDevice,
      // Optimize animations for mobile
      animationDuration: shouldOptimize ? '0.15s' : '0.3s'
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-300 relative overflow-hidden',
          cardVariants[variant],
          sizeVariants[size],
          // Mobile-specific optimizations
          isMobile && 'rounded-lg', // Smaller border radius on mobile
          isTouchDevice && 'active:scale-[0.98]', // Touch feedback
          !isTouchDevice && 'hover:scale-[1.02]', // Hover effect only on desktop
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'animate-pulse',
          onClick && !disabled && 'cursor-pointer',
          className
        )}
        style={{
          minHeight: touchOptimizations.minHeight,
          transitionDuration: touchOptimizations.animationDuration
        }}
        onClick={onClick && !disabled ? onClick : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500" />
          </div>
        )}

        {/* Card header */}
        {(title || description) && (
          <CardHeader className={cn(
            'pb-3',
            size === 'sm' && 'pb-2',
            size === 'lg' && 'pb-4'
          )}>
            {title && (
              <CardTitle className={cn(
                'text-lg font-semibold',
                isMobile && 'text-base',
                size === 'sm' && 'text-sm',
                size === 'lg' && 'text-xl'
              )}>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className={cn(
                'text-sm text-gray-600',
                isMobile && 'text-xs',
                size === 'sm' && 'text-xs',
                size === 'lg' && 'text-base'
              )}>
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}

        {/* Card content */}
        <CardContent className={cn(
          'pt-0',
          !title && !description && 'pt-0'
        )}>
          {children}
        </CardContent>

        {/* Touch feedback overlay for mobile */}
        {isTouchDevice && onClick && !disabled && (
          <div className="absolute inset-0 bg-black/0 transition-colors duration-150 active:bg-black/5 pointer-events-none" />
        )}
      </Card>
    )
  }
)

MobileOptimizedCard.displayName = 'MobileOptimizedCard'

export default MobileOptimizedCard




