-- Create contribution_payouts table
CREATE TABLE IF NOT EXISTS public.contribution_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID NOT NULL REFERENCES public.group_contributions(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    net_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contribution_payouts_contribution_id ON public.contribution_payouts(contribution_id);
CREATE INDEX IF NOT EXISTS idx_contribution_payouts_status ON public.contribution_payouts(status);

-- Enable RLS (Row Level Security) on the table
ALTER TABLE public.contribution_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for contribution_payouts
CREATE POLICY "Group members can view payouts for their contributions" ON public.contribution_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = contribution_payouts.contribution_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payouts" ON public.contribution_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = contribution_payouts.contribution_id
            AND gm.user_id = auth.uid()
            AND gm.role IN ('admin', 'creator')
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.contribution_payouts TO authenticated;

-- Create function to update contribution status when payout is completed
CREATE OR REPLACE FUNCTION update_contribution_status_on_payout()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.group_contributions 
        SET status = 'completed', updated_at = NOW()
        WHERE id = NEW.contribution_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update contribution status
CREATE TRIGGER update_contribution_status_trigger
    AFTER UPDATE ON public.contribution_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_contribution_status_on_payout();