-- Create table for storing GitHub tokens securely
CREATE TABLE public.github_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  github_username TEXT,
  github_avatar_url TEXT,
  github_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.github_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own token
CREATE POLICY "Users can view their own token"
ON public.github_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own token
CREATE POLICY "Users can insert their own token"
ON public.github_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own token
CREATE POLICY "Users can update their own token"
ON public.github_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own token
CREATE POLICY "Users can delete their own token"
ON public.github_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_github_tokens_updated_at
BEFORE UPDATE ON public.github_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();