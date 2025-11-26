import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    size = 'md', 
    width, 
    height, 
    animation = 'pulse',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
      xl: 'h-12'
    }

    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg'
    }

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
      none: ''
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 dark:bg-gray-700',
          variantClasses[variant],
          animationClasses[animation],
          !width && !height && sizeClasses[size],
          className
        )}
        style={{
          width: width,
          height: height
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Specialized skeleton components
export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonProps & { lines?: number }>(
  ({ lines = 1, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            className={cn(
              index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-4 border border-gray-200 dark:border-gray-700 rounded-lg',
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          <Skeleton variant="rounded" height="h-4" width="w-3/4" />
          <SkeletonText lines={2} />
          <div className="flex space-x-2">
            <Skeleton variant="rounded" height="h-8" width="w-20" />
            <Skeleton variant="rounded" height="h-8" width="w-24" />
          </div>
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    }

    return (
      <Skeleton
        ref={ref}
        variant="circular"
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

export const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonProps & { variant?: 'default' | 'outline' }>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3',
      md: 'h-10 px-4',
      lg: 'h-11 px-8',
      xl: 'h-12 px-10'
    }

    const variantClasses = {
      default: 'bg-gray-200 dark:bg-gray-700',
      outline: 'border border-gray-200 dark:border-gray-700 bg-transparent'
    }

    return (
      <Skeleton
        ref={ref}
        variant="rounded"
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          'w-20',
          className
        )}
        {...props}
      />
    )
  }
)

SkeletonButton.displayName = 'SkeletonButton'

export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonProps & { rows?: number; columns?: number }>(
  ({ rows = 5, columns = 4, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="text"
              height="h-4"
              className="flex-1"
            />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                height="h-4"
                className="flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    )
  }
)

SkeletonTable.displayName = 'SkeletonTable'

export const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonProps & { items?: number }>(
  ({ items = 3, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        {...props}
      >
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <SkeletonAvatar size="sm" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" height="h-4" width="w-3/4" />
              <Skeleton variant="text" height="h-3" width="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }
)

SkeletonList.displayName = 'SkeletonList'

export const SkeletonDashboard = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Header */}
        <div className="space-y-2">
          <Skeleton variant="text" height="h-8" width="w-1/3" />
          <Skeleton variant="text" height="h-4" width="w-1/2" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }
)

SkeletonDashboard.displayName = 'SkeletonDashboard'

export { Skeleton }
