-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create session_history table
CREATE TABLE IF NOT EXISTS session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id);
CREATE INDEX IF NOT EXISTS idx_session_history_session_start ON session_history(session_start DESC);

-- Enable Row Level Security
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view their own session history" ON session_history;
DROP POLICY IF EXISTS "Users can insert their own session history" ON session_history;
DROP POLICY IF EXISTS "Users can update their own session history" ON session_history;

-- Create policy to allow users to read their own session history
CREATE POLICY "Users can view their own session history"
  ON session_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own session history
CREATE POLICY "Users can insert their own session history"
  ON session_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own session history
CREATE POLICY "Users can update their own session history"
  ON session_history
  FOR UPDATE
  USING (auth.uid() = user_id);

