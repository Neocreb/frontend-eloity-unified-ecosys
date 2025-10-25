# Payout Runner Function

This Supabase edge function automatically processes completed group contributions by calculating fees, creating payout records, and initiating external payouts.

## Functionality

- Identifies group contributions that have ended (end_date <= now and status = 'active')
- Calculates platform fees (default 2.5%)
- Creates payout records in the `contribution_payouts` table
- Updates contribution status to 'payout_pending'
- Processes external payouts in the background
- Updates payout status based on processing results

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for full database access
- `PAYOUT_ENDPOINT` - (Optional) External endpoint to process actual payouts

## Deployment

```bash
supabase functions deploy payout-runner
```

## Setup Cron Job

To run this function automatically, set up a cron job:

```sql
select cron.schedule(
    'payout-runner-hourly',
    '0 * * * *',  -- Every hour
    $$select net.http_post(
        url:='https://your-project.supabase.co/functions/v1/payout-runner',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    )$$
);
```

## Manual Trigger

To manually trigger the function:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/payout-runner \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Response Format

```json
{
  "results": [
    {
      "id": "contribution-uuid",
      "ok": true,
      "payout_id": "payout-uuid"
    },
    {
      "id": "contribution-uuid",
      "ok": false,
      "error": "Error message"
    }
  ]
}
```

## Error Handling

The function includes comprehensive error handling:
- Database connection errors
- Fetch failures
- Payout processing errors
- External API failures

All errors are logged and returned in the response for debugging.