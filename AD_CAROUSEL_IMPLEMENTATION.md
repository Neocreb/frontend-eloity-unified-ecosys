# Ad Carousel Banner System

## Overview

The Ad Carousel is a customizable, auto-scrolling rectangular banner system that displays ads and sponsored content in the Eloity wallet dashboard. It fills the white space between the floating action buttons and the "Send & Receive" section, providing premium ad placement without disrupting the UI.

## Features

✅ **Auto-Scrolling Carousel** - Automatically cycles through ads every 6 seconds
✅ **Multiple Recipient Types** - Supports bank, mobile wallet, email, and Eloity user transfers
✅ **Customizable Design** - Background colors, text colors, images, CTAs
✅ **Admin Management** - Full CRUD interface for managing ads
✅ **Responsive** - Works on mobile, tablet, and desktop
✅ **Interactive** - Manual navigation with chevrons and dot indicators
✅ **Hover Controls** - Navigation buttons appear on hover
✅ **Live Preview** - See changes in real-time in admin panel

## Components

### 1. **AdCarousel Component** (`src/components/wallet/AdCarousel.tsx`)

The main carousel display component with auto-scroll functionality.

```tsx
import AdCarousel, { Ad } from "@/components/wallet/AdCarousel";

<AdCarousel 
  ads={ads}
  autoScroll={true}
  scrollInterval={6000}
  onAdClick={(ad) => navigate(ad.ctaUrl)}
/>
```

**Props:**
- `ads: Ad[]` - Array of ad objects to display
- `autoScroll: boolean` - Enable/disable auto-scrolling (default: true)
- `scrollInterval: number` - Milliseconds between auto-scroll (default: 5000)
- `onAdClick: (ad: Ad) => void` - Callback when ad is clicked

**Ad Interface:**
```typescript
interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;      // Hex color (#RGB or #RRGGBB)
  textColor?: string;             // Hex color (#RGB or #RRGGBB)
  ctaText?: string;               // Call-to-action button text
  ctaUrl?: string;                // URL or app route to navigate to
  isActive: boolean;              // Show/hide ad
  createdAt: Date;
}
```

### 2. **AdminAdsManager** (`src/pages/admin/AdminAdsManager.tsx`)

Full admin interface for managing ads with CRUD operations.

**Features:**
- Create new ads with form validation
- Edit existing ads
- Delete ads
- Activate/deactivate ads
- Live carousel preview
- Ad statistics dashboard
- Image URL preview
- Color picker for background and text colors

**Storage:**
- Currently uses localStorage for persistence
- Can be easily integrated with a backend API/database

## Usage

### User Experience

1. **Dashboard View** - Ads display in a carousel between floating buttons and content sections
2. **Auto-Scroll** - Automatically cycles to next ad every 6 seconds
3. **Manual Navigation** - Users can click left/right chevrons to browse ads
4. **Dot Indicators** - Click dots to jump to specific ad
5. **CTA Action** - Click ad or CTA button to navigate to destination

### Admin Management

1. **Navigate to Admin Panel** → Click "Wallet Ads"
2. **Create Ad** → Click "New Ad" button
3. **Fill Details:**
   - Title (required)
   - Description (required)
   - Image URL (optional)
   - Background color (pick or paste hex)
   - Text color (pick or paste hex)
   - CTA button text
   - CTA button URL
4. **Preview** - See real-time preview before saving
5. **Save** - Click "Create Ad" or "Update Ad"
6. **Manage** - Enable/disable, edit, or delete ads from list
7. **View Carousel** - See live preview of how ads appear in wallet

## Styling

### Color Recommendations

**Background Colors (for premium look):**
- Primary Gradient: `#8B5CF6` (Purple)
- Success: `#4ECDC4` (Teal)
- Warning: `#FF6B6B` (Red)
- Info: `#95E1D3` (Light Green)

**Text Colors:**
- Light backgrounds: `#1A1A1A` (Dark Gray)
- Dark backgrounds: `#FFFFFF` (White)

### Dimensions

- **Height:** 128px on mobile, 160px on desktop
- **Width:** Full width of container (max-width: 448px on dashboard)
- **Border Radius:** 16px rounded corners
- **Padding:** 16px on mobile, 24px on desktop

## API Integration

To use a backend database instead of localStorage:

### Update `AdCarousel.tsx`:
```typescript
useEffect(() => {
  // Fetch from API
  const fetchAds = async () => {
    const response = await fetch('/api/admin/ads');
    const data = await response.json();
    setVisibleAds(data.filter(ad => ad.isActive));
  };
  fetchAds();
}, []);
```

### Update `AdminAdsManager.tsx`:
```typescript
const handleSaveAd = async () => {
  const response = await fetch('/api/admin/ads', {
    method: editingId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      id: editingId || undefined,
    }),
  });
  
  if (response.ok) {
    // Refresh ads list
    const ads = await response.json();
    saveAds(ads);
  }
};
```

## Database Schema (Example)

If using Supabase/PostgreSQL:

```sql
CREATE TABLE wallet_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  background_color VARCHAR(7) DEFAULT '#8B5CF6',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  cta_text VARCHAR(100),
  cta_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT color_format CHECK (
    background_color ~ '^#[0-9A-Fa-f]{6}$' AND
    text_color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

CREATE INDEX idx_wallet_ads_active ON wallet_ads(is_active);
CREATE INDEX idx_wallet_ads_created_at ON wallet_ads(created_at DESC);
```

## Location in Dashboard

The carousel is positioned in the wallet dashboard (`src/pages/wallet/WalletDashboard.tsx`):

```
┌─────────────────────────────────────────┐
│  Upper Zone (Purple Gradient)            │
│  ┌───────────────────────���─────────────┐ │
│  │ Floating Action Buttons (4)          │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐ ← Curved transition
│                                          │
│  ┌───────────────────────────────────┐  │ ← AD CAROUSEL (NEW)
│  │  Auto-Scrolling Ad Banner         │  │
│  │  ≈ 160px height                    │  │
│  │  ≈ Full width responsive           │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Send & Receive                         │
│  ├─ Send Money                          │
│  └─ Deposit                             │
│                                          │
│  [More content sections below...]       │
└─────────────────────────────────────────┘
```

## Mobile Responsiveness

- **Mobile (< 640px):** 
  - Height: 128px (h-32)
  - Padding: 16px
  - Text: Small (sm)
  
- **Tablet/Desktop (≥ 640px):**
  - Height: 160px (h-40)
  - Padding: 24px
  - Text: Medium (base)

## Performance Optimization

- Auto-scroll timer is cleared when component unmounts
- Manual navigation clears auto-scroll timer (prevents concurrent scrolling)
- Active ads filter prevents rendering inactive ads
- CSS transitions use GPU acceleration (will-change is implicit)

## Testing

### Manual Testing Checklist
- [ ] Create an ad and verify it appears in carousel
- [ ] Verify auto-scroll cycles through ads
- [ ] Click left/right chevrons to navigate
- [ ] Click dot indicators to jump to ads
- [ ] Verify active/inactive toggle works
- [ ] Edit an ad and verify changes appear
- [ ] Delete an ad and verify removal
- [ ] Test on mobile (320px), tablet (768px), desktop (1200px)
- [ ] Verify CTA button navigates to correct URL
- [ ] Test with no ads (should show nothing)
- [ ] Test with 1 ad (no navigation controls)

### Localization Support

To add multi-language support:
1. Add translations to language files
2. Update form labels in AdminAdsManager
3. Update carousel display text if needed

## Future Enhancements

- [ ] Ad scheduling (start/end dates)
- [ ] Targeting by user segments
- [ ] Analytics/click tracking
- [ ] A/B testing variants
- [ ] Rotation rules (priority, frequency)
- [ ] Video ad support
- [ ] Animation effects
- [ ] Deep linking to app sections
- [ ] Admin approval workflow
- [ ] Budget/spend tracking

## Troubleshooting

**Carousel not showing ads:**
- Check localStorage: `console.log(localStorage.getItem('walletAds'))`
- Verify ads have `isActive: true`
- Check browser console for errors

**Images not loading:**
- Verify image URL is accessible from browser
- Check CORS headers if using external URLs
- Use HTTPS URLs (not HTTP)

**Colors look wrong:**
- Ensure hex colors are valid format (#RRGGBB)
- Test color contrast for accessibility
- Check browser color profile settings

**Auto-scroll not working:**
- Verify `autoScroll` prop is `true`
- Check `scrollInterval` is > 0
- Ensure component is mounted
- Check browser console for errors

## Admin Access

- **Path:** `/admin/ads`
- **Required Role:** admin or super_admin
- **Required Permission:** `content.moderate`
- **Accessible from:** Admin sidebar → "Wallet Ads"

## Support & Maintenance

For issues or feature requests related to the ad carousel system, contact the platform team with:
- Screenshot/video of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
