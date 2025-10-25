// payout-runner/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.info('payout-runner started');

serve(async (req: Request) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const PAYOUT_ENDPOINT = Deno.env.get('PAYOUT_ENDPOINT');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing environment variables' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client with service role key for full access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Query contributions that should be finalized: end_date <= now and status = 'active'
    const { data: contributions, error: fetchError } = await supabase
      .from('group_contributions')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', new Date().toISOString());

    if (fetchError) {
      console.error('Failed to fetch contributions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch contributions', details: fetchError.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results: { id: string; ok: boolean; payout_id?: string; error?: string }[] = [];

    for (const contribution of contributions) {
      try {
        // Compute fees
        const total = Number(contribution.total_contributed || 0);
        const platformFeePercent = Number(contribution.platform_fee || 2.5);
        const platformFee = (total * platformFeePercent) / 100;
        const net = total - platformFee;

        // Create payout record
        const { data: payoutData, error: payoutError } = await supabase
          .from('contribution_payouts')
          .insert({
            contribution_id: contribution.id,
            total_amount: total,
            platform_fee: platformFee,
            net_amount: net,
            status: 'processing'
          })
          .select()
          .single();

        if (payoutError) {
          results.push({ 
            id: contribution.id, 
            ok: false, 
            error: `Failed to create payout record: ${payoutError.message}` 
          });
          continue;
        }

        const payoutId = payoutData.id;

        // Update contribution status to payout_pending
        const { error: updateError } = await supabase
          .from('group_contributions')
          .update({ status: 'payout_pending', updated_at: new Date().toISOString() })
          .eq('id', contribution.id);

        if (updateError) {
          results.push({ 
            id: contribution.id, 
            ok: false, 
            error: `Failed to update contribution status: ${updateError.message}` 
          });
          continue;
        }

        // Process payout in background
        const processPayout = async () => {
          if (PAYOUT_ENDPOINT) {
            try {
              const payResponse = await fetch(PAYOUT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  payout_id: payoutId, 
                  amount: net, 
                  contribution_id: contribution.id,
                  currency: contribution.currency
                })
              });

              if (payResponse.ok) {
                // Update payout status to completed
                const { error: updatePayoutError } = await supabase
                  .from('contribution_payouts')
                  .update({ 
                    status: 'completed', 
                    processed_at: new Date().toISOString() 
                  })
                  .eq('id', payoutId);

                if (updatePayoutError) {
                  console.error(`Failed to update payout status for ${payoutId}:`, updatePayoutError);
                }
              } else {
                const errorText = await payResponse.text();
                // Update payout status to failed
                const { error: updatePayoutError } = await supabase
                  .from('contribution_payouts')
                  .update({ 
                    status: 'failed', 
                    metadata: { error: errorText } 
                  })
                  .eq('id', payoutId);

                if (updatePayoutError) {
                  console.error(`Failed to update payout status for ${payoutId}:`, updatePayoutError);
                }
              }
            } catch (e) {
              // Update payout status to failed with error
              const { error: updatePayoutError } = await supabase
                .from('contribution_payouts')
                .update({ 
                  status: 'failed', 
                  metadata: { error: e instanceof Error ? e.message : 'Unknown error' } 
                })
                .eq('id', payoutId);

              if (updatePayoutError) {
                console.error(`Failed to update payout status for ${payoutId}:`, updatePayoutError);
              }
            }
          }
        };

        // Run payout processing in background
        try {
          if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
            EdgeRuntime.waitUntil(processPayout());
          } else {
            // Fallback for local development
            processPayout();
          }
        } catch {
          // Ignore if EdgeRuntime is not available
          processPayout();
        }

        results.push({ id: contribution.id, ok: true, payout_id: payoutId });
      } catch (e) {
        console.error(`Error processing contribution ${contribution.id}:`, e);
        results.push({ 
          id: contribution.id, 
          ok: false, 
          error: e instanceof Error ? e.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({ results }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Internal error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: e instanceof Error ? e.message : 'Unknown error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});