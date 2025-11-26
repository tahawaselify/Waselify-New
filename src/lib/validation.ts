// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
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
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Name is required');
  } else {
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (name.length > 50) {
      errors.push('Name must be less than 50 characters');
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name can only contain letters and spaces');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Company name validation
export const validateCompany = (company: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!company) {
    errors.push('Company name is required');
  } else {
    if (company.length < 2) {
      errors.push('Company name must be at least 2 characters long');
    }
    if (company.length > 100) {
      errors.push('Company name must be less than 100 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Message validation
export const validateMessage = (message: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!message) {
    errors.push('Message is required');
  } else {
    if (message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    if (message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    errors.push(...result.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};




