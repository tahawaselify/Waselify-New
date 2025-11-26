import React from 'react'

// Accessibility Utilities
// Comprehensive accessibility support for ARIA labels, keyboard navigation, focus management, and screen reader support

// ARIA Labels and Descriptions
export const ariaLabels = {
  // Navigation
  nav: {
    main: 'Main navigation',
    mobile: 'Mobile navigation menu',
    close: 'Close navigation menu',
    open: 'Open navigation menu',
    skip: 'Skip to main content',
    breadcrumb: 'Breadcrumb navigation'
  },

  // Forms
  form: {
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    fullName: 'Full name',
    company: 'Company name',
    message: 'Message',
    submit: 'Submit form',
    reset: 'Reset form',
    required: 'Required field',
    optional: 'Optional field'
  },

  // Buttons
  button: {
    primary: 'Primary action',
    secondary: 'Secondary action',
    danger: 'Dangerous action',
    close: 'Close',
    open: 'Open',
    expand: 'Expand',
    collapse: 'Collapse',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    refresh: 'Refresh',
    loading: 'Loading'
  },

  // Cards and Sections
  card: {
    workflow: 'Workflow card',
    feature: 'Feature card',
    testimonial: 'Testimonial card',
    pricing: 'Pricing card',
    dashboard: 'Dashboard card'
  },

  // Status Indicators
  status: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },

  // Interactive Elements
  interactive: {
    checkbox: 'Checkbox',
    radio: 'Radio button',
    select: 'Select dropdown',
    slider: 'Slider',
    tab: 'Tab',
    accordion: 'Accordion section',
    modal: 'Modal dialog',
    tooltip: 'Tooltip',
    menu: 'Menu'
  }
};

// Keyboard Navigation Support
export const keyboardNavigation = {
  // Key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  // Handle keyboard events
  handleKeyDown: (
    event: React.KeyboardEvent,
    handlers: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onHome?: () => void;
      onEnd?: () => void;
      onPageUp?: () => void;
      onPageDown?: () => void;
    }
  ) => {
    const { key } = event;

    switch (key) {
      case keyboardNavigation.keys.ENTER:
        event.preventDefault();
        handlers.onEnter?.();
        break;
      case keyboardNavigation.keys.SPACE:
        event.preventDefault();
        handlers.onSpace?.();
        break;
      case keyboardNavigation.keys.ESCAPE:
        event.preventDefault();
        handlers.onEscape?.();
        break;
      case keyboardNavigation.keys.ARROW_UP:
        event.preventDefault();
        handlers.onArrowUp?.();
        break;
      case keyboardNavigation.keys.ARROW_DOWN:
        event.preventDefault();
        handlers.onArrowDown?.();
        break;
      case keyboardNavigation.keys.ARROW_LEFT:
        event.preventDefault();
        handlers.onArrowLeft?.();
        break;
      case keyboardNavigation.keys.ARROW_RIGHT:
        event.preventDefault();
        handlers.onArrowRight?.();
        break;
      case keyboardNavigation.keys.HOME:
        event.preventDefault();
        handlers.onHome?.();
        break;
      case keyboardNavigation.keys.END:
        event.preventDefault();
        handlers.onEnd?.();
        break;
      case keyboardNavigation.keys.PAGE_UP:
        event.preventDefault();
        handlers.onPageUp?.();
        break;
      case keyboardNavigation.keys.PAGE_DOWN:
        event.preventDefault();
        handlers.onPageDown?.();
        break;
    }
  },

  // Focus management
  focus: {
    // Trap focus within an element
    trap: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      
      // Return cleanup function
      return () => {
        container.removeEventListener('keydown', handleTabKey);
      };
    },

    // Move focus to first focusable element
    moveToFirst: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    },

    // Move focus to last focusable element
    moveToLast: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
      }
    }
  }
};

// Screen Reader Support
export const screenReader = {
  // Announce messages to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Hide elements from screen readers
  hide: (element: HTMLElement) => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show elements to screen readers
  show: (element: HTMLElement) => {
    element.removeAttribute('aria-hidden');
  },

  // Make element focusable for screen readers
  makeFocusable: (element: HTMLElement) => {
    element.setAttribute('tabindex', '0');
  },

  // Make element not focusable
  makeUnfocusable: (element: HTMLElement) => {
    element.setAttribute('tabindex', '-1');
  }
};

// Accessibility Hooks
export const useAccessibility = () => {
  // Skip to main content
  const skipToMain = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      screenReader.announce('Navigated to main content');
    }
  };

  // Announce page changes
  const announcePageChange = (pageTitle: string) => {
    screenReader.announce(`Navigated to ${pageTitle}`, 'assertive');
  };

  // Handle form validation announcements
  const announceFormValidation = (isValid: boolean, message: string) => {
    if (!isValid) {
      screenReader.announce(`Error: ${message}`, 'assertive');
    }
  };

  // Handle loading state announcements
  const announceLoading = (isLoading: boolean, context: string) => {
    if (isLoading) {
      screenReader.announce(`${context} is loading`);
    } else {
      screenReader.announce(`${context} has finished loading`);
    }
  };

  return {
    skipToMain,
    announcePageChange,
    announceFormValidation,
    announceLoading
  };
};

// Accessibility Context
export const AccessibilityContext = React.createContext<{
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  skipToMain: () => void;
  announcePageChange: (pageTitle: string) => void;
}>({
  announce: () => {},
  skipToMain: () => {},
  announcePageChange: () => {}
});

// Accessibility Provider Component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { skipToMain, announcePageChange } = useAccessibility();

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.announce(message, priority);
  };

  return (
    <AccessibilityContext.Provider value={{
      announce,
      skipToMain,
      announcePageChange
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use accessibility context
export const useAccessibilityContext = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

// High Contrast Mode Detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced Motion Detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Color Scheme Detection
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
};

// Accessibility Utilities
export const accessibilityUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Check if element is visible to screen readers
  isVisibleToScreenReader: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.getAttribute('aria-hidden') !== 'true';
  },

  // Get accessible name for an element
  getAccessibleName: (element: HTMLElement) => {
    return element.getAttribute('aria-label') || 
           element.getAttribute('title') || 
           element.textContent?.trim() || 
           '';
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement) => {
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex !== '-1' && 
           (element.tagName === 'BUTTON' || 
            element.tagName === 'A' || 
            element.tagName === 'INPUT' || 
            element.tagName === 'SELECT' || 
            element.tagName === 'TEXTAREA' ||
            tabIndex !== null);
  }
};




