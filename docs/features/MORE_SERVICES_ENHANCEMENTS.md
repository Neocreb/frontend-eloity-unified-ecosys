# MoreServices Page Enhancement Guide

## Overview
This document provides implementation guidance for enhanced features on the `/app/wallet/more-services` page. Each suggestion is aligned with Eloity's platform architecture and existing systems.

**NOTE:** Some features mentioned here are already implemented on the main `/app/wallet` page. For a complete audit of implementation status, see [WALLET_FEATURES_STATUS.md](./WALLET_FEATURES_STATUS.md).

---

## Implementation Status Summary

### ✅ Already Implemented (on main wallet page)
- **Recent Transactions Quick View** - Exists as "Recent Activity" section
- **Smart Recommendations** - Exists as standalone component
- **Recent Recipients** - Exists as "Frequent Recipients" section
- **Service Analytics** - Exists as separate analytics page

### ❌ Still Pending Implementation
- **Favorites/Shortcuts** - In planning phase
- **One-Click Recurring Payments** - In planning phase
- **Service Ratings & Reviews** - In planning phase
- **Loyalty Rewards Integration** - In planning phase
- **Integration Badges** - In planning phase

---

## Table of Contents
1. [Recent Transactions Quick View](#1-recent-transactions-quick-view) ✅
2. [Favorites/Shortcuts](#2-favoritesshortcuts) ❌
3. [Service Analytics](#3-service-analytics) ✅
4. [One-Click Recurring Payments](#4-one-click-recurring-payments) ❌
5. [Smart Recommendations](#5-smart-recommendations) ✅
6. [Service Ratings & Reviews](#6-service-ratings--reviews) ❌
7. [Loyalty Rewards Integration](#7-loyalty-rewards-integration) ❌
8. [Integration Badges](#8-integration-badges) ❌

---

## 1. Recent Transactions Quick View ✅ IMPLEMENTED

**Current Status:** Already exists on main `/app/wallet` page as "Recent Activity" section
**Location:** `src/pages/wallet/WalletDashboard.tsx` (Lines 305-317)
**Component:** Built-in section with transaction history preview
**Note:** This feature is complete. See [WALLET_FEATURES_STATUS.md](./WALLET_FEATURES_STATUS.md#1-recent-transactions-quick-view-) for details.

### Purpose
Display user's last 3-5 transactions with quick action buttons to repeat similar transactions.

### Platform Alignment
- **Integrates with:** `WalletProvider`, `TransactionHistory` context
- **Uses existing:** `wallet_transactions` table, user activity logs
- **Benefits:** Reduces friction for repeat actions (airtime refills, bill payments)

### Technical Implementation

#### Database Schema
```sql
-- Already exists, no migration needed
SELECT * FROM wallet_transactions 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 5;
```

#### Component Structure
```
src/components/wallet/RecentTransactionsWidget.tsx
├── Uses: useAuth() hook
├── Fetches: getRecentTransactions(userId, limit: 5)
├── Displays: Transaction type, amount, date, recipient
└── Actions: "Repeat" button linking to relevant service
```

#### Implementation Steps

1. **Create Widget Component**
   ```tsx
   // src/components/wallet/RecentTransactionsWidget.tsx
   export const RecentTransactionsWidget = ({ maxItems = 5 }) => {
     const { user } = useAuth();
     const [transactions, setTransactions] = useState([]);
     
     useEffect(() => {
       if (user?.id) {
         fetchRecentTransactions(user.id, maxItems);
       }
     }, [user?.id]);
     
     return (
       <Card>
         <CardHeader>
           <CardTitle>Recent Transactions</CardTitle>
         </CardHeader>
         <CardContent>
           {transactions.map(tx => (
             <div key={tx.id} className="flex justify-between items-center">
               <div>
                 <p className="font-medium">{tx.type}</p>
                 <p className="text-sm text-gray-500">{tx.date}</p>
               </div>
               <div>
                 <p className="font-bold">${tx.amount}</p>
                 <Button size="sm" onClick={() => repeatTransaction(tx)}>
                   Repeat
                 </Button>
               </div>
             </div>
           ))}
         </CardContent>
       </Card>
     );
   };
   ```

2. **Add to MoreServices Page**
   ```tsx
   import { RecentTransactionsWidget } from "@/components/wallet/RecentTransactionsWidget";
   
   // In MoreServices component, after header:
   <RecentTransactionsWidget maxItems={3} />
   ```

3. **Fetch Function in Service Layer**
   ```tsx
   // src/services/walletService.ts
   export async function getRecentTransactions(userId: string, limit: number = 5) {
     const { data, error } = await supabase
       .from('wallet_transactions')
       .select('*')
       .eq('user_id', userId)
       .eq('status', 'completed')
       .order('created_at', { ascending: false })
       .limit(limit);
     
     if (error) throw error;
     return data || [];
   }
   ```

### UI/UX Design
- Position: Below search bar, above category filters
- Layout: Horizontal scrollable cards on mobile, grid on desktop
- Each card shows: Icon, Type, Amount, Date, "Repeat" button
- Color coding by transaction type (green for income, red for expense)

### Complexity: **LOW**
- Implementation time: 2-3 hours
- Dependencies: Existing transaction data, wallet service
- No new database tables required

---

## 2. Favorites/Shortcuts

### Purpose
Allow users to pin frequently used services for quick access.

### Platform Alignment
- **Integrates with:** User preferences, localStorage for quick access
- **Uses existing:** `user_preferences` table or new `user_service_favorites` table
- **Benefits:** Personalized experience, reduces navigation depth

### Technical Implementation

#### Database Schema
```sql
-- Create if doesn't exist
CREATE TABLE user_service_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  service_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Add RLS policy
ALTER TABLE user_service_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorites"
  ON user_service_favorites
  FOR ALL
  USING (auth.uid() = user_id);
```

#### Component Structure
```
src/components/wallet/ServiceFavoritesBar.tsx
├── Fetches: Favorite services for current user
├── Shows: 4-6 pinned services in horizontal scroll
├── Actions: Pin/unpin, click to navigate
└── Sync: Real-time with database
```

#### Implementation Steps

1. **Create Favorites Management Service**
   ```tsx
   // src/services/walletService.ts
   export async function getFavoriteServices(userId: string) {
     const { data, error } = await supabase
       .from('user_service_favorites')
       .select(`
         service_id,
         created_at
       `)
       .eq('user_id', userId)
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data || [];
   }
   
   export async function toggleServiceFavorite(userId: string, serviceId: string) {
     const { data: existing } = await supabase
       .from('user_service_favorites')
       .select('id')
       .eq('user_id', userId)
       .eq('service_id', serviceId)
       .single();
     
     if (existing) {
       // Remove favorite
       return supabase
         .from('user_service_favorites')
         .delete()
         .eq('user_id', userId)
         .eq('service_id', serviceId);
     } else {
       // Add favorite
       return supabase
         .from('user_service_favorites')
         .insert({
           user_id: userId,
           service_id: serviceId
         });
     }
   }
   ```

2. **Create Favorites Bar Component**
   ```tsx
   // src/components/wallet/ServiceFavoritesBar.tsx
   export const ServiceFavoritesBar = ({ allServices }) => {
     const { user } = useAuth();
     const [favorites, setFavorites] = useState([]);
     const navigate = useNavigate();
     
     useEffect(() => {
       if (user?.id) {
         loadFavorites();
       }
     }, [user?.id]);
     
     const loadFavorites = async () => {
       const fav = await getFavoriteServices(user.id);
       const favoriteServices = allServices.filter(s =>
         fav.some(f => f.service_id === s.id)
       );
       setFavorites(favoriteServices);
     };
     
     return (
       <div className="flex gap-3 overflow-x-auto pb-2">
         {favorites.map(service => (
           <button
             key={service.id}
             onClick={() => service.action()}
             className="flex-shrink-0 p-3 bg-white rounded-lg border-2 border-primary"
           >
             {service.icon}
             <p className="text-xs font-medium">{service.label}</p>
           </button>
         ))}
       </div>
     );
   };
   ```

3. **Add Pin/Unpin to Service Cards**
   ```tsx
   // Modify ServiceCard component in MoreServices.tsx
   const ServiceCard = ({ service, isFavorite, onToggleFavorite }) => (
     <button
       onClick={service.action}
       className="relative group flex flex-col items-center..."
     >
       {/* Pin icon in corner */}
       <button
         onClick={(e) => {
           e.stopPropagation();
           onToggleFavorite(service.id);
         }}
         className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
       >
         {isFavorite ? <Star className="fill-yellow-400" /> : <Star />}
       </button>
       {/* Rest of card... */}
     </button>
   );
   ```

### UI/UX Design
- Position: Above "Recently Used" section
- Show as: Horizontal scrollable bar with star icon
- Persistence: Save to database, sync across devices
- Max favorites: 8-10 services
- Visual indicator: Filled star on service cards when pinned

### Complexity: **MEDIUM**
- Implementation time: 4-5 hours
- Dependencies: Database migration, supabase configuration
- New table: `user_service_favorites`

---

## 3. Service Analytics

### Purpose
Show users their usage patterns for different services (frequency, spending, trends).

### Platform Alignment
- **Integrates with:** `activity_logs`, `wallet_transactions`, analytics dashboard
- **Uses existing:** Activity tracking system already in place
- **Benefits:** Encourages platform engagement, shows value to users

### Technical Implementation

#### Database Query
```sql
-- Get service usage stats
SELECT 
  service_type,
  COUNT(*) as usage_count,
  SUM(amount) as total_spent,
  AVG(amount) as avg_amount,
  MAX(created_at) as last_used
FROM wallet_transactions
WHERE user_id = ?
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY service_type
ORDER BY usage_count DESC;
```

#### Component Structure
```
src/components/wallet/ServiceAnalytics.tsx
├── Shows: Top 5 most used services
├── Metrics: Frequency, total spent, trend (up/down)
├── Period: Selectable (7 days, 30 days, 90 days)
└── Chart: Simple bar or line chart
```

#### Implementation Steps

1. **Create Analytics Service**
   ```tsx
   // src/services/analyticsService.ts
   export async function getServiceAnalytics(
     userId: string,
     period: 'week' | 'month' | 'quarter' = 'month'
   ) {
     const days = {
       week: 7,
       month: 30,
       quarter: 90
     };
     
     const { data, error } = await supabase
       .rpc('get_service_analytics', {
         p_user_id: userId,
         p_days: days[period]
       });
     
     if (error) throw error;
     return data || [];
   }
   ```

2. **Create Analytics Component**
   ```tsx
   // src/components/wallet/ServiceAnalytics.tsx
   export const ServiceAnalytics = () => {
     const { user } = useAuth();
     const [analytics, setAnalytics] = useState([]);
     const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
     
     useEffect(() => {
       if (user?.id) {
         getServiceAnalytics(user.id, period).then(setAnalytics);
       }
     }, [user?.id, period]);
     
     return (
       <Card>
         <CardHeader>
           <CardTitle>Your Service Usage</CardTitle>
           <div className="flex gap-2 mt-4">
             {['week', 'month', 'quarter'].map(p => (
               <Button
                 key={p}
                 variant={period === p ? 'default' : 'outline'}
                 onClick={() => setPeriod(p as any)}
               >
                 {p.charAt(0).toUpperCase() + p.slice(1)}
               </Button>
             ))}
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {analytics.map(stat => (
               <div key={stat.service_type} className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">{stat.service_type}</p>
                   <p className="text-sm text-gray-500">
                     {stat.usage_count} times • ${stat.total_spent.toFixed(2)}
                   </p>
                 </div>
                 <TrendingUp className={stat.trend > 0 ? 'text-green-500' : 'text-gray-500'} />
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   };
   ```

3. **Create Database Function**
   ```sql
   CREATE OR REPLACE FUNCTION get_service_analytics(
     p_user_id UUID,
     p_days INT DEFAULT 30
   )
   RETURNS TABLE (
     service_type VARCHAR,
     usage_count BIGINT,
     total_spent NUMERIC,
     avg_amount NUMERIC,
     last_used TIMESTAMP,
     trend INT
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       t.service_type,
       COUNT(*)::BIGINT,
       COALESCE(SUM(t.amount), 0),
       COALESCE(AVG(t.amount), 0),
       MAX(t.created_at),
       CASE 
         WHEN COUNT(*) > (
           SELECT COUNT(*) FROM wallet_transactions
           WHERE user_id = p_user_id
             AND service_type = t.service_type
             AND created_at >= NOW() - (p_days * 2)::interval
             AND created_at < NOW() - p_days::interval
         ) THEN 1
         ELSE -1
       END
     FROM wallet_transactions t
     WHERE t.user_id = p_user_id
       AND t.status = 'completed'
       AND t.created_at >= NOW() - (p_days)::interval
     GROUP BY t.service_type
     ORDER BY COUNT(*) DESC;
   END;
   $$ LANGUAGE plpgsql;
   ```

### UI/UX Design
- Position: In a dedicated "Analytics" tab or modal
- Show: Top 5 services with usage frequency
- Metrics: Count, total spent, average, trend indicator
- Period selector: Week, Month, Quarter
- Future enhancement: Charts with Chart.js or Recharts

### Complexity: **MEDIUM-HIGH**
- Implementation time: 5-6 hours
- Dependencies: Database function, analytics service
- Performance: Cache results for faster loading

---

## 4. One-Click Recurring Payments

### Purpose
Let users set up automatic recurring payments for regular bills.

### Platform Alignment
- **Integrates with:** Existing payment system, scheduler service
- **Uses existing:** `wallet_transactions`, new `recurring_payments` table
- **Benefits:** Convenience, reliability, reduces manual transactions

### Technical Implementation

#### Database Schema
```sql
CREATE TABLE recurring_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  service_id VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  frequency VARCHAR(20), -- 'daily', 'weekly', 'biweekly', 'monthly'
  next_payment_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recurring_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_payment_id UUID REFERENCES recurring_payments(id),
  status VARCHAR(20), -- 'pending', 'completed', 'failed'
  executed_at TIMESTAMP,
  transaction_id UUID REFERENCES wallet_transactions(id)
);
```

#### Implementation Steps

1. **Create Recurring Payment Service**
   ```tsx
   // src/services/recurringPaymentService.ts
   export async function setupRecurringPayment(
     userId: string,
     serviceId: string,
     amount: number,
     frequency: 'daily' | 'weekly' | 'monthly'
   ) {
     // Calculate next payment date
     const nextDate = calculateNextPaymentDate(new Date(), frequency);
     
     const { data, error } = await supabase
       .from('recurring_payments')
       .insert({
         user_id: userId,
         service_id: serviceId,
         amount,
         frequency,
         next_payment_date: nextDate,
         is_active: true
       });
     
     if (error) throw error;
     return data;
   }
   
   export async function getRecurringPayments(userId: string) {
     const { data, error } = await supabase
       .from('recurring_payments')
       .select('*')
       .eq('user_id', userId)
       .eq('is_active', true);
     
     if (error) throw error;
     return data || [];
   }
   ```

2. **Create Setup Modal/Page**
   ```tsx
   // src/components/wallet/RecurringPaymentSetup.tsx
   export const RecurringPaymentSetup = ({ service, onClose }) => {
     const { user } = useAuth();
     const [amount, setAmount] = useState('');
     const [frequency, setFrequency] = useState('monthly');
     const [loading, setLoading] = useState(false);
     
     const handleSetup = async () => {
       setLoading(true);
       try {
         await setupRecurringPayment(
           user.id,
           service.id,
           parseFloat(amount),
           frequency as any
         );
         toast({
           title: 'Success',
           description: `Recurring ${service.label} setup complete`
         });
         onClose();
       } catch (error) {
         toast({
           title: 'Error',
           description: 'Failed to setup recurring payment',
           variant: 'destructive'
         });
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <div className="space-y-4">
         <div>
           <Label>Amount</Label>
           <Input
             type="number"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             placeholder="Enter amount"
           />
         </div>
         <div>
           <Label>Frequency</Label>
           <select
             value={frequency}
             onChange={(e) => setFrequency(e.target.value)}
             className="border rounded p-2 w-full"
           >
             <option value="daily">Daily</option>
             <option value="weekly">Weekly</option>
             <option value="monthly">Monthly</option>
           </select>
         </div>
         <Button onClick={handleSetup} disabled={loading}>
           {loading ? 'Setting up...' : 'Setup Recurring Payment'}
         </Button>
       </div>
     );
   };
   ```

3. **Add "Setup Recurring" Option to Service Cards**
   ```tsx
   // On eligible services (bills, airtime, data)
   const eligibleServices = ['electricity', 'airtime', 'data', 'tv'];
   
   if (eligibleServices.includes(service.id)) {
     <Button
       size="sm"
       variant="outline"
       onClick={(e) => {
         e.stopPropagation();
         openRecurringSetupModal(service);
       }}
       className="text-xs"
     >
       <RotateCw className="h-3 w-3 mr-1" /> Auto-pay
     </Button>
   }
   ```

### UI/UX Design
- Button placement: Subtle icon on eligible service cards
- Setup flow: Modal with 3 simple fields (amount, frequency, confirm)
- Management: Dedicated "Recurring Payments" section in wallet settings
- Notifications: Alert user 1 day before payment

### Complexity: **MEDIUM**
- Implementation time: 5-6 hours
- Dependencies: Payment processor integration, scheduler
- New tables: `recurring_payments`, `recurring_payment_history`

---

## 5. Smart Recommendations

### Purpose
AI-powered service suggestions based on user behavior and patterns.

### Platform Alignment
- **Integrates with:** AI Assistant system already in platform
- **Uses existing:** Activity logs, transaction history
- **Benefits:** Personalization, discovery, increased engagement

### Technical Implementation

#### Database Query for User Patterns
```sql
SELECT 
  activity_type,
  COUNT(*) as frequency,
  MAX(created_at) as last_activity
FROM activities
WHERE user_id = ?
GROUP BY activity_type
ORDER BY frequency DESC;
```

#### Implementation Steps

1. **Create Recommendation Engine Service**
   ```tsx
   // src/services/recommendationService.ts
   export async function getSmartRecommendations(
     userId: string,
     allServices: Service[]
   ) {
     // Get user activity patterns
     const activities = await getUserActivityPatterns(userId);
     
     // Get frequently used services
     const frequentServices = activities.map(a => a.activity_type);
     
     // Get related/complementary services
     const recommendations = allServices
       .filter(s => !frequentServices.includes(s.id))
       .map(s => {
         // Calculate recommendation score
         const score = calculateRelevanceScore(s, activities);
         return { ...s, score };
       })
       .filter(s => s.score > 0.5)
       .sort((a, b) => b.score - a.score)
       .slice(0, 5);
     
     return recommendations;
   }
   
   function calculateRelevanceScore(service: Service, activities: any[]): number {
     const categoryWeights: Record<string, number> = {
       'Money Management': 1.0,
       'Bills & Utilities': 0.9,
       'Creator Features': 0.8,
       'Work & Earn': 0.7,
       'Finance & Investment': 0.6
     };
     
     // If user frequently uses similar category, increase score
     const userCategories = activities.map(a => a.category);
     const baseScore = categoryWeights[service.category] || 0.5;
     
     if (userCategories.includes(service.category)) {
       return baseScore * 1.5; // Boost for similar category
     }
     
     return baseScore;
   }
   ```

2. **Create Recommendations Component**
   ```tsx
   // src/components/wallet/SmartRecommendations.tsx
   export const SmartRecommendations = ({ allServices }) => {
     const { user } = useAuth();
     const [recommendations, setRecommendations] = useState([]);
     
     useEffect(() => {
       if (user?.id) {
         getSmartRecommendations(user.id, allServices)
           .then(setRecommendations);
       }
     }, [user?.id]);
     
     if (recommendations.length === 0) return null;
     
     return (
       <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Lightbulb className="h-5 w-5 text-yellow-500" />
             Recommended For You
           </CardTitle>
           <p className="text-sm text-gray-600 mt-1">
             Based on your recent activity
           </p>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             {recommendations.map(service => (
               <button
                 key={service.id}
                 onClick={service.action}
                 className="p-3 rounded-lg bg-white border border-gray-200 hover:border-primary transition"
               >
                 <div className={`w-10 h-10 rounded-lg ${service.gradient} text-white flex items-center justify-center mb-2`}>
                   {service.icon}
                 </div>
                 <p className="text-xs font-medium text-gray-800">{service.label}</p>
               </button>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   };
   ```

3. **Add to MoreServices Page**
   ```tsx
   // In MoreServices component
   {!searchQuery && !selectedCategory && (
     <SmartRecommendations allServices={allServices} />
   )}
   ```

### Integration with AI Assistant
```tsx
// Use existing AI service for personalization
import { getAIRecommendations } from "@/services/aiAssistantService";

// Could enhance recommendations with AI
const enhancedRecommendations = await getAIRecommendations({
  userId,
  context: 'wallet_services',
  userActivityPatterns: activities
});
```

### UI/UX Design
- Position: Below search/filter, above Recently Used
- Design: Highlighted card with lightbulb icon
- Show: 3-5 services with brief reason (e.g., "Popular in Finance")
- Refresh: Daily or after significant user action

### Complexity: **MEDIUM-HIGH**
- Implementation time: 6-8 hours
- Dependencies: AI/ML service, activity tracking
- Future: Could use ML model for better predictions

---

## 6. Service Ratings & Reviews

### Purpose
Allow users to rate services and share feedback, building community trust.

### Platform Alignment
- **Integrates with:** User engagement system, review/rating infrastructure
- **Uses existing:** User profiles, feedback mechanisms
- **Benefits:** Social proof, quality assurance, user engagement

### Technical Implementation

#### Database Schema
```sql
CREATE TABLE service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, user_id) -- One review per user per service
);

CREATE TABLE service_rating_summary (
  service_id VARCHAR(50) PRIMARY KEY,
  avg_rating NUMERIC(3, 2),
  total_reviews INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Implementation Steps

1. **Create Review Service**
   ```tsx
   // src/services/reviewService.ts
   export async function submitServiceReview(
     userId: string,
     serviceId: string,
     rating: number,
     reviewText?: string
   ) {
     const { data, error } = await supabase
       .from('service_reviews')
       .upsert({
         user_id: userId,
         service_id: serviceId,
         rating,
         review_text: reviewText || null
       });
     
     if (error) throw error;
     
     // Update summary
     await updateServiceRatingSummary(serviceId);
     
     return data;
   }
   
   export async function getServiceRating(serviceId: string) {
     const { data, error } = await supabase
       .from('service_rating_summary')
       .select('*')
       .eq('service_id', serviceId)
       .single();
     
     if (error) return { avgRating: 0, totalReviews: 0 };
     return data;
   }
   
   export async function getServiceReviews(serviceId: string, limit = 5) {
     const { data, error } = await supabase
       .from('service_reviews')
       .select(`
         *,
         profiles!service_reviews_user_id_fkey (display_name, avatar_url)
       `)
       .eq('service_id', serviceId)
       .order('created_at', { ascending: false })
       .limit(limit);
     
     if (error) return [];
     return data || [];
   }
   ```

2. **Create Rating Display Component**
   ```tsx
   // src/components/wallet/ServiceRatingBadge.tsx
   export const ServiceRatingBadge = ({ serviceId, rating, totalReviews }) => {
     return (
       <div className="flex items-center gap-2 text-sm">
         <div className="flex items-center">
           {[...Array(5)].map((_, i) => (
             <Star
               key={i}
               className={`h-4 w-4 ${
                 i < Math.round(rating)
                   ? 'fill-yellow-400 text-yellow-400'
                   : 'text-gray-300'
               }`}
             />
           ))}
         </div>
         <span className="font-medium">{rating.toFixed(1)}</span>
         <span className="text-gray-500">({totalReviews})</span>
       </div>
     );
   };
   ```

3. **Create Review Modal**
   ```tsx
   // src/components/wallet/ServiceReviewModal.tsx
   export const ServiceReviewModal = ({ service, onClose }) => {
     const { user } = useAuth();
     const [rating, setRating] = useState(0);
     const [review, setReview] = useState('');
     const [loading, setLoading] = useState(false);
     
     const handleSubmit = async () => {
       setLoading(true);
       try {
         await submitServiceReview(user.id, service.id, rating, review);
         toast({ title: 'Thank you for your review!' });
         onClose();
       } catch (error) {
         toast({
           title: 'Error submitting review',
           variant: 'destructive'
         });
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <div className="space-y-4">
         <h3>Rate {service.label}</h3>
         
         <div className="flex gap-2">
           {[1, 2, 3, 4, 5].map(star => (
             <button
               key={star}
               onClick={() => setRating(star)}
               className="p-2"
             >
               <Star
                 className={`h-8 w-8 ${
                   star <= rating
                     ? 'fill-yellow-400 text-yellow-400'
                     : 'text-gray-300'
                 }`}
               />
             </button>
           ))}
         </div>
         
         <Textarea
           placeholder="Share your experience (optional)"
           value={review}
           onChange={(e) => setReview(e.target.value)}
           rows={3}
         />
         
         <Button onClick={handleSubmit} disabled={loading || rating === 0}>
           Submit Review
         </Button>
       </div>
     );
   };
   ```

4. **Add Ratings to Service Cards**
   ```tsx
   // In MoreServices.tsx
   const ServiceCard = ({ service, rating }) => (
     <button onClick={service.action} className="relative group...">
       {/* Show rating badge */}
       {rating && (
         <ServiceRatingBadge
           serviceId={service.id}
           rating={rating.avgRating}
           totalReviews={rating.totalReviews}
         />
       )}
       {/* Rest of card... */}
     </button>
   );
   ```

### UI/UX Design
- Show: Star rating on each service card
- Access: Tap rating or "Rate" button to open modal
- Display: Reviews in service detail page/modal
- Gamification: Reward users for helpful reviews

### Complexity: **MEDIUM**
- Implementation time: 5-6 hours
- Dependencies: Database, review service
- New tables: `service_reviews`, `service_rating_summary`

---

## 7. Loyalty Rewards Integration

### Purpose
Reward users for frequent service usage with points/badges.

### Platform Alignment
- **Integrates with:** Existing rewards system, achievement system
- **Uses existing:** `rewards` table, `activities` tracking, `achievements`
- **Benefits:** Incentivizes usage, increases user retention

### Technical Implementation

#### Service-Based Rewards Configuration
```tsx
// src/config/serviceRewards.ts
const SERVICE_REWARDS: Record<string, {
  pointsPerTransaction: number,
  bonusThreshold?: number,
  badge?: string
}> = {
  'electricity': { pointsPerTransaction: 10 },
  'airtime': { pointsPerTransaction: 5 },
  'send-money': { pointsPerTransaction: 15, bonusThreshold: 5 }, // 5 sends = bonus
  'freelance': { pointsPerTransaction: 50, badge: 'HUSTLER' },
  'creator-rewards': { pointsPerTransaction: 100, badge: 'CREATOR' }
};
```

#### Implementation Steps

1. **Create Service Rewards Service**
   ```tsx
   // src/services/serviceRewardsService.ts
   export async function awardServiceRewards(
     userId: string,
     serviceId: string,
     transactionAmount?: number
   ) {
     const config = SERVICE_REWARDS[serviceId];
     if (!config) return; // No rewards for this service
     
     let points = config.pointsPerTransaction;
     
     // Check if user qualifies for bonus
     if (config.bonusThreshold) {
       const recentCount = await getRecentServiceUseCount(
         userId,
         serviceId,
         config.bonusThreshold
       );
       
       if (recentCount >= config.bonusThreshold) {
         points *= 1.5; // 50% bonus
       }
     }
     
     // Award points
     await addRewards(userId, points, {
       source: 'service_usage',
       serviceId,
       description: `Bonus for using ${serviceId}`
     });
     
     // Check for badge
     if (config.badge) {
       await checkAndAwardBadge(userId, config.badge);
     }
     
     return { pointsAwarded: points };
   }
   ```

2. **Track Service Usage for Rewards**
   ```tsx
   // Hook to use when service completes transaction
   export function useServiceRewards(serviceId: string) {
     const { user } = useAuth();
     
     const awardRewardsOnComplete = async (transactionAmount?: number) => {
       if (!user?.id) return;
       
       await awardServiceRewards(
         user.id,
         serviceId,
         transactionAmount
       );
       
       toast({
         title: '🎉 Rewards Earned!',
         description: `Points added to your account`
       });
     };
     
     return { awardRewardsOnComplete };
   }
   ```

3. **Create Rewards Display Component**
   ```tsx
   // src/components/wallet/ServiceRewardsInfo.tsx
   export const ServiceRewardsInfo = ({ serviceId }) => {
     const config = SERVICE_REWARDS[serviceId];
     
     if (!config) return null;
     
     return (
       <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
         <p className="text-sm font-medium text-yellow-900">
           ⭐ Earn {config.pointsPerTransaction} points per transaction
         </p>
         {config.bonusThreshold && (
           <p className="text-xs text-yellow-700 mt-1">
             Use {config.bonusThreshold}x to unlock 50% bonus!
           </p>
         )}
         {config.badge && (
           <p className="text-xs text-yellow-700 mt-1">
             Complete {config.threshold} to earn badge: {config.badge}
           </p>
         )}
       </div>
     );
   };
   ```

4. **Add to Service Cards/Details**
   ```tsx
   // In MoreServices or service detail page
   <ServiceRewardsInfo serviceId={service.id} />
   ```

### Integration with Activity Economy
```tsx
// src/services/activityRewardService.ts
// Track service usage as activity for rewards
export async function trackServiceActivity(
  userId: string,
  serviceId: string,
  metadata?: any
) {
  const activityType = mapServiceToActivityType(serviceId);
  
  await createActivity({
    userId,
    activityType,
    title: `Used ${serviceId}`,
    metadata
  });
  
  // This triggers activity-based rewards automatically
}
```

### UI/UX Design
- Show: Points earned after transaction
- Display: Rewards info on service card/detail
- Leaderboard: Top spenders/users in rewards
- Celebrations: Toast notification when badge earned

### Complexity: **MEDIUM-HIGH**
- Implementation time: 6-8 hours
- Dependencies: Rewards system, activity tracking
- Uses existing: `rewards`, `achievements` tables

---

## 8. Integration Badges

### Purpose
Show which services have special integrations/partnerships/features.

### Platform Alignment
- **Integrates with:** Service metadata, partnership system
- **Uses existing:** Service definitions, admin panel
- **Benefits:** Shows platform value, highlights integrations

### Technical Implementation

#### Badge Configuration
```tsx
// src/config/serviceBadges.ts
const INTEGRATION_BADGES = {
  'crypto': {
    label: 'Crypto Enabled',
    icon: <Bitcoin />,
    color: 'bg-orange-500'
  },
  'instant': {
    label: 'Instant Transfer',
    icon: <Zap />,
    color: 'bg-yellow-500'
  },
  'rewards': {
    label: 'Earn Rewards',
    icon: <Star />,
    color: 'bg-blue-500'
  },
  'recurring': {
    label: 'Auto-pay Available',
    icon: <RotateCw />,
    color: 'bg-green-500'
  },
  'partnership': {
    label: 'Partner Feature',
    icon: <Handshake />,
    color: 'bg-purple-500'
  }
};

// Map services to badges
const SERVICE_INTEGRATIONS: Record<string, string[]> = {
  'send-money': ['instant', 'crypto', 'rewards'],
  'freelance': ['crypto', 'rewards'],
  'creator-rewards': ['instant', 'partnership'],
  'electricity': ['recurring', 'rewards'],
  'airtime': ['instant', 'recurring', 'rewards'],
  'crypto-deposit': ['crypto', 'instant']
};
```

#### Implementation Steps

1. **Create Badge Component**
   ```tsx
   // src/components/wallet/IntegrationBadges.tsx
   export const IntegrationBadges = ({ serviceId }) => {
     const badges = SERVICE_INTEGRATIONS[serviceId] || [];
     
     if (badges.length === 0) return null;
     
     return (
       <div className="flex flex-wrap gap-2 mt-2">
         {badges.map(badgeId => {
           const badge = INTEGRATION_BADGES[badgeId];
           return (
             <div
               key={badgeId}
               className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium ${badge.color}`}
             >
               {badge.icon}
               <span>{badge.label}</span>
             </div>
           );
         })}
       </div>
     );
   };
   ```

2. **Add to Service Cards**
   ```tsx
   // In MoreServices.tsx ServiceCard component
   const ServiceCard = ({ service }) => (
     <button onClick={service.action} className="relative group...">
       {/* Card content */}
       <IntegrationBadges serviceId={service.id} />
     </button>
   );
   ```

3. **Create Service Detail with Full Badge Info**
   ```tsx
   // src/pages/wallet/ServiceDetail.tsx (optional new page)
   export const ServiceDetail = ({ serviceId }) => {
     const service = allServices.find(s => s.id === serviceId);
     const badges = SERVICE_INTEGRATIONS[serviceId] || [];
     
     return (
       <div className="space-y-4">
         <h1>{service.label}</h1>
         <p>{service.description}</p>
         
         <div className="bg-gray-50 p-4 rounded-lg">
           <h3 className="font-bold mb-3">Features</h3>
           {badges.map(badgeId => {
             const badge = INTEGRATION_BADGES[badgeId];
             return (
               <div key={badgeId} className="flex items-center gap-2 mb-2">
                 {badge.icon}
                 <div>
                   <p className="font-medium">{badge.label}</p>
                   <p className="text-sm text-gray-600">
                     {badge.description}
                   </p>
                 </div>
               </div>
             );
           })}
         </div>
         
         <Button onClick={() => service.action()}>
           Use {service.label}
         </Button>
       </div>
     );
   };
   ```

### UI/UX Design
- Position: Below service name/icon on card
- Style: Compact colored badges with icons
- Hover: Tooltip explaining each badge
- Colors: Distinct colors for different badge types

### Complexity: **LOW-MEDIUM**
- Implementation time: 2-3 hours
- Dependencies: Service configuration
- No database changes needed

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Recent Transactions Quick View
- [ ] Favorites/Shortcuts
- [ ] Integration Badges

### Phase 2: Engagement (Weeks 3-4)
- [ ] Service Analytics
- [ ] Smart Recommendations
- [ ] Service Ratings & Reviews

### Phase 3: Advanced (Weeks 5-6)
- [ ] One-Click Recurring Payments
- [ ] Loyalty Rewards Integration

---

## Technical Requirements

### Database
- Supabase PostgreSQL setup
- Migration scripts for new tables
- RLS policies for security

### Dependencies
```json
{
  "recharts": "^2.8.0",  // For analytics charts
  "date-fns": "^2.30.0",  // For date handling
  "react-hot-toast": "^2.4.0"  // For notifications
}
```

### Performance Considerations
- Cache recommendations (update daily)
- Paginate reviews (load 5 at a time)
- Optimize analytics queries with indexes
- Debounce search queries

### Security
- RLS policies on all user-specific tables
- Validate inputs on all forms
- Rate limit API calls
- Sanitize user reviews

---

## Monitoring & Analytics

Track:
- Feature adoption rates
- User engagement metrics
- Performance metrics
- Error rates per feature

Use existing analytics infrastructure to monitor success.

---

## Future Enhancements

1. **Machine Learning**: Improve recommendations with ML model
2. **Gamification**: Leaderboards, achievements, challenges
3. **Social Features**: Share accomplishments, refer friends
4. **Personalization**: Theme customization, layout preferences
5. **Mobile App**: Native app versions of features
6. **API**: Public API for third-party integrations
7. **Webhooks**: Real-time transaction notifications
8. **Advanced Analytics**: Detailed spending patterns, forecasting

---

## Support & Documentation

- Link to main [README](../../README.md)
- Link to [API Documentation](../api/api-reference.md)
- Link to [Database Schema](../database/schema.md)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
