-- Family Dinner Picker - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to create the required table

-- Create the dinner_selections table
CREATE TABLE IF NOT EXISTS dinner_selections (
  id SERIAL PRIMARY KEY,
  environment VARCHAR(20) NOT NULL DEFAULT 'development',
  date DATE NOT NULL,
  person VARCHAR(50) NOT NULL,
  starter VARCHAR(100),
  main VARCHAR(100),
  dessert VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(environment, date, person)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dinner_selections_env_date 
ON dinner_selections(environment, date);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE dinner_selections ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations" ON dinner_selections
  FOR ALL USING (true);

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'dinner_selections'
ORDER BY ordinal_position;

-- ==========================================
-- IF TABLE ALREADY EXISTS, RUN THIS TO ADD DESSERT COLUMN:
-- ==========================================

-- Add dessert column to existing table
-- ALTER TABLE dinner_selections ADD COLUMN dessert VARCHAR(100);

-- ==========================================
-- VERIFY THE COLUMN WAS ADDED:
-- ==========================================

-- Check table structure after adding dessert column
-- SELECT 
--   table_name, 
--   column_name, 
--   data_type, 
--   is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'dinner_selections'
-- ORDER BY ordinal_position; 