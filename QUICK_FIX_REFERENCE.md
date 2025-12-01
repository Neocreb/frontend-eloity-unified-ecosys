# Quick Fix Reference Card

## 🚀 Start Here - Immediate Actions

### 1. Deploy Edge Function (2 minutes)
```bash
supabase functions deploy create-group-with-participants
```

### 2. Set Environment Variables (2 minutes)
Use DevServerControl to set:
```
CRYPTOAPIS_API_KEY=<get from https://cryptoapis.io>
RELOADLY_API_KEY=<get from https://www.reloadly.com as Client ID>
RELOADLY_API_SECRET=<get from https://www.reloadly.com as Client Secret>
```

### 3. Fix RLS Policies (5 minutes)
Go to Supabase Dashboard → SQL Editor
Copy and paste SQL from: `FIX_GROUP_CHATS_GUIDE.md` → Step 2

### 4. Fix Storage Buckets (5 minutes)
Go to Supabase Dashboard → Storage
For each bucket (posts, stories, avatars):
- Click bucket
- Go to "Policies" tab
- Create "Public read access" policy with expression: `true`
- Mark bucket as "Public"

### 5. Test Everything (10 minutes)
- Create post with image → refresh → image persists ✓
- Create group chat → appears in chat list ✓
- Crypto page shows prices ✓
- Wallet shows real operators ✓
- Admin pages show real data ✓

---

## 📋 Issue Summary & Solutions

| Issue | Root Cause | Quick Fix | Full Guide |
|-------|-----------|----------|-----------|
| Group chats not showing | RLS policies not set | Run SQL in Supabase | `FIX_GROUP_CHATS_GUIDE.md` |
| Post images disappear | Bucket not public | Make bucket public | `FIX_POST_IMAGES_GUIDE.md` |
| CRYPTOAPI fails | API key not set | Set `CRYPTOAPIS_API_KEY` | `FIX_API_INTEGRATIONS_GUIDE.md` |
| RELOADLY uses mocks | Credentials not set | Set API credentials | `FIX_API_INTEGRATIONS_GUIDE.md` |

---

## 🔧 Environment Variables

**Development (DevServerControl):**
```
CRYPTOAPIS_API_KEY=your_key
RELOADLY_API_KEY=your_client_id
RELOADLY_API_SECRET=your_client_secret
```

**Production (Netlify/Vercel):**
Add to environment variables in dashboard and redeploy.

---

## 📂 Files Overview

### Guides (Read These)
- `IMPLEMENTATION_PLAN_SUMMARY.md` - Complete overview
- `FIX_GROUP_CHATS_GUIDE.md` - Group chats detailed fix
- `FIX_POST_IMAGES_GUIDE.md` - Post images detailed fix
- `FIX_API_INTEGRATIONS_GUIDE.md` - API setup detailed guide

### Code Changes
- `src/utils/imageStorageHelper.ts` - NEW utility for image handling
- `src/pages/admin/AdminAirtimeManagement.tsx` - UPDATED to use real API
- `src/pages/admin/AdminDataManagement.tsx` - UPDATED to use real API
- `src/pages/admin/AdminUtilitiesManagement.tsx` - UPDATED to use real API
- `src/pages/admin/AdminGiftCardsManagement.tsx` - UPDATED to use real API

### Scripts
- `scripts/diagnose-all-issues.cjs` - Diagnostic tool
- `scripts/fix-storage-bucket-public.cjs` - Storage helper script

---

## ✅ Testing Checklist

### Group Chats (5 min)
- [ ] Edge Function deployed
- [ ] RLS policies applied
- [ ] Create group chat
- [ ] Group shows in list
- [ ] Messages work

### Post Images (5 min)
- [ ] Bucket is public
- [ ] Upload post with image
- [ ] Refresh page
- [ ] Image still shows

### CRYPTOAPI (3 min)
- [ ] API key set
- [ ] Crypto page loads
- [ ] Prices display

### RELOADLY (5 min)
- [ ] API credentials set
- [ ] Wallet shows operators
- [ ] Admin shows data
- [ ] Transaction works

---

## 🐛 Troubleshooting

**Group chats still not showing?**
→ Check RLS policies in Supabase Dashboard → Tables → Policies

**Images still disappearing?**
→ Verify bucket is PUBLIC in Storage settings

**CRYPTOAPI still fails?**
→ Check: Server logs → "API key not set" message

**RELOADLY still shows mocks?**
→ Check: Both API_KEY and API_SECRET are set

**Not sure?**
→ Run: `node scripts/diagnose-all-issues.cjs`

---

## 📞 Support Resources

- CRYPTOAPI Docs: https://cryptoapis.io/docs
- RELOADLY Docs: https://developers.reloadly.com/docs
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎯 Next Steps

1. ✅ Follow "Immediate Actions" section above
2. ✅ Read relevant guide for each issue
3. ✅ Run testing checklist
4. ✅ Verify all features working
5. ✅ Deploy to production with environment variables

**Estimated Time: 30 minutes** ⏱️

---

**Questions?** Check the detailed guides for step-by-step instructions.
