-- Setup cron job for payout runner function
-- This assumes you have the Supabase cron extension enabled

-- Create a cron job that runs every hour
-- Adjust the schedule as needed: https://crontab.guru/
select cron.schedule(
    'payout-runner-hourly',  -- job name
    '0 * * * *',             -- every hour at minute 0
    $$select net.http_post(
        url:='https://hjebzdekquczudhrygns.supabase.co/functions/v1/payout-runner',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
    )$$
);

-- Alternative: Run every 30 minutes
-- select cron.schedule(
--     'payout-runner-30min',
--     '*/30 * * * *',
--     $$select net.http_post(
--         url:='https://hjebzdekquczudhrygns.supabase.co/functions/v1/payout-runner',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
--     )$$
-- );

-- To remove the job later:
-- select cron.unschedule('payout-runner-hourly');

-- To view all jobs:
-- select * from cron.job;