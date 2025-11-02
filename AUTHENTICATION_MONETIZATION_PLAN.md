# 🚀 BrandLens.app Authentication & Monetization Implementation Plan

**Date:** November 1, 2025
**Status:** Planning Phase - DO NOT EXECUTE YET
**Objective:** Transform BrandLens into a production SaaS with authentication, email delivery, PDF reports, and Stripe payments

---

## 📊 CURRENT DATABASE STATUS ANALYSIS

### ✅ What's Currently Stored

Based on `prisma/schema.prisma`, here's what the database **already tracks**:

#### **1. Projects Table**
```prisma
model Project {
  id                   String   @id @default(cuid())
  url                  String
  email                String   // ✅ EMAIL IS STORED
  region               String?
  humanBrandStatement  String?
  createdBy            String?  // ⚠️ NOT CURRENTLY USED (needs user ID)
  status               ProjectStatus
  progressMessage      String?
  progressPercent      Int?
  createdAt            DateTime
  updatedAt            DateTime
}
```

**Current Limitations:**
- ❌ Email is stored but NOT verified
- ❌ No user authentication (anyone can use any email)
- ❌ No user accounts (can't retrieve past reports)
- ❌ No session tracking
- ❌ `createdBy` field exists but is always null

#### **2. Reports Table**
```prisma
model Report {
  id         String   @id
  projectId  String
  urlToken   String   @unique  // ✅ PUBLIC URL TOKEN
  isPublic   Boolean  @default(false)
  version    Int
  data       Json
  createdAt  DateTime
  updatedAt  DateTime
  expiresAt  DateTime?
}
```

**Current Capabilities:**
- ✅ Every report is stored in the database
- ✅ Shareable URLs via `urlToken`
- ✅ Report expiration support (not currently enforced)
- ❌ No user ownership tracking

#### **3. Complete Analysis Data Stored**

Every analysis includes:
- ✅ **Sources** - All scraped pages (full content + metadata)
- ✅ **LLM Runs** - All provider responses (OpenAI, Anthropic, Google)
- ✅ **Findings** - All extracted insights (8 categories × 3 providers)
- ✅ **Competitors** - Competitive positioning data
- ✅ **Cost Tracking** - Tokens used + estimated cost per run

### ⚠️ What's MISSING for Production SaaS

1. **User Accounts** - No way to link multiple projects to one user
2. **Email Verification** - Anyone can use any email (including fake ones)
3. **Authentication** - No login/logout, no protected routes
4. **Billing** - No payment tracking, subscription status, or usage limits
5. **PDF Generation** - Reports only viewable via web, no PDF download
6. **Email Delivery** - No automated email sending for report completion

---

## 🏗️ RECOMMENDED ARCHITECTURE

### **Technology Stack (100% Vercel-Compatible)**

| Component | Technology | Why? |
|-----------|-----------|------|
| **Authentication** | **Clerk** | - 30-min setup, pre-built UI<br>- Email verification + 2FA built-in<br>- User management dashboard<br>- Vercel one-click integration<br>- Free tier: 10k MAU |
| **Email Service** | **Resend** | - Built for Next.js/Vercel<br>- React Email templates<br>- 3,000 emails/month free<br>- Simple API, great DX |
| **PDF Generation** | **Puppeteer + Sparticuz/Chromium** | - Pixel-perfect React → PDF<br>- Serverless-compatible<br>- Vercel function ready |
| **Payments** | **Stripe** | - Industry standard<br>- Subscription + usage billing<br>- Webhooks for Vercel<br>- You already have account |
| **Database** | **PostgreSQL (existing)** | - Already using Prisma<br>- Neon for serverless |

---

## 🗄️ DATABASE SCHEMA CHANGES

### **New Tables Needed**

#### **1. User Table**
```prisma
model User {
  id                String   @id @default(cuid())
  clerkId           String   @unique  // Clerk user ID
  email             String   @unique
  emailVerified     Boolean  @default(false)
  firstName         String?
  lastName          String?
  profileImageUrl   String?

  // Subscription/Billing
  stripeCustomerId  String?  @unique
  subscriptionTier  SubscriptionTier @default(FREE)
  subscriptionStatus String?  // active, canceled, past_due
  currentPeriodEnd  DateTime?

  // Usage Tracking
  creditsRemaining  Int      @default(3)  // Free tier: 3 analyses
  creditsUsedTotal  Int      @default(0)

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?

  // Relations
  projects          Project[]
  emailNotifications EmailNotification[]

  @@index([clerkId])
  @@index([email])
  @@index([stripeCustomerId])
}

enum SubscriptionTier {
  FREE          // 3 analyses/month
  STARTER       // 10 analyses/month
  PROFESSIONAL  // 50 analyses/month
  ENTERPRISE    // Unlimited
}
```

#### **2. Email Notifications Table**
```prisma
model EmailNotification {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  type        EmailType
  recipient   String
  subject     String
  status      EmailStatus @default(PENDING)
  sentAt      DateTime?
  error       String?
  resendId    String?  // Resend email ID
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([projectId])
  @@index([status])
}

enum EmailType {
  WELCOME
  EMAIL_VERIFICATION
  ANALYSIS_STARTED
  ANALYSIS_COMPLETE
  ANALYSIS_FAILED
  CREDIT_LOW
  SUBSCRIPTION_EXPIRING
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  BOUNCED
  FAILED
}
```

#### **3. Billing/Usage Table**
```prisma
model BillingTransaction {
  id                String   @id @default(cuid())
  userId            String
  stripeInvoiceId   String?  @unique
  stripePaymentId   String?
  amount            Float
  currency          String   @default("usd")
  description       String
  status            String   // succeeded, pending, failed
  creditsAdded      Int?
  createdAt         DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([stripeInvoiceId])
}
```

### **Modified Tables**

#### **Project Table Updates**
```prisma
model Project {
  // ADD these fields:
  userId            String?  // Link to User
  pdfGeneratedAt    DateTime?
  pdfUrl            String?  // S3/Vercel Blob URL
  notificationSent  Boolean  @default(false)

  // UPDATE relation:
  user              User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  // NEW index:
  @@index([userId])
}
```

---

## 📧 EMAIL IMPLEMENTATION PLAN

### **Resend Setup (Recommended)**

#### **Why Resend?**
- Built specifically for Next.js/Vercel
- Creates React Email templates (reusable components)
- 3,000 emails/month free
- Simple API: `await resend.emails.send({ ... })`
- Takes 10 minutes to set up

#### **Email Templates Needed**

1. **Welcome Email** - New user signup
2. **Analysis Started** - Confirmation with estimated time
3. **Analysis Complete** - Link to report + PDF attachment
4. **Analysis Failed** - Error details + retry option
5. **Credit Low Warning** - "1 analysis remaining"
6. **Subscription Receipts** - Stripe webhooks → email

#### **Implementation Example**
```typescript
// lib/email/templates/analysis-complete.tsx
import { Button, Html, Text } from '@react-email/components';

export default function AnalysisCompleteEmail({
  userName,
  reportUrl,
  websiteUrl
}) {
  return (
    <Html>
      <Text>Hi {userName},</Text>
      <Text>Your Brand Lens analysis for {websiteUrl} is complete!</Text>
      <Button href={reportUrl}>View Your Report</Button>
      <Text>PDF report attached.</Text>
    </Html>
  );
}

// lib/email/send.ts
import { Resend } from 'resend';
import AnalysisCompleteEmail from './templates/analysis-complete';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAnalysisComplete(user, project, reportUrl) {
  await resend.emails.send({
    from: 'Brand Lens <reports@brandlens.app>',
    to: user.email,
    subject: `Your Brand Analysis is Ready - ${project.url}`,
    react: AnalysisCompleteEmail({
      userName: user.firstName,
      reportUrl,
      websiteUrl: project.url
    }),
    attachments: [
      {
        filename: 'brand-analysis.pdf',
        content: pdfBuffer,  // Generated PDF
      }
    ]
  });
}
```

---

## 🔒 AUTHENTICATION IMPLEMENTATION PLAN

### **Clerk Setup (Recommended)**

#### **Why Clerk over NextAuth?**

| Feature | Clerk | NextAuth/Auth.js |
|---------|-------|------------------|
| Setup Time | 30 min | 4+ hours |
| Email Verification | Built-in | Manual setup |
| 2FA/MFA | Built-in | Manual setup |
| User Dashboard | Pre-built UI | Build yourself |
| Vercel Integration | One-click | Manual |
| Free Tier | 10k MAU | Unlimited (self-host) |
| Best For | **SaaS products** | Full control |

#### **Step-by-Step Implementation**

##### **1. Install Clerk**
```bash
npm install @clerk/nextjs
```

##### **2. Environment Variables** (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

##### **3. Middleware Protection** (middleware.ts)
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/report/(.*)',  // Require login to view reports
  '/api/projects(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

##### **4. App Layout Updates** (app/layout.tsx)
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

##### **5. Sign-In/Sign-Up Pages**

Create minimal pages:
- `/app/sign-in/[[...sign-in]]/page.tsx`
- `/app/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <SignIn />
}
```

##### **6. User Sync with Database** (Webhooks)

Create webhook endpoint: `/app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma/client'

export async function POST(req: Request) {
  const payload = await req.json()
  const headers = req.headers

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const evt = wh.verify(JSON.stringify(payload), {
    'svix-id': headers.get('svix-id')!,
    'svix-timestamp': headers.get('svix-timestamp')!,
    'svix-signature': headers.get('svix-signature')!,
  })

  if (evt.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        emailVerified: evt.data.email_addresses[0].verification?.status === 'verified',
        firstName: evt.data.first_name,
        lastName: evt.data.last_name,
        profileImageUrl: evt.data.profile_image_url,
        creditsRemaining: 3,  // Free tier
      }
    })
  }

  return new Response('', { status: 200 })
}
```

##### **7. Update Project Creation API**

```typescript
// app/api/projects/route.ts
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // Check credits
  if (user.creditsRemaining <= 0 && user.subscriptionTier === 'FREE') {
    return NextResponse.json({
      error: 'No credits remaining. Please upgrade.'
    }, { status: 402 })
  }

  // Create project
  const project = await prisma.project.create({
    data: {
      url: validated.url,
      email: user.email,  // Use authenticated email
      userId: user.id,
      region: validated.region,
      humanBrandStatement: validated.humanBrandStatement,
    }
  })

  // Decrement credits
  await prisma.user.update({
    where: { id: user.id },
    data: {
      creditsRemaining: { decrement: 1 },
      creditsUsedTotal: { increment: 1 }
    }
  })

  return NextResponse.json(project)
}
```

---

## 📄 PDF GENERATION IMPLEMENTATION

### **Puppeteer + Sparticuz/Chromium (Recommended)**

#### **Why This Approach?**
- ✅ Pixel-perfect rendering of existing React report pages
- ✅ Vercel serverless compatible
- ✅ No size limit issues (50MB unzipped)
- ✅ Same HTML/CSS as web version

#### **Installation**
```bash
npm install puppeteer-core @sparticuz/chromium
npm install --save-dev puppeteer  # Local development only
```

#### **Configuration** (next.config.ts)
```typescript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
}
```

#### **API Endpoint** (/app/api/reports/[token]/pdf/route.ts)

```typescript
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params

  // Get report
  const report = await prisma.report.findUnique({
    where: { urlToken: token },
    include: { project: true }
  })

  if (!report) {
    return new Response('Not found', { status: 404 })
  }

  // Launch browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.NODE_ENV === 'production'
      ? await chromium.executablePath()
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: chromium.headless,
  })

  const page = await browser.newPage()

  // Navigate to report page
  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${token}?pdf=true`
  await page.goto(reportUrl, { waitUntil: 'networkidle0', timeout: 30000 })

  // Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  })

  await browser.close()

  // Return PDF
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="brand-analysis-${report.project.url}.pdf"`,
    },
  })
}
```

#### **Optimization: Cache PDFs**

```typescript
// Generate once, store in Vercel Blob
import { put } from '@vercel/blob'

async function generateAndStorePDF(reportToken: string) {
  const pdfBuffer = await generatePDF(reportToken)

  const { url } = await put(`reports/${reportToken}.pdf`, pdfBuffer, {
    access: 'public',
    addRandomSuffix: false,
  })

  await prisma.report.update({
    where: { urlToken: reportToken },
    data: { pdfUrl: url, pdfGeneratedAt: new Date() }
  })

  return url
}
```

---

## 💳 STRIPE INTEGRATION PLAN

### **Subscription Tiers**

| Tier | Price | Analyses/Month | Features |
|------|-------|----------------|----------|
| **Free** | $0 | 3 | Basic reports, 7-day retention |
| **Starter** | $29/mo | 10 | PDF export, email delivery, 30-day retention |
| **Professional** | $99/mo | 50 | Priority analysis, API access, unlimited retention |
| **Enterprise** | Custom | Unlimited | White-label, dedicated support, SLA |

### **Usage-Based Add-On**
- Pay-per-analysis: $9.99 per additional analysis
- Analysis packs: 10 for $79 (20% discount)

### **Implementation Steps**

#### **1. Install Stripe**
```bash
npm install stripe @stripe/stripe-js
```

#### **2. Create Products in Stripe Dashboard**
- Create subscription products with price IDs
- Set up webhook endpoint: `https://brandlens.app/api/webhooks/stripe`

#### **3. Checkout Session Endpoint** (/app/api/stripe/checkout/route.ts)

```typescript
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { userId } = auth()
  const { priceId } = await req.json()

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    })

    customerId = customer.id

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId }
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}
```

#### **4. Webhook Handler** (/app/api/webhooks/stripe/route.ts)

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      // Update user subscription status
      await handleSubscriptionCreated(session)
      break

    case 'invoice.payment_succeeded':
      // Renew credits
      await handlePaymentSucceeded(event.data.object)
      break

    case 'customer.subscription.deleted':
      // Downgrade to free tier
      await handleSubscriptionCanceled(event.data.object)
      break
  }

  return new Response('', { status: 200 })
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: session.customer as string }
  })

  // Determine tier from price ID
  const tier = getTierFromPriceId(subscription.items.data[0].price.id)
  const credits = getCreditsForTier(tier)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      creditsRemaining: credits,
    }
  })
}
```

---

## 🗂️ IMPLEMENTATION ROADMAP

### **Phase 3A: Authentication & User Management (Week 1)**

**Goal:** Enable user accounts with email verification

**Tasks:**
1. Install Clerk, configure environment variables
2. Update database schema (add User model)
3. Run `npx prisma db push`
4. Create sign-in/sign-up pages
5. Add middleware protection
6. Create Clerk webhook endpoint
7. Update project creation to require authentication
8. Add user dashboard showing past analyses
9. Test email verification flow

**Deliverables:**
- ✅ Users can sign up with email verification
- ✅ 2FA optional but available
- ✅ Protected routes require login
- ✅ Projects linked to user accounts
- ✅ Credit system enforced (3 free analyses)

---

### **Phase 3B: Email Notifications (Week 2)**

**Goal:** Automated email delivery for all project events

**Tasks:**
1. Sign up for Resend, get API key
2. Install Resend + React Email
3. Create email templates (5 types)
4. Add EmailNotification table to schema
5. Integrate email sending into analysis flow
6. Add email preferences to user dashboard
7. Test deliverability

**Deliverables:**
- ✅ Welcome email on signup
- ✅ "Analysis started" confirmation
- ✅ "Analysis complete" with report link
- ✅ PDF attachment in completion email
- ✅ Failure notifications
- ✅ Credit low warnings

---

### **Phase 3C: PDF Generation (Week 3)**

**Goal:** Enable PDF export and email delivery

**Tasks:**
1. Install Puppeteer + Sparticuz/Chromium
2. Configure Next.js for serverless PDF generation
3. Create PDF generation API endpoint
4. Add "Download PDF" button to report page
5. Integrate with email notifications
6. Optional: Cache PDFs in Vercel Blob
7. Test on Vercel (not just local)

**Deliverables:**
- ✅ "Download PDF" button on reports
- ✅ PDF attached to completion emails
- ✅ Cached PDFs for repeated downloads
- ✅ Works on Vercel serverless

---

### **Phase 3D: Stripe Integration (Week 4)**

**Goal:** Enable paid subscriptions and usage-based billing

**Tasks:**
1. Create Stripe products/prices
2. Install Stripe SDK
3. Create checkout session endpoint
4. Build pricing page with subscription tiers
5. Create Stripe webhook handler
6. Implement credit renewal on payment
7. Add billing dashboard (invoices, payment method)
8. Test subscription lifecycle (create, renew, cancel)

**Deliverables:**
- ✅ Pricing page with 3 tiers
- ✅ Checkout flow for subscriptions
- ✅ Automatic credit renewal
- ✅ Billing dashboard
- ✅ Usage-based overage charges
- ✅ Invoice history

---

## 📋 COST ANALYSIS (Per User/Month)

### **Infrastructure Costs**

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| **Clerk** | 10k MAU | $25/mo (Pro plan) |
| **Resend** | 3k emails | $20/mo (10k emails) |
| **Vercel** | Hobby plan | $20/mo (Pro plan) |
| **Neon (PostgreSQL)** | 512 MB storage | $19/mo (1 GB) |
| **Stripe** | $0 | 2.9% + $0.30/transaction |
| **Vercel Blob (PDFs)** | 500 MB | $0.15/GB/month |

**Estimated Monthly Cost (under 1k users):** $0 - $50/month

### **LLM Inference Costs (Per Analysis)**

Based on current usage:
- OpenAI GPT-4o: ~$0.15/analysis
- Anthropic Claude: ~$0.12/analysis
- Google Gemini: ~$0.08/analysis

**Total per analysis:** ~$0.35

### **Pricing Strategy**

- **Free tier:** Loss leader (absorb $1.05 cost for 3 analyses)
- **Starter ($29/mo):** Break even at ~$3.50/analysis ($35 revenue / 10 analyses)
- **Professional ($99/mo):** Profitable at ~$1.98/analysis ($99 / 50 analyses)
- **Profit margin:** 60-70% on paid tiers

---

## 🔐 SECURITY BEST PRACTICES

### **Critical: CVE-2025-29927 Protection**

**MUST upgrade Next.js to:**
- 15.2.3+
- 14.2.25+
- 13.5.9+

Check current version:
```bash
npm list next
```

### **Environment Variable Security**

**Never commit:**
```
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
```

**Vercel Setup:**
1. Add all secrets via Vercel dashboard
2. Redeploy after adding env vars
3. Use different keys for preview vs production

### **Webhook Security**

**ALWAYS verify signatures:**
```typescript
// Clerk webhook
const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
const evt = wh.verify(payload, headers)

// Stripe webhook
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

### **Rate Limiting**

Use Vercel Edge Config + middleware:
```typescript
import rateLimit from '@/lib/rate-limit'

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for')
  const { success } = await rateLimit(ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
}
```

---

## 🚀 GO-TO-MARKET STRATEGY

### **Launch Sequence**

1. **Soft Launch (Friends & Family)**
   - 50 beta users
   - Free unlimited access
   - Collect feedback

2. **Product Hunt Launch**
   - Lifetime deal for early adopters
   - $99 one-time (normally $29/mo)

3. **Paid Launch**
   - Enable Stripe
   - Start marketing

### **Marketing Channels**

- Real estate marketing agencies
- HOA management companies
- Property developers
- Web design agencies (referral partners)

---

## 📊 SUCCESS METRICS

### **North Star Metric**
**Paid conversions:** % of free users who upgrade within 30 days

### **Key Metrics to Track**

1. **Acquisition**
   - Signups per week
   - Traffic sources
   - Conversion rate (visitor → signup)

2. **Activation**
   - % completing first analysis
   - Time to first analysis
   - Email verification rate

3. **Retention**
   - Monthly active users
   - Churn rate
   - Analyses per user

4. **Revenue**
   - MRR (Monthly Recurring Revenue)
   - ARPU (Average Revenue Per User)
   - LTV:CAC ratio

5. **Technical**
   - Analysis completion rate
   - Average analysis time
   - Error rate by provider

---

## ✅ PRE-LAUNCH CHECKLIST

### **Before Implementing**

- [ ] Review and approve this plan
- [ ] Set up Clerk account (get API keys)
- [ ] Set up Resend account (verify domain)
- [ ] Configure Stripe products/prices
- [ ] Decide on initial pricing tiers
- [ ] Review database schema changes
- [ ] Plan migration strategy for existing data
- [ ] Backup production database

### **Legal/Compliance**

- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] GDPR compliance (EU users)
- [ ] Data retention policy
- [ ] Refund policy

---

## 🎯 NEXT STEPS

**1. Review this plan and decide:**
   - Approve architecture choices (Clerk, Resend, Stripe)
   - Confirm pricing tiers
   - Prioritize phases

**2. When ready to proceed:**
   - Sign up for Clerk, Resend accounts
   - I'll implement Phase 3A (Authentication) first
   - We'll test thoroughly before moving to Phase 3B

**3. Questions to answer:**
   - Do you want to migrate existing projects to have user owners?
   - Should free tier reset monthly or per signup?
   - What's the target launch date?

---

**Generated by Claude Code**
**Status:** PLANNING COMPLETE - Awaiting approval to proceed with Phase 3A

