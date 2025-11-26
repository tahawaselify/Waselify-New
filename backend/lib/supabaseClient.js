const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables. Using mock client.');
  console.warn('   Please ensure your .env file has:');
  console.warn('   SUPABASE_URL=your_supabase_url');
  console.warn('   SUPABASE_ANON_KEY=your_anon_key');
  
  // Create a mock client that won't crash the server
  const mockSupabase = {
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: { message: 'Supabase not configured' } }),
      getUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      refreshSession: async () => ({ data: null, error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) })
    })
  };
  
  module.exports = { supabase: mockSupabase };
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  module.exports = { supabase };
} 