// Copy this file to .env and fill in your actual values
module.exports = {
  // Supabase Configuration
  SUPABASE_URL: 'your_supabase_url_here',
  SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key_here',
  
  // n8n Configuration
  N8N_URL: 'http://localhost:5678',
  N8N_API_KEY: 'your_n8n_api_key_here',
  
  // Server Configuration
  PORT: 3001,
  NODE_ENV: 'development',
  FRONTEND_URL: 'http://localhost:8083',
  
  // Database Configuration (if needed)
  DATABASE_URL: 'your_database_url_here',
  
  // Security
  JWT_SECRET: 'your_jwt_secret_here'
}; 