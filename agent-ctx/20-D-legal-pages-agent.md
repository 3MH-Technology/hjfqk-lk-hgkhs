# Task 20-D: Legal Pages + Landing Update Agent

## Work Summary

### Files Created
1. **`/src/components/wolf/legal/privacy.tsx`** — Privacy Policy page (Arabic RTL)
2. **`/src/components/wolf/legal/terms.tsx`** — Terms of Service page (Arabic RTL)
3. **`/src/app/api/platform-config/route.ts`** — Platform Config API endpoint

### Files Modified
1. **`/src/components/wolf/landing.tsx`** — Pricing section (USD + Pro badges + footer links)
2. **`/src/app/page.tsx`** — Added privacy/terms routing + imports

### Changes Made

#### 1. Privacy Policy Page (`privacy.tsx`)
- 8 professional sections with shield/lock/database/cookie icons
- Clean max-w-4xl container with staggered framer-motion animations
- "العودة" back button navigating to landing page
- Last updated: يوليو 2025

#### 2. Terms of Service Page (`terms.tsx`)
- 9 professional sections covering all required topics
- Note: "لتطوير الخطة يجب التواصل مع المطور عبر تيليجرام"
- Same design language as privacy page

#### 3. Pricing Section Update (landing.tsx)
- Free: $0/شهر (2 bots, 256MB RAM, read-only files, no API keys, no webhooks)
- Pro: $9.99/شهر (10 bots, 1GB RAM, API keys, webhooks, advanced monitoring, priority support)
- Enterprise: $29.99/شهر (50 bots, 4GB RAM, all features, custom support, advanced API)
- "برو" badge on Pro-only features
- Pro/Enterprise CTAs → "تواصل مع المطور" → contact section
- Pricing note below cards

#### 4. Footer Links
- Quick links column: سياسة الخصوصية + شروط الاستخدام
- Copyright bar: separator pipe links

#### 5. Platform Config API
- GET `/api/platform-config` returns all PlatformConfig entries as `{ [key]: value }`

#### 6. Page Routing
- Privacy and Terms pages accessible without authentication
- Added to allowed unauthenticated pages in page.tsx

### Verification
- `bun run lint`: zero errors
