// Frontend Security Utilities
// Comprehensive input sanitization, XSS protection, and security validation

// XSS Protection - Sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Input sanitization for different types
export const sanitizeInput = {
  // Text input sanitization
  text: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  },

  // Email sanitization
  email: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .toLowerCase()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 254); // RFC 5321 limit
  },

  // URL sanitization
  url: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    const sanitized = input
      .trim()
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
    
    // Only allow http/https URLs
    if (sanitized && !sanitized.match(/^https?:\/\//)) {
      return `https://${sanitized}`;
    }
    
    return sanitized;
  },

  // Phone number sanitization
  phone: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[^\d+\-\(\)\s]/g, '') // Only allow digits, +, -, (, ), spaces
      .substring(0, 20); // Limit length
  },

  // Name sanitization
  name: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[^\w\s\-\.]/g, '') // Only allow letters, numbers, spaces, hyphens, dots
      .substring(0, 100); // Limit length
  },

  // Message/description sanitization
  message: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .substring(0, 2000); // Limit length
  }
};

// CSRF Protection
export const getCsrfToken = (): string => {
  // Get CSRF token from meta tag or localStorage
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const storedToken = localStorage.getItem('csrf-token');
  
  return metaToken || storedToken || '';
};

export const setCsrfToken = (token: string): void => {
  localStorage.setItem('csrf-token', token);
};

// Rate limiting for frontend
export class FrontendRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  clearOldRequests(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Secure storage utilities
export const secureStorage = {
  // Store sensitive data with encryption (basic implementation)
  set: (key: string, value: string): void => {
    try {
      // In production, use proper encryption
      const encoded = btoa(encodeURIComponent(value));
      localStorage.setItem(`secure_${key}`, encoded);
    } catch (error) {
      console.error('Failed to store secure data:', error);
    }
  },

  // Retrieve sensitive data
  get: (key: string): string | null => {
    try {
      const encoded = localStorage.getItem(`secure_${key}`);
      if (!encoded) return null;
      
      return decodeURIComponent(atob(encoded));
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  },

  // Remove sensitive data
  remove: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },

  // Clear all secure data
  clear: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Content Security Policy validation
export const validateCSP = (): boolean => {
  try {
    // Check if CSP is properly configured
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return !!meta;
  } catch {
    return false;
  }
};

// Security headers validation
export const validateSecurityHeaders = async (): Promise<Record<string, boolean>> => {
  try {
    const response = await fetch('/api/health', { method: 'HEAD' });
    const headers = response.headers;
    
    return {
      hsts: headers.get('strict-transport-security') !== null,
      csp: headers.get('content-security-policy') !== null,
      xFrameOptions: headers.get('x-frame-options') !== null,
      xContentTypeOptions: headers.get('x-content-type-options') !== null,
      referrerPolicy: headers.get('referrer-policy') !== null
    };
  } catch {
    return {
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentTypeOptions: false,
      referrerPolicy: false
    };
  }
};

// Input validation with security checks
export const validateInput = {
  // Email validation with security checks
  email: (email: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    const sanitized = sanitizeInput.email(email);
    if (sanitized !== email) {
      errors.push('Email contains invalid characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      errors.push('Please enter a valid email address');
    }

    // Check for suspicious patterns
    if (sanitized.includes('javascript:') || sanitized.includes('<script>')) {
      errors.push('Email contains suspicious content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Password validation with security checks
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Name validation with security checks
  name: (name: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Name is required');
      return { isValid: false, errors };
    }

    const sanitized = sanitizeInput.name(name);
    if (sanitized !== name) {
      errors.push('Name contains invalid characters');
    }

    if (sanitized.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (sanitized.length > 50) {
      errors.push('Name must be less than 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Security monitoring
export const securityMonitor = {
  // Log security events
  logEvent: (event: string, details?: any): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 SECURITY: ${event}`, details);
    }
    
    // In production, send to security monitoring service
    // Example: Sentry, LogRocket, or custom security logging
  },

  // Monitor for suspicious activity
  detectSuspiciousActivity: (action: string, data?: any): boolean => {
    // Basic suspicious activity detection
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:text\/html/i
    ];

    const dataString = JSON.stringify(data || '');
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(dataString)) {
        securityMonitor.logEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
          action,
          data: dataString,
          pattern: pattern.source
        });
        return true;
      }
    }

    return false;
  }
};

// Export rate limiter instance
export const rateLimiter = new FrontendRateLimiter(60000, 10); // 10 requests per minute




