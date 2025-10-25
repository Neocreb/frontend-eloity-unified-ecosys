-- Create freelance_messages table
CREATE TABLE IF NOT EXISTS public.freelance_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.freelance_projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    attachments JSONB,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'file', 'milestone', 'payment'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_freelance_messages_project_id ON public.freelance_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_freelance_messages_sender_id ON public.freelance_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_freelance_messages_created_at ON public.freelance_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_freelance_messages_read ON public.freelance_messages(read);

-- Enable RLS (Row Level Security)
ALTER TABLE public.freelance_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view messages in their projects" ON public.freelance_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.freelance_projects 
            WHERE freelance_projects.id = freelance_messages.project_id 
            AND (freelance_projects.client_id = auth.uid() OR freelance_projects.freelancer_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their projects" ON public.freelance_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.freelance_projects 
            WHERE freelance_projects.id = freelance_messages.project_id 
            AND (freelance_projects.client_id = auth.uid() OR freelance_projects.freelancer_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON public.freelance_messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON public.freelance_messages TO authenticated;