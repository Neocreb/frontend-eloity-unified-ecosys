-- Create feature activations table
CREATE TABLE IF NOT EXISTS public.feature_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_activated BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  activation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.feature_activations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_activations
CREATE POLICY "Users can view their own feature activations" 
ON public.feature_activations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feature activations" 
ON public.feature_activations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature activations" 
ON public.feature_activations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feature activations" 
ON public.feature_activations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_activations_user_id ON public.feature_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_activations_feature_name ON public.feature_activations(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_activations_is_activated ON public.feature_activations(is_activated);
CREATE INDEX IF NOT EXISTS idx_feature_activations_activated_at ON public.feature_activations(activated_at);

-- Create trigger for updated_at
CREATE TRIGGER update_feature_activations_updated_at
  BEFORE UPDATE ON public.feature_activations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();