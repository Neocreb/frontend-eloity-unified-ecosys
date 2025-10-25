-- Create group_contributions table
CREATE TABLE IF NOT EXISTS public.group_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('fixed', 'custom')),
    target_amount NUMERIC,
    total_contributed NUMERIC DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'ELOITY',
    duration INTERVAL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'payout_pending')),
    escrow_wallet_id UUID,
    platform_fee NUMERIC DEFAULT 2.5,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_contributors table
CREATE TABLE IF NOT EXISTS public.group_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID NOT NULL REFERENCES public.group_contributions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ELOITY',
    payment_ref TEXT,
    wallet_tx_id UUID,
    contributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    refunded BOOLEAN DEFAULT false,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- Create group_votes table
CREATE TABLE IF NOT EXISTS public.group_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    required_percentage NUMERIC DEFAULT 60,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_vote_responses table
CREATE TABLE IF NOT EXISTS public.group_vote_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vote_id UUID NOT NULL REFERENCES public.group_votes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    choice TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_contributions_group_id ON public.group_contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_contributions_status ON public.group_contributions(status);
CREATE INDEX IF NOT EXISTS idx_group_contributions_created_by ON public.group_contributions(created_by);
CREATE INDEX IF NOT EXISTS idx_group_contributors_contribution_id ON public.group_contributors(contribution_id);
CREATE INDEX IF NOT EXISTS idx_group_contributors_user_id ON public.group_contributors(user_id);
CREATE INDEX IF NOT EXISTS idx_group_votes_group_id ON public.group_votes(group_id);
CREATE INDEX IF NOT EXISTS idx_group_votes_created_by ON public.group_votes(created_by);
CREATE INDEX IF NOT EXISTS idx_group_vote_responses_vote_id ON public.group_vote_responses(vote_id);
CREATE INDEX IF NOT EXISTS idx_group_vote_responses_user_id ON public.group_vote_responses(user_id);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.group_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_vote_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for group_contributions
CREATE POLICY "Users can view group contributions for their groups" ON public.group_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_contributions.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can create contributions" ON public.group_contributions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can update contributions" ON public.group_contributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can delete contributions" ON public.group_contributions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

-- Create policies for group_contributors
CREATE POLICY "Users can view contributors for their group contributions" ON public.group_contributors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = group_contributors.contribution_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own contributions" ON public.group_contributors
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Create policies for group_votes
CREATE POLICY "Users can view votes for their groups" ON public.group_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_votes.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create votes" ON public.group_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can update votes" ON public.group_votes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can delete votes" ON public.group_votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

-- Create policies for group_vote_responses
CREATE POLICY "Users can view vote responses for their group votes" ON public.group_vote_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_votes gv
            JOIN public.group_members gm ON gm.group_id = gv.group_id
            WHERE gv.id = group_vote_responses.vote_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own vote responses" ON public.group_vote_responses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own vote responses" ON public.group_vote_responses
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own vote responses" ON public.group_vote_responses
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Grant necessary permissions
GRANT ALL ON public.group_contributions TO authenticated;
GRANT ALL ON public.group_contributors TO authenticated;
GRANT ALL ON public.group_votes TO authenticated;
GRANT ALL ON public.group_vote_responses TO authenticated;

-- Create function to update total_contributed when a new contribution is made
CREATE OR REPLACE FUNCTION update_total_contributed()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.group_contributions 
        SET total_contributed = total_contributed + NEW.amount
        WHERE id = NEW.contribution_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.group_contributions 
        SET total_contributed = total_contributed - OLD.amount
        WHERE id = OLD.contribution_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total_contributed
CREATE TRIGGER update_total_contributed_trigger
    AFTER INSERT OR DELETE ON public.group_contributors
    FOR EACH ROW
    EXECUTE FUNCTION update_total_contributed();