// Centralized environment configuration
interface EnvironmentConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
  };
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: string;
      redirectUri: string;
    };
  };
  
  // App Configuration
  app: {
    environment: 'development' | 'production' | 'test';
    debug: boolean;
  };
}

// Environment variable validation
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Build configuration object
const buildConfig = (): EnvironmentConfig => {
  const env = import.meta.env;
  
  return {
    supabase: {
      url: validateEnvVar('VITE_SUPABASE_URL', env.VITE_SUPABASE_URL),
      anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY),
    },
    
    api: {
      baseUrl: validateEnvVar('VITE_API_BASE_URL', env.VITE_API_BASE_URL),
    },
    
    oauth: {
      google: {
        clientId: validateEnvVar('VITE_GOOGLE_CLIENT_ID', env.VITE_GOOGLE_CLIENT_ID),
        redirectUri: validateEnvVar('VITE_GOOGLE_REDIRECT_URI', env.VITE_GOOGLE_REDIRECT_URI),
      },
    },
    
    app: {
      environment: (env.MODE as 'development' | 'production' | 'test') || 'development',
      debug: env.MODE === 'development',
    },
  };
};

// Export configuration
export const config = buildConfig();

// Export individual config sections for convenience
export const { supabase, api, oauth, app } = config;

// Type exports
export type { EnvironmentConfig };


