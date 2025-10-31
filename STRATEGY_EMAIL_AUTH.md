# BrandLens User Authentication & Email Management Strategy

## Overview
This document outlines the strategy for capturing user information, managing email communications, and implementing progressive user data collection for the BrandLens application.

## Current Implementation (Phase 1) ✅

### Email Capture
- **Status**: Implemented
- **What We Have**:
  - Mandatory email field on the initial Brand Read form
  - Email validation using Zod
  - Email stored in the `Project` model in PostgreSQL
  - Database schema with email field indexed for efficient lookups

### Database Schema
```prisma
model Project {
  id          String   @id @default(cuid())
  url         String
  email       String   // Required field
  region      String?
  createdBy   String?
  status      ProjectStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
}
```

## Phase 2: Progressive Data Collection (Recommended Next Steps)

### User Model Enhancement
Create a separate `User` model to enable progressive profile building:

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  firstName    String?
  lastName     String?
  company      String?
  jobTitle     String?
  phone        String?

  // Marketing preferences
  marketingConsent     Boolean   @default(false)
  newsletterSubscribed Boolean   @default(true)

  // Metadata
  emailVerified        Boolean   @default(false)
  emailVerifiedAt      DateTime?
  lastLoginAt          DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  projects     Project[]

  @@index([email])
}

// Update Project model to reference User
model Project {
  id          String   @id @default(cuid())
  url         String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  region      String?
  // ... rest of fields
}
```

### Progressive Data Collection Flow

#### First Interaction (Current)
- Email only (mandatory)
- Purpose: Get report delivered, add to mailing list

#### Second Interaction (Report Results Page)
**Modal/Banner:** "Get exclusive insights and priority access"
- First Name (optional → becomes required for premium features)
- Last Name (optional)
- Company (optional)
- Job Title (optional)

**Value Proposition**:
- "Receive your full PDF report via email"
- "Get early access to new features"
- "Join our community newsletter"

#### Third Interaction (Future Features)
- Phone number for SMS notifications
- LinkedIn profile for professional networking
- Company size/industry for better recommendations

## Authentication Strategy

### Option A: Clerk (Recommended for MVP)

**Pros:**
- ✅ Drop-in authentication solution
- ✅ Handles email verification, password reset, magic links
- ✅ Built-in social auth (Google, GitHub, LinkedIn)
- ✅ User management dashboard
- ✅ Free tier: 10,000 monthly active users
- ✅ Excellent Next.js integration
- ✅ GDPR compliant

**Cons:**
- ❌ Additional dependency
- ❌ Cost scales with users ($25/mo for 10K-20K users)

**Implementation:**
```bash
npm install @clerk/nextjs
```

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Option B: NextAuth.js (Auth.js v5)

**Pros:**
- ✅ Open source, self-hosted
- ✅ No ongoing costs
- ✅ Full control over data
- ✅ Supports many providers
- ✅ Next.js native

**Cons:**
- ❌ More setup required
- ❌ Need to implement email sending
- ❌ Manage database sessions yourself

### Option C: Magic Link Only (Simplest)

**Pros:**
- ✅ No password to remember
- ✅ Email verification built-in
- ✅ Simple UX
- ✅ Can build on existing email infrastructure

**Cons:**
- ❌ Requires email infrastructure
- ❌ Users need email access every login
- ❌ Build custom session management

## Email Management Strategy

### Option A: Mailerlite (Recommended for Cost-Effective Start)

**Pricing:**
- Free tier: Up to 1,000 subscribers
- $10/mo: Up to 1,000 subscribers (premium features)
- $15/mo: Up to 2,500 subscribers

**Pros:**
- ✅ Affordable for early stage
- ✅ Easy-to-use email builder
- ✅ Automation workflows
- ✅ List segmentation
- ✅ Landing pages included
- ✅ Good deliverability
- ✅ GDPR compliant
- ✅ API for programmatic access

**Use Cases:**
- Newsletter distribution
- Report delivery notifications
- Drip campaigns for user onboarding
- Feature announcements

**Integration:**
```typescript
// lib/email/mailerlite.ts
import axios from 'axios';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

export async function addSubscriber(email: string, firstName?: string, lastName?: string) {
  const response = await axios.post(
    `https://connect.mailerlite.com/api/subscribers`,
    {
      email,
      fields: {
        name: firstName,
        last_name: lastName,
      },
      groups: [MAILERLITE_GROUP_ID],
    },
    {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
```

### Option B: Resend (Modern Transactional Email)

**Pricing:**
- Free: 3,000 emails/month
- $20/mo: 50,000 emails/month

**Pros:**
- ✅ Modern developer experience
- ✅ Great for transactional emails (reports, notifications)
- ✅ React Email templates
- ✅ Built for Next.js/Vercel
- ✅ Real-time webhook events

**Cons:**
- ❌ Not ideal for newsletters/marketing campaigns
- ❌ No built-in subscriber management

**Best For:**
- Sending PDF reports
- Account notifications
- Analysis completion emails

**Integration:**
```typescript
// lib/email/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBrandReport(email: string, reportUrl: string) {
  await resend.emails.send({
    from: 'BrandLens <reports@brandlens.app>',
    to: email,
    subject: 'Your AI Brand Read is Ready',
    html: `<p>Your Brand Read analysis is complete. <a href="${reportUrl}">View your report</a></p>`,
  });
}
```

### Hybrid Approach (Recommended)

**Transactional (Resend):**
- Report delivery
- Account verification
- Analysis notifications

**Marketing (Mailerlite):**
- Newsletter signup
- Drip campaigns
- Feature announcements
- User onboarding series

## Implementation Roadmap

### Phase 1: Email Capture ✅ (Completed)
- [x] Add email field to form
- [x] Update database schema
- [x] Update API validation
- [x] Store email with project

### Phase 2: Email Delivery (Week 1-2)
- [ ] Set up Resend account
- [ ] Create email templates for report delivery
- [ ] Implement PDF report generation
- [ ] Send email when analysis completes
- [ ] Test email deliverability

### Phase 3: Marketing Integration (Week 2-3)
- [ ] Set up Mailerlite account
- [ ] Create welcome email sequence
- [ ] Add subscribers to Mailerlite when they submit form
- [ ] Segment users by industry/use case
- [ ] Create monthly newsletter template

### Phase 4: Progressive Profiling (Week 3-4)
- [ ] Create User model in database
- [ ] Migrate email from Project to User
- [ ] Add profile completion modal on report page
- [ ] Track profile completion rate
- [ ] Incentivize profile completion (PDF download, premium features)

### Phase 5: Authentication (Week 4-6)
- [ ] Choose auth provider (Clerk recommended)
- [ ] Implement sign-up/sign-in flow
- [ ] Add "My Reports" dashboard
- [ ] Enable users to view past analyses
- [ ] Add share/collaborate features

### Phase 6: Advanced Features (Future)
- [ ] Email preferences center
- [ ] Unsubscribe management
- [ ] A/B test email campaigns
- [ ] User analytics dashboard
- [ ] Referral program

## Email Templates Needed

### 1. Report Ready Email
**Trigger:** Analysis completion
**Content:**
- Personalized greeting
- "Your Brand Read is ready"
- CTA to view report
- Brief preview of findings
- Social share buttons

### 2. Welcome Email
**Trigger:** First submission
**Content:**
- Thank you message
- What to expect
- Estimated completion time
- Link to example reports
- FAQ section

### 3. Profile Completion Email
**Trigger:** 24 hours after first report, no profile
**Content:**
- Value of completing profile
- Exclusive benefits
- Simple form link
- Social proof

### 4. Monthly Newsletter
**Trigger:** Monthly schedule
**Content:**
- Industry insights
- Feature updates
- User success stories
- Tips for brand improvement

## Data Privacy & Compliance

### GDPR Compliance
- ✅ Explicit consent for email collection
- ✅ Clear privacy policy link
- ✅ Easy unsubscribe mechanism
- ✅ Right to data deletion
- ✅ Data export capability

### CAN-SPAM Compliance
- ✅ Clear sender identification
- ✅ Accurate subject lines
- ✅ Physical address in footer
- ✅ Unsubscribe link in every email
- ✅ Honor opt-out requests within 10 days

## Budget Estimates

### Year 1 (0-1,000 users)
- **Clerk**: Free
- **Mailerlite**: $0-10/mo
- **Resend**: $0-20/mo
- **Total**: $0-30/mo

### Year 1 (1,000-5,000 users)
- **Clerk**: $25/mo
- **Mailerlite**: $50/mo
- **Resend**: $20/mo
- **Total**: $95/mo

### Year 2 (5,000-20,000 users)
- **Clerk**: $99/mo
- **Mailerlite**: $150/mo
- **Resend**: $80/mo
- **Total**: $329/mo

## Success Metrics

### Email Performance
- **Open Rate Target**: >25%
- **Click Rate Target**: >3%
- **Unsubscribe Rate**: <0.5%
- **Bounce Rate**: <2%

### User Growth
- **Monthly Signups**: Track trend
- **Profile Completion Rate**: >40%
- **Return User Rate**: >20%
- **Email Verification Rate**: >70%

### Engagement
- **Reports Generated per User**: Track average
- **Time to Profile Completion**: Track median
- **Feature Adoption**: Track usage

## Next Steps

1. **Immediate (This Week)**
   - Set up Resend account for transactional emails
   - Create basic email template for report delivery
   - Test email sending with sample report

2. **Short Term (Next 2 Weeks)**
   - Set up Mailerlite account
   - Design welcome email sequence
   - Implement subscriber sync

3. **Medium Term (Next Month)**
   - Add User model to database
   - Implement profile completion flow
   - Set up Clerk authentication

4. **Long Term (Next Quarter)**
   - Build user dashboard
   - Implement advanced email segmentation
   - Create referral program

## Questions to Consider

1. **Do we want passwordless (magic link) or password-based auth?**
   - Recommendation: Start with magic link (simpler UX)

2. **How aggressive should we be with progressive profiling?**
   - Recommendation: Gate premium features behind profile completion

3. **Should we verify emails before sending reports?**
   - Recommendation: Yes, to maintain sender reputation

4. **Do we want to offer team/organization accounts?**
   - Recommendation: Phase 2 feature after individual accounts work well

5. **What's our email sending volume estimate?**
   - Current: ~100 reports/month
   - 6 months: ~1,000 reports/month
   - 12 months: ~5,000 reports/month

## Technical Integration Checklist

### Environment Variables Needed
```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Transactional Email (Resend)
RESEND_API_KEY=

# Marketing Email (Mailerlite)
MAILERLITE_API_KEY=
MAILERLITE_GROUP_ID=

# Email Settings
FROM_EMAIL=reports@brandlens.app
REPLY_TO_EMAIL=support@brandlens.app
```

### Dependencies to Add
```bash
# Authentication
npm install @clerk/nextjs

# Email sending
npm install resend

# Email templates
npm install react-email @react-email/components

# Mailerlite integration
# (Use axios or native fetch - no dedicated package needed)
```

## Conclusion

This strategy provides a scalable, cost-effective approach to user authentication and email management for BrandLens. By starting with email capture and progressively building out more sophisticated features, we can validate demand while keeping initial costs low.

**Recommended Immediate Action**: Set up Resend for transactional emails and Mailerlite for marketing campaigns, then implement the email delivery system for completed reports.
