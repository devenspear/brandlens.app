# 🎯 BrandLens Production Architecture - Quick Reference

## Current Status vs Future State

### ❌ CURRENT LIMITATIONS
```
┌─────────────────────────────────────┐
│  NO USER ACCOUNTS                   │
│  ├─ Anyone can use any email        │
│  ├─ No login/authentication         │
│  └─ Can't retrieve past reports     │
│                                      │
│  NO EMAIL VERIFICATION               │
│  ├─ Fake emails accepted            │
│  └─ No automated notifications      │
│                                      │
│  NO MONETIZATION                     │
│  ├─ Unlimited free usage            │
│  ├─ ~$0.35 cost per analysis        │
│  └─ Losing money on every analysis  │
│                                      │
│  NO PDF EXPORT                       │
│  └─ Reports only viewable in-browser│
└─────────────────────────────────────┘
```

### ✅ FUTURE STATE (PRODUCTION SAAS)
```
┌─────────────────────────────────────┐
│  CLERK AUTHENTICATION               │
│  ├─ Email verification required     │
│  ├─ Optional 2FA                    │
│  ├─ User dashboard                  │
│  └─ Session management              │
│                                      │
│  RESEND EMAIL SERVICE               │
│  ├─ Welcome emails                  │
│  ├─ Analysis notifications          │
│  ├─ PDF delivery                    │
│  └─ React email templates           │
│                                      │
│  STRIPE BILLING                      │
│  ├─ 3 subscription tiers            │
│  ├─ Usage-based billing             │
│  ├─ $29-$99/month plans             │
│  └─ 60-70% profit margins           │
│                                      │
│  PUPPETEER PDF GENERATION            │
│  ├─ Pixel-perfect reports           │
│  ├─ Email attachments               │
│  ├─ Cached in Vercel Blob           │
│  └─ Serverless compatible           │
└─────────────────────────────────────┘
```

---

## Tech Stack (100% Vercel Compatible)

| Component | Technology | Free Tier | After Free |
|-----------|-----------|-----------|------------|
| 🔒 Auth | **Clerk** | 10k MAU | $25/mo |
| 📧 Email | **Resend** | 3k emails/mo | $20/mo |
| 📄 PDF | **Puppeteer + Sparticuz** | Unlimited | $0 |
| 💳 Payments | **Stripe** | $0 | 2.9% + $0.30 |
| 🗄️ Database | **PostgreSQL (Neon)** | 512 MB | $19/mo |
| ☁️ Hosting | **Vercel** | Hobby | $20/mo |

**Estimated cost (< 1k users):** $0-50/month

---

## Database Changes Needed

### New Tables (3)
```sql
-- User accounts with Clerk integration
User (clerkId, email, stripeCustomerId, subscriptionTier, credits)

-- Email tracking
EmailNotification (userId, type, status, sentAt, resendId)

-- Billing history
BillingTransaction (userId, stripeInvoiceId, amount, creditsAdded)
```

### Modified Tables (1)
```sql
-- Add user ownership
Project (
  + userId           -- Link to User
  + pdfUrl           -- Vercel Blob URL
  + pdfGeneratedAt   -- Cache timestamp
  + notificationSent -- Email sent flag
)
```

---

## Subscription Pricing

```
┌──────────────┬────────┬────────────┬──────────────────┐
│ Tier         │ Price  │ Analyses   │ Features         │
├──────────────┼────────┼────────────┼──────────────────┤
│ Free         │ $0     │ 3/month    │ Basic reports    │
│ Starter      │ $29/mo │ 10/month   │ + PDF + Email    │
│ Professional │ $99/mo │ 50/month   │ + API + Priority │
│ Enterprise   │ Custom │ Unlimited  │ + White-label    │
└──────────────┴────────┴────────────┴──────────────────┘

Cost per analysis: ~$0.35 (LLM inference)
Profit margins: 60-70% on paid tiers
```

---

## 4-Week Implementation Plan

### Week 1: Authentication (Phase 3A)
- [ ] Install Clerk
- [ ] Add User model to database
- [ ] Protect routes with middleware
- [ ] Create sign-in/sign-up pages
- [ ] Implement credit system
- [ ] Build user dashboard

### Week 2: Email (Phase 3B)
- [ ] Set up Resend
- [ ] Create React email templates
- [ ] Add EmailNotification table
- [ ] Send welcome emails
- [ ] Send analysis notifications
- [ ] Implement email preferences

### Week 3: PDF Export (Phase 3C)
- [ ] Install Puppeteer + Sparticuz
- [ ] Create PDF generation endpoint
- [ ] Add "Download PDF" button
- [ ] Attach PDFs to emails
- [ ] Cache PDFs in Vercel Blob
- [ ] Test on Vercel production

### Week 4: Billing (Phase 3D)
- [ ] Create Stripe products
- [ ] Build pricing page
- [ ] Implement checkout flow
- [ ] Set up webhooks
- [ ] Create billing dashboard
- [ ] Test subscription lifecycle

---

## Critical Security Updates

### ⚠️ URGENT: Next.js Vulnerability
**CVE-2025-29927** (CVSS 9.1) - Middleware bypass

**Fix:** Upgrade to:
- Next.js 15.2.3+ (currently using 15.5.4 ✅)
- OR 14.2.25+ / 13.5.9+ / 12.3.5+

**Status:** ✅ Already protected (using 15.5.4)

---

## Cost/Revenue Analysis

### Per Analysis Cost Breakdown
```
OpenAI GPT-4o:     $0.15
Anthropic Claude:  $0.12
Google Gemini:     $0.08
─────────────────────────
Total:             $0.35/analysis
```

### Monthly Revenue Projections
```
100 Starter users  × $29  = $2,900/mo
50  Pro users      × $99  = $4,950/mo
────────────────────────────────────
Total Revenue:              $7,850/mo

Cost of goods sold:        ($1,750)  (500 analyses × $0.35)
Infrastructure:              ($100)  (Clerk + Resend + Vercel)
────────────────────────────────────
Gross Profit:               $6,000/mo
Profit Margin:              76%
```

---

## Key Decisions Needed

### Before Implementation

1. **Pricing Approval**
   - Free: 3 analyses ✓
   - Starter: $29/mo for 10 ✓
   - Pro: $99/mo for 50 ✓
   - Enterprise: Custom ✓

2. **Tech Stack Approval**
   - Clerk for auth? ✓ or ✗
   - Resend for email? ✓ or ✗
   - Puppeteer for PDF? ✓ or ✗

3. **Migration Strategy**
   - Migrate existing projects to "Demo User"?
   - Or orphan old projects?

4. **Launch Timeline**
   - Target: 4 weeks from approval
   - Beta: +2 weeks
   - Public: +2 weeks

---

## Why These Choices?

### Clerk > NextAuth
- ⏱️ Setup: 30 min vs 4+ hours
- ✅ Email verification: Built-in vs manual
- 🔐 2FA: Built-in vs manual
- 💰 Free tier: 10k MAU

### Resend > Mailerlite/SendGrid
- 🚀 Built for Next.js/Vercel
- 📧 React email templates
- 🎯 Developer-first (not marketing tool)
- 💸 3k emails/month free

### Puppeteer > react-pdf
- 🎨 Pixel-perfect rendering
- 🔄 Same HTML as web version
- 📱 Responsive layouts preserved
- 🏗️ No separate PDF templates needed

---

## Questions for Approval

1. Do you approve the tech stack (Clerk, Resend, Puppeteer, Stripe)?
2. Do you approve the pricing tiers ($0, $29, $99, Custom)?
3. Should I proceed with Phase 3A (Authentication) first?
4. What's your target launch date?
5. Do you have accounts for Clerk/Resend, or should I guide setup?

---

**Status:** ✅ PLAN COMPLETE - Awaiting your approval

See `AUTHENTICATION_MONETIZATION_PLAN.md` for full technical details.

