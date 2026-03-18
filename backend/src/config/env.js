import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  supabaseUrl: process.env.SUPABASE_URL || 'https://qljzsiwixcuegmnrkdds.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsanpzaXdpeGN1ZWdtbnJrZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQ0NTIsImV4cCI6MjA4NDQ4MDQ1Mn0.MeHkiCSAgvMV5wvCSZWe-jla7D2Et6ZfUrz7s4bXxg4',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsanpzaXdpeGN1ZWdtbnJrZGRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkwNDQ1MiwiZXhwIjoyMDg0NDgwNDUyfQ.mg4xVUqG6juI0-lGwXJCADbjea7v1xYAiIHx6lPTBB0',
};
