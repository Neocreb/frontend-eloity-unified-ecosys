-- Create feature configurations table
CREATE TABLE IF NOT EXISTS public.feature_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.feature_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_configurations
CREATE POLICY "Users can view their own feature configurations" 
ON public.feature_configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feature configurations" 
ON public.feature_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature configurations" 
ON public.feature_configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feature configurations" 
ON public.feature_configurations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_configurations_user_id ON public.feature_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_configurations_feature_name ON public.feature_configurations(feature_name);

-- Create trigger for updated_at
CREATE TRIGGER update_feature_configurations_updated_at
  BEFORE UPDATE ON public.feature_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();