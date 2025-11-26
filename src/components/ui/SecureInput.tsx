import React, { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { sanitizeInput, validateInput, securityMonitor } from '@/lib/security'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: 'text' | 'email' | 'password' | 'url' | 'phone' | 'name' | 'message'
  validation?: 'email' | 'password' | 'name' | 'none'
  onSecureChange?: (value: string, isValid: boolean) => void
  showValidation?: boolean
  errorMessage?: string
  successMessage?: string
}

const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    type = 'text',
    validation = 'none',
    className,
    value,
    onChange,
    onSecureChange,
    showValidation = false,
    errorMessage,
    successMessage,
    ...props 
  }, ref) => {
    const [inputValue, setInputValue] = useState(value || '')
    const [isValid, setIsValid] = useState(true)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isFocused, setIsFocused] = useState(false)

    // Sanitize input based on type
    const sanitizeValue = (value: string): string => {
      switch (type) {
        case 'email':
          return sanitizeInput.email(value)
        case 'url':
          return sanitizeInput.url(value)
        case 'phone':
          return sanitizeInput.phone(value)
        case 'name':
          return sanitizeInput.name(value)
        case 'message':
          return sanitizeInput.message(value)
        default:
          return sanitizeInput.text(value)
      }
    }

    // Validate input based on validation type
    const validateValue = (value: string): { isValid: boolean; errors: string[] } => {
      switch (validation) {
        case 'email':
          return validateInput.email(value)
        case 'password':
          return validateInput.password(value)
        case 'name':
          return validateInput.name(value)
        default:
          return { isValid: true, errors: [] }
      }
    }

    // Handle input change with sanitization and validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const sanitizedValue = sanitizeValue(rawValue)
      
      // Check for suspicious activity
      if (securityMonitor.detectSuspiciousActivity('input_change', rawValue)) {
        securityMonitor.logEvent('SUSPICIOUS_INPUT_DETECTED', {
          field: props.name || 'unknown',
          value: rawValue
        })
        return // Block suspicious input
      }

      // Update state
      setInputValue(sanitizedValue)
      
      // Validate if validation is enabled
      if (validation !== 'none') {
        const validationResult = validateValue(sanitizedValue)
        setIsValid(validationResult.isValid)
        setValidationErrors(validationResult.errors)
      } else {
        setIsValid(true)
        setValidationErrors([])
      }

      // Call original onChange if provided
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: sanitizedValue
          }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }

      // Call secure change callback
      if (onSecureChange) {
        onSecureChange(sanitizedValue, validation === 'none' ? true : isValid)
      }
    }

    // Update internal state when external value changes
    useEffect(() => {
      if (value !== undefined) {
        const sanitized = sanitizeValue(String(value))
        setInputValue(sanitized)
        
        if (validation !== 'none') {
          const validationResult = validateValue(sanitized)
          setIsValid(validationResult.isValid)
          setValidationErrors(validationResult.errors)
        }
      }
    }, [value, type, validation])

    // Clear old validation errors when input is empty
    useEffect(() => {
      if (!inputValue && validation !== 'none') {
        setIsValid(true)
        setValidationErrors([])
      }
    }, [inputValue, validation])

    const getInputType = (): string => {
      switch (type) {
        case 'email':
          return 'email'
        case 'password':
          return 'password'
        case 'url':
          return 'url'
        case 'phone':
          return 'tel'
        default:
          return 'text'
      }
    }

    const getPlaceholder = (): string => {
      switch (type) {
        case 'email':
          return 'Enter your email address'
        case 'password':
          return 'Enter your password'
        case 'url':
          return 'Enter website URL'
        case 'phone':
          return 'Enter phone number'
        case 'name':
          return 'Enter your name'
        case 'message':
          return 'Enter your message'
        default:
          return props.placeholder || 'Enter text'
      }
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type={getInputType()}
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={getPlaceholder()}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            // Validation states
            !isValid && "border-red-500 focus-visible:ring-red-500",
            isValid && inputValue && "border-green-500 focus-visible:ring-green-500",
            // Focus state
            isFocused && "ring-2 ring-blue-500",
            className
          )}
          {...props}
        />
        
        {/* Validation indicator */}
        {showValidation && inputValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}

        {/* Error message */}
        {(!isValid || errorMessage) && (
          <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMessage || validationErrors[0]}
          </div>
        )}

        {/* Success message */}
        {successMessage && isValid && inputValue && (
          <div className="mt-1 text-sm text-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {successMessage}
          </div>
        )}

        {/* Validation details */}
        {showValidation && validationErrors.length > 1 && (
          <div className="mt-1 text-xs text-gray-500">
            <ul className="list-disc list-inside">
              {validationErrors.slice(1).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
)

SecureInput.displayName = 'SecureInput'

export { SecureInput }




