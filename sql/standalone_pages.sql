-- Standalone Pages Table
-- Run this in your Supabase SQL Editor

-- Create the standalone_pages table
CREATE TABLE IF NOT EXISTS standalone_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  content_json JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_standalone_pages_user_id ON standalone_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_standalone_pages_slug ON standalone_pages(slug);
CREATE INDEX IF NOT EXISTS idx_standalone_pages_status ON standalone_pages(status);

-- Enable Row Level Security
ALTER TABLE standalone_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own pages
CREATE POLICY "Users can view own pages" ON standalone_pages
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own pages
CREATE POLICY "Users can insert own pages" ON standalone_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pages
CREATE POLICY "Users can update own pages" ON standalone_pages
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own pages
CREATE POLICY "Users can delete own pages" ON standalone_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON standalone_pages TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_standalone_pages_updated_at
  BEFORE UPDATE ON standalone_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Admin role table for managing users
CREATE TABLE IF NOT EXISTS standalone_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_standalone_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM standalone_admins WHERE user_id = check_user_id);
END;
$$ language 'plpgsql' SECURITY DEFINER;
