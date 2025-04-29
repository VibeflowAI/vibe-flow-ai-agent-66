
-- Create a logs table to track agent interactions
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to protect logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Users can view only their own logs
CREATE POLICY "Users can view their own logs" 
  ON public.logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert only their own logs
CREATE POLICY "Users can insert their own logs" 
  ON public.logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX logs_user_id_idx ON public.logs(user_id);
CREATE INDEX logs_event_type_idx ON public.logs(event_type);
CREATE INDEX logs_created_at_idx ON public.logs(created_at);
