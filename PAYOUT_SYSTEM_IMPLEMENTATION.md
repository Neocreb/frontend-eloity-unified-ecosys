# Payout System Implementation

This document summarizes the implementation of the Group Contribution Payout System for the Eloity app.

## Overview

The payout system automatically processes completed group contributions by:
1. Identifying contributions that have ended
2. Calculating platform fees
3. Creating payout records
4. Updating contribution statuses
5. Processing external payouts
6. Providing status tracking

## Components Implemented

### 1. Database Schema

**New Table: `contribution_payouts`**
- Tracks all contribution payouts
- Stores fee calculations
- Maintains processing status
- Links to contributions

**Enhanced Table: `group_contributions`**
- Added status tracking for payout processing
- Enhanced with automated status updates

### 2. Edge Function: `payout-runner`

A Supabase edge function that:
- Runs periodically to process ended contributions
- Calculates 2.5% platform fees by default
- Creates payout records in the database
- Updates contribution status to "payout_pending"
- Processes external payouts in the background
- Updates payout status based on processing results

### 3. Frontend Components

**GroupContributionPayoutStatus**
- Displays payout information for completed contributions
- Shows status, amounts, and processing details
- Displays errors if payouts fail

**Enhanced GroupContributionStatus**
- Integrates payout status display
- Shows payout information only for ended contributions

### 4. Service Layer

**GroupContributionService enhancements:**
- Added methods to fetch payout information
- Added manual payout triggering capability
- Enhanced contributor data fetching with user details

### 5. Type Definitions

**New Interface: `ContributionPayout`**
- Defines the structure for payout records
- Includes all necessary fields for tracking

## Key Features

### Automated Processing
- Runs automatically via cron job
- Processes all eligible contributions in batches
- Handles errors gracefully without stopping

### Fee Calculation
- Default 2.5% platform fee
- Configurable per contribution
- Automatically calculated and tracked

### Status Tracking
- Detailed status tracking (pending, processing, completed, failed)
- Error logging for failed payouts
- Automatic contribution status updates

### Security
- Uses service role key for full database access
- Row-level security policies
- Proper error handling and logging

### Background Processing
- External payout processing runs in background
- Non-blocking operations
- EdgeRuntime.waitUntil support for Supabase

## Deployment Instructions

1. Apply the database migration:
   ```sql
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
   ```

2. Deploy the edge function:
   ```bash
   supabase functions deploy payout-runner
   ```

3. Set up environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PAYOUT_ENDPOINT` (optional)

4. Set up cron job to run periodically:
   ```sql
   select cron.add_job('payout-runner', '0 * * * *', 'https://<project_ref>.supabase.co/functions/v1/payout-runner');
   ```

## API Endpoints

### Payout Runner Function
- **URL**: `https://<project_ref>.supabase.co/functions/v1/payout-runner`
- **Method**: POST
- **Auth**: Service role key required
- **Response**: JSON with processing results

## Error Handling

The system includes comprehensive error handling:
- Database connection errors
- Fetch failures
- Payout processing errors
- External API failures
- Graceful degradation

## Future Enhancements

1. **Manual Payout Triggering**
   - Admin interface to manually process payouts
   - Override for special cases

2. **Enhanced Reporting**
   - Payout analytics dashboard
   - Export functionality

3. **Multi-currency Support**
   - Expanded currency handling
   - Exchange rate integration

4. **Refund Processing**
   - Handle contribution refunds
   - Update payout records accordingly