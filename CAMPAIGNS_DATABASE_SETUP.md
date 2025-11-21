# Campaign Database Setup Guide

## Overview
This document provides the database schema and migration script for implementing real campaigns functionality in the Eloity platform.

## Migration File
Execute the SQL migration: `migrations/0036_create_campaigns_tables.sql`

This creates the following tables:
- `campaigns` - Main campaign data
- `campaign_content` - Maps content items to campaigns  
- `campaign_analytics` - Daily performance metrics
- `campaign_performance_metrics` - Aggregated campaign metrics

## Key Changes Made

### 1. Database Schema (migrations/0036_create_campaigns_tables.sql)
- Full campaigns table with goals, targeting, budgeting, and performance tracking
- RLS policies for data security
- Indexes for optimal query performance
- Automatic timestamp management with triggers

### 2. New Hooks Created

#### `src/hooks/use-user-boostable-content.ts`
Fetches user's boostable content from:
- Products (marketplace)
- Freelance services/gigs
- Freelance jobs (posted by user)
- Videos
- Posts  
- User profile

```typescript
const { content, isLoading, error } = useUserBoostableContent();
```

#### `src/hooks/use-user-campaigns.ts`
Fetches user's campaigns from database:

```typescript
const { campaigns, isLoading, error } = useUserCampaigns();
```

### 3. Updated Services

#### `src/services/campaignService.ts`
Already configured to interact with the campaigns table:
- `getActiveCampaigns()` - Get all active campaigns
- `getCampaignById(id)` - Get specific campaign
- `getUserCampaigns(userId)` - Get user's campaigns
- `createCampaign(data)` - Create new campaign
- `updateCampaign(id, updates)` - Update campaign
- `deleteCampaign(id)` - Delete campaign

### 4. Updated Components

#### `src/pages/campaigns/CreateCampaign.tsx`
Changes made:
- Integrated `useUserBoostableContent()` hook for real content fetching
- Integrated `useAuth()` for user information
- Updated `handleCreateCampaign()` to save to database instead of mock
- Added loading states for content display
- Maps campaign goals to database goal types
- Creates proper database records with all required fields

#### `src/components/campaigns/AudienceTargeting.tsx`
No changes needed - already accepts proper prop structure

#### `src/components/campaigns/CampaignCenter.tsx`
To use real data, update to use `useUserCampaigns()` instead of mock data:

```typescript
const { campaigns } = useUserCampaigns();
```

## Database Fields Reference

### campaigns table
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | TEXT | Campaign name |
| `goal_type` | TEXT | increase_sales, get_applications, promote_talent, get_more_views, drive_chats |
| `status` | TEXT | draft, active, paused, ended, cancelled |
| `budget` | NUMERIC | Campaign budget |
| `spent` | NUMERIC | Amount spent so far |
| `currency` | TEXT | eloits, usd, ngn |
| `estimated_reach` | INTEGER | Estimated audience reach |
| `targeting` | JSONB | Target audience details |
| `view_count`, `click_count`, `conversion_count` | INTEGER | Performance metrics |
| `total_revenue` | NUMERIC | Revenue generated |
| `created_by` | UUID | User who created campaign |
| `start_date`, `end_date` | TIMESTAMP | Campaign duration |

## How to Apply the Migration

### Option 1: Using Supabase Dashboard
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `migrations/0036_create_campaigns_tables.sql`
4. Paste and run

### Option 2: Using Supabase CLI
```bash
supabase db push
```

### Option 3: Via Drizzle ORM
If using Drizzle migrations:
```bash
npm run db:push
```

## Verification

After applying migration, verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'campaign%';
```

Should return:
- campaigns
- campaign_content
- campaign_analytics  
- campaign_performance_metrics

## Data Flow

### Creating a Campaign
1. User visits `/campaigns/create`
2. Selects goal (increase_sales, get_applications, etc.)
3. Selects content to boost (from `useUserBoostableContent()`)
4. Sets targeting (locations, interests, demographics)
5. Sets budget and schedule
6. Completes payment
7. Campaign saved to `campaigns` table via `campaignService.createCampaign()`

### Viewing Campaigns
1. User visits `/app/campaigns`
2. `CampaignCenter` component loads
3. Fetches campaigns using `useUserCampaigns()` hook
4. Displays real campaign data instead of mocks

### Campaign Analytics
- Daily metrics tracked in `campaign_analytics` table
- Performance aggregated in `campaign_performance_metrics` table
- Can be queried and displayed in `CampaignAnalyticsDashboard`

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Update CampaignCenter.tsx** to use `useUserCampaigns()` instead of mock data
3. **Update CampaignCreationWizard.tsx** similarly if using modal version
4. **Test campaign creation** - create a test campaign and verify it appears in database
5. **Implement analytics tracking** - add event tracking when campaigns get views/clicks/conversions
6. **Connect to payment system** - integrate wallet balance checks and deductions

## Testing Checklist

- [ ] Migration applies without errors
- [ ] `campaigns` table exists with correct structure
- [ ] Can create a campaign via CreateCampaign.tsx
- [ ] Campaign appears in database
- [ ] Campaign appears in CampaignCenter dashboard  
- [ ] Can view campaign details
- [ ] Can update campaign status (active/paused/ended)
- [ ] Can delete campaign
- [ ] Analytics data displays (once tracking is implemented)

## Troubleshooting

**Migration fails with "permission denied"**
- Ensure you're logged in as admin user in Supabase
- Check RLS policies aren't blocking operations

**Campaign not appearing after creation**
- Check browser console for errors
- Verify user_id is being passed correctly
- Check RLS policy allows INSERT for the user

**Can't fetch content for boosting**
- Verify tables exist: products, freelance_gigs, freelance_jobs, videos, posts, profiles
- Check user has content in those tables
- Verify field names match (seller_id, creator_id, user_id, client_id)
