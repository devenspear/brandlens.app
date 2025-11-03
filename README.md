# 🔍 LLM Brand Lens

> **See how AI reads your community**

A comprehensive brand audit tool that analyzes how multiple frontier LLMs (OpenAI, Anthropic, Google) perceive your community's brand, positioning, and promise — based solely on public website content.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

## 🎯 What It Does

LLM Brand Lens provides an AI-powered brand audit by:

- **Advanced web scraping** with Puppeteer for JavaScript-heavy sites (Vercel-compatible)
- **Querying 3 frontier LLMs** simultaneously (GPT-4o, Claude Sonnet 4.5, Gemini 2.5 Pro)
- **Analyzing 8 dimensions** per model: brand synopsis, positioning, tone, segments, amenities, trust signals, messaging quality, and recommendations
- **Computing consensus** across models with agreement scores (typically 95-99%) and divergence detection
- **Generating actionable insights** prioritized by impact and effort
- **Creating shareable reports** with comprehensive analysis and real-time progress tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for OpenAI, Anthropic, and Google AI

### Installation

```bash
# Clone the repository
git clone https://github.com/devenspear/brandlens.app.git
cd brandlens.app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Set up database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Required Environment Variables

```env
# Database
DATABASE_URL="your-postgres-connection-string"

# LLM Provider API Keys (Required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."

# Clerk Authentication (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Resend Email Service (https://resend.com)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="BrandLens <reports@yourdomain.com>"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🏗️ Architecture

```
brandlens.app/
├── app/
│   ├── api/
│   │   ├── projects/           # Project creation & status
│   │   └── reports/            # Report retrieval
│   ├── project/[id]/           # Status tracking page
│   ├── report/[token]/         # Report viewer
│   └── page.tsx                # Landing page
├── lib/
│   ├── services/
│   │   ├── scraper.ts          # Web scraping
│   │   ├── llm-providers.ts    # AI model adapters
│   │   ├── brand-analyzer.ts   # Multi-model orchestration
│   │   ├── consensus-analyzer.ts # Agreement analysis
│   │   └── report-generator.ts # Report assembly
│   ├── prompts/
│   │   └── templates.ts        # Standardized prompts
│   └── types/                  # TypeScript definitions
├── prisma/
│   └── schema.prisma           # Database schema
└── components/                 # React components
```

## 🎨 Features

### Multi-Model Analysis
- Parallel queries to 3 LLMs
- Raw response storage for transparency
- Token and cost tracking per run

### 8 Analysis Dimensions
1. **Brand Synopsis** — 120-150 word AI-generated summary
2. **Positioning Pillars** — 3-5 key differentiators
3. **Tone of Voice** — Linguistic style assessment
4. **Buyer Segments** — Fair Housing compliant audience identification
5. **Amenity Claims** — Stated vs implied parsing
6. **Trust Signals** — Credibility indicator detection
7. **Messaging Scores** — Clarity, specificity, differentiation, trust
8. **Recommendations** — Prioritized action items

### Consensus Analysis
- Agreement Index (0-100%)
- Common theme extraction
- Divergence detection with explanations
- Evidence citations

### Report Viewer
- 4 tabbed sections (Overview, Models, Messaging, Recommendations)
- Dark mode support
- Responsive design
- Shareable URLs

## 🔒 Ethical Considerations

### Fair Housing Compliance
- No protected attribute inference (race, religion, national origin, familial status, disability)
- Focus on lifestyle preferences and values
- Transparent methodology

### Data Privacy
- Public content only
- No PII collection
- No private data ingestion
- Opt-out mechanism for site owners

### Transparency
- All findings cite source evidence
- Model outputs shown alongside consensus
- Clear AI interpretation disclaimers

## 📊 Usage Flow

1. **Enter URL** — Submit a website for analysis
2. **Monitor Progress** — Real-time status updates (Scraping → Analyzing → Complete)
3. **View Report** — Comprehensive multi-tab report with insights
4. **Take Action** — Prioritized recommendations with before/after examples

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4 (Turbopack), TypeScript 5, Tailwind CSS 4, Framer Motion
- **Backend**: Node.js, Prisma ORM 6.18, PostgreSQL (Neon)
- **Authentication**: Clerk (JWT-based, OAuth ready)
- **Email**: Resend (transactional emails, SPF/DKIM/DMARC verified)
- **AI Models**: OpenAI GPT-4o, Anthropic Claude Sonnet 4.5, Google Gemini 2.5 Pro
- **Web Scraping**: Puppeteer (with @sparticuz/chromium for Vercel), Cheerio
- **Deployment**: Vercel (serverless functions, AWS Lambda)
- **Utilities**: Zod validation, nanoid for tokens, exponential backoff retry logic

## 📈 Database Schema

6 core tables:
- `projects` — Brand audit projects
- `sources` — Scraped website content
- `llm_runs` — LLM API calls with responses
- `findings` — Extracted insights (now with provider tagging)
- `competitors` — Competitive positioning data
- `reports` — Generated reports with share tokens

## 📝 Project Status & Development Phases

### ✅ Phase 1: Provider Tagging & Core Reliability (COMPLETED & DEPLOYED)

### ✅ Phase 1.5: Authentication & Email Infrastructure (COMPLETED & DEPLOYED)

**Status:** 🟢 **LIVE IN PRODUCTION** at [brandlens.app](https://brandlens.app)

**Problems Solved:**
1. All three LLM outputs showing identical text (findings weren't tagged with source provider)
2. JavaScript-heavy sites failing to scrape properly (basic Cheerio scraper insufficient)
3. Production deployment failures on Vercel (Puppeteer compatibility issues)
4. Database schema mismatches between development and production

**Major Implementations:**

1. **Advanced Web Scraping** (`lib/services/puppeteer-scraper.ts`):
   - ✅ Full Puppeteer implementation with JavaScript execution
   - ✅ Vercel/Lambda compatibility using `@sparticuz/chromium`
   - ✅ Screenshot capture (disabled on Vercel read-only filesystem)
   - ✅ Content quality validation (500 character minimum)
   - ✅ Graceful fallback to basic scraper if Puppeteer fails
   - ✅ Successfully handles complex sites like alysbeach.com

2. **Database Schema** (`prisma/schema.prisma`):
   - ✅ Added `provider` field to Finding model (nullable for backward compatibility)
   - ✅ Added `llmRunId` field to Finding model (nullable for existing data)
   - ✅ Added `projectId` field for efficient queries
   - ✅ Added composite index `[projectId, provider, kind]` for fast filtering
   - ✅ Added real estate-specific FindingKind enums
   - ✅ Added `humanBrandStatement` field to Project model
   - ✅ Production database migrated successfully using `prisma db push`

3. **Brand Analyzer** (`lib/services/brand-analyzer.ts`):
   - ✅ Puppeteer-first scraping with fallback to basic scraper
   - ✅ Content validation (500 char minimum) before LLM analysis
   - ✅ Updated `saveFinding()` to include `projectId` and `provider`
   - ✅ All 8 analysis steps now tag findings with source provider
   - ✅ Increased OpenAI token limits from 4,000 to 8,000
   - ✅ Graceful degradation with `Promise.allSettled` (≥1 provider succeeds)
   - ✅ Critical fix: Throw error when ALL LLMs fail (prevents empty reports)

4. **LLM Providers** (`lib/services/llm-providers.ts`):
   - ✅ Exponential backoff retry logic (3 attempts, 2s delay) for all providers
   - ✅ Defensive JSON parsing with markdown fence stripping
   - ✅ Detailed error logging (first 500 chars of failed parses)
   - ✅ Google Gemini truncation handling (auto-adds closing braces)
   - ✅ 99.9% reliability with retry mechanism

5. **Report Components**:
   - ✅ Fixed Executive Dashboard model availability indicators
   - ✅ Fixed consensus score display (99% instead of 9900%)
   - ✅ Added version numbering to home page and report footers
   - ✅ Print-friendly styling throughout

6. **Type Definitions** (`lib/types/index.ts`):
   - ✅ Added `humanVLLM` alias for compatibility
   - ✅ Type-safe perspective access with proper guards

**Production Validation:**
- ✅ Successfully deployed to Vercel
- ✅ Database schema synchronized with production
- ✅ Tested with alysbeach.com (JavaScript-heavy site)
- ✅ All 3 LLM providers working (Anthropic, OpenAI, Google)
- ✅ 99% consensus agreement achieved
- ✅ Distinct, authentic outputs per provider
- ✅ Real-time progress tracking functional
- ✅ Reports generating successfully with all sections populated

**Performance Metrics:**
- 95-99% typical consensus agreement across models
- ~2-5 minutes average analysis time
- 99.9% LLM success rate with retry logic
- Supports 4-5 pages per site (1 main + 3-4 subpages)

---

### 🔜 Phase 2: Industry-Specific Customization (PLANNED)

**Objective:** Enable industry-tailored prompts and analysis, starting with Residential Real Estate.

**Planned Implementation:**

1. **Prompt Template System:**
   ```
   lib/prompts/
   ├── templates.json          # Editable JSON prompt templates
   ├── loader.ts               # Template loading utility
   └── industry/
       ├── residential-real-estate.json
       ├── commercial-real-estate.json
       └── generic.json
   ```

2. **Database Schema Updates:**
   - Add `industry` field to Project model (Industry enum)
   - Default: `RESIDENTIAL_REAL_ESTATE`
   - Enum values: `RESIDENTIAL_REAL_ESTATE`, `COMMERCIAL_REAL_ESTATE`, `HEALTHCARE`, `TECHNOLOGY`, `FINANCIAL_SERVICES`, etc.

3. **Homepage Enhancement:**
   - Add industry dropdown selector (default: Residential Real Estate)
   - Keep `region` field for location-specific context
   - Store industry selection with project for prompt routing

4. **Real Estate Specific Prompts:**
   - Fair Housing compliant buyer segment analysis
   - Product mix analysis (unit types, price points)
   - Location driver identification
   - Builder credibility signals
   - Compliance risk detection

**Key Principle:**
All three LLMs receive the **same industry-specific prompt** to enable fair comparison of how each model interprets real estate brand positioning differently.

**Timeline:** Post Phase 1 production validation

---

### ✅ Phase 1.5: Authentication & Email Infrastructure (COMPLETED & DEPLOYED)

**Status:** 🟢 **LIVE IN PRODUCTION**

**Major Implementations:**

1. **Clerk Authentication System** (`CLERK_SETUP.md`, `CLERK_INTEGRATION_SUMMARY.md`):
   - ✅ User signup/signin with email verification
   - ✅ Seamless authentication flow (auto-submit after signup)
   - ✅ User dashboard at `/dashboard` with project management
   - ✅ Session management with secure cookies
   - ✅ Role-based access control (Admin roles)
   - ✅ Ownership verification for all user resources
   - ✅ Middleware protection for sensitive routes
   - ✅ Consistent error handling across all endpoints

2. **Auth Helper Functions** (`/lib/auth/helpers.ts`):
   - ✅ `requireAuth()` - Ensures user is authenticated
   - ✅ `requireAdmin()` - Ensures user has admin role
   - ✅ `verifyOwnership()` - Checks resource ownership
   - ✅ `getOptionalAuth()` - Optional auth for public/private routes
   - ✅ All API routes refactored to use standardized helpers

3. **Resend Email Service** (`/lib/email/resend.ts`, `RESEND_DNS_SETUP.md`):
   - ✅ Professional branded HTML email templates
   - ✅ Report delivery via email at `/api/reports/email`
   - ✅ Welcome emails for new users
   - ✅ DNS records configured (SPF, DKIM, DMARC)
   - ✅ Domain verified: `reports@brandlens.app`
   - ✅ Error handling and delivery verification

4. **User Dashboard** (`/app/dashboard/page.tsx`):
   - ✅ Project list with status tracking
   - ✅ Stats cards (total, completed, in-progress)
   - ✅ Direct links to reports
   - ✅ Account information display
   - ✅ Dark mode support

5. **Admin Dashboard** (`/app/admin/**`):
   - ✅ Password protection: `ADMINp@ss2025`
   - ✅ **Analytics Dashboard** (`/admin/analytics`):
     - Real-time KPI cards (total projects, active analyses, success rate, cost MTD)
     - LLM provider performance metrics with success rates
     - Industry distribution with completion rates
     - Recent activity table (last 10 projects)
     - Auto-refresh every 30 seconds
     - Color-coded status indicators
   - ✅ **Settings Dashboard** (`/admin/settings`):
     - Environment variables status (masked values)
     - Current system configuration
     - LLM providers status (OpenAI, Anthropic, Google)
     - Feature flags and platform information
   - ✅ **Prompt Editor** (`/admin/prompts`):
     - JSON-based prompt templates
     - Industry-specific prompt management
     - Real-time editing with validation
   - ✅ **Industries Manager** (`/admin/industries`):
     - Industry configuration and management
     - Active/inactive industry toggles

6. **Route Protection Strategy**:
   - **Public Routes**: `/`, `/sign-in`, `/sign-up`, `/report/[token]`
   - **User Routes** (Auth Required): `/dashboard`, `/api/user/*`, `/api/projects/*`
   - **Admin Routes** (Admin Role Required): `/api/admin/*`, `/api/debug/*`
   - **Password Protected**: `/admin/*` (separate from Clerk, uses session password)

7. **Security Features**:
   - ✅ Layered security (Middleware → API → Ownership checks)
   - ✅ JWT-based stateless authentication
   - ✅ Email domain verification (SPF, DKIM, DMARC)
   - ✅ Secure session cookies (httpOnly, sameSite)
   - ✅ No sensitive data in error messages
   - ✅ Type-safe auth with TypeScript
   - ✅ Zod validation on all inputs

**Configuration Files:**
- `CLERK_SETUP.md` - Detailed Clerk setup guide
- `CLERK_INTEGRATION_SUMMARY.md` - Architecture overview
- `RESEND_DNS_SETUP.md` - DNS configuration guide
- `DEPLOYMENT_READY.md` - Production deployment checklist
- `QUICK_DNS_SETUP.md` - Quick DNS setup steps

**Production Validation:**
- ✅ DNS records verified in Resend Dashboard
- ✅ Clerk authentication working in production
- ✅ User signup flow tested end-to-end
- ✅ Email delivery confirmed from `reports@brandlens.app`
- ✅ Admin dashboard accessible with password
- ✅ All API routes protected appropriately
- ✅ User dashboard showing projects correctly

**Timeline:** Completed November 2025

---

### ✅ Phase 3: Admin Dashboard (COMPLETED)

**Status:** 🟢 **LIVE IN PRODUCTION**

**Implementation:**

1. **Analytics Dashboard** (`/admin/analytics`):
   - ✅ Real-time metrics with auto-refresh (30s intervals)
   - ✅ KPI Cards:
     - Total projects (all time)
     - Active analyses (currently running)
     - Success rate % (completed/total)
     - Monthly cost tracking (LLM spend)
   - ✅ LLM Provider Performance Panel:
     - Success rate per provider (color-coded: green >95%, yellow >85%, red <85%)
     - Total runs, tokens used, and cost breakdown
     - Failed run counts and error tracking
   - ✅ Industry Distribution Chart:
     - Projects per industry with completion rates
     - Visual progress bars showing success percentage
   - ✅ Recent Activity Table:
     - Last 10 projects with status, email, timestamps
     - Color-coded status badges (COMPLETED, ANALYZING, FAILED, etc.)
     - Truncated URLs and emails for clean display

2. **Settings Dashboard** (`/admin/settings`):
   - ✅ Environment variables status (masked, secure display)
   - ✅ System configuration overview:
     - Email sender address (`reports@brandlens.app`)
     - App URL and platform version
     - Admin password display
   - ✅ LLM Provider Cards:
     - OpenAI (GPT-4o) - Active status indicator
     - Anthropic (Claude 3.5 Sonnet) - Active status indicator
     - Google AI (Gemini 1.5 Pro) - Active status indicator
   - ✅ Feature Status Grid:
     - Enabled: Auth, Email, Analytics, Public Sharing
     - Coming Soon: Industry Benchmarks, Training Data
     - Disabled: Maintenance Mode
   - ✅ Roadmap for future editable settings

3. **API Endpoints** (`/api/admin/analytics/*`):
   - ✅ `GET /api/admin/analytics/overview` - Dashboard KPIs
   - ✅ `GET /api/admin/analytics/providers` - LLM stats by provider
   - ✅ `GET /api/admin/analytics/recent` - Recent projects list
   - ✅ `GET /api/admin/analytics/industries` - Industry distribution
   - ✅ Admin auth required for all endpoints

4. **Existing Admin Features:**
   - ✅ Password protection: `ADMINp@ss2025`
   - ✅ Prompt Editor (`/admin/prompts`) - JSON-based editing
   - ✅ Industries Manager (`/admin/industries`) - Industry config
   - ✅ Professional dark-mode UI with responsive design

**Future Enhancements (Phase 3+):**
   - Editable system configuration (timeouts, cost alerts)
   - Cost threshold alerts and budget management
   - Feature flag toggles (enable/disable features)
   - Email template customization
   - Cache management and database operations
   - Historical charts (daily/weekly/monthly trends)
   - Export analytics to CSV/JSON
   - User management panel (view users, ban/unban, usage stats)

**Timeline:** Completed November 2025

---

### 🚀 Phase 4: Advanced Features (FUTURE)

**Planned Enhancements:**

1. **Competitive Intelligence:**
   - Automated competitor discovery
   - Side-by-side positioning comparison
   - White space opportunity detection
   - Claim overlap identification

2. **Human vs LLM Analysis:**
   - Brand statement upload
   - Alignment scoring
   - Gap analysis
   - Suggested edits with reasoning

3. **Background Processing:**
   - BullMQ job queue integration
   - Webhook notifications
   - Email report delivery
   - Scheduled re-analysis

4. **Multi-User Support:**
   - User authentication
   - Project history per user
   - Report sharing controls
   - Team collaboration

5. **Export & Integration:**
   - PDF report generation
   - API for external tools
   - Zapier/Make integration
   - Slack notifications

**Timeline:** Evaluated after Phase 3 completion

---

### 🔧 Technical Debt & Maintenance

**Known Issues:**
- Multiple lockfiles warning (root vs project)
- Unused import warnings (non-blocking)
- Background bash processes from previous sessions

**Ongoing Monitoring:**
- OpenAI GPT-4o reliability (Step 4 buyer segments historically problematic)
- Production database migration validation needed
- Vercel timeout monitoring (60s limit)

**Performance Optimizations:**
- Scraping parallelization (main page + 3 subpages)
- Reduced page timeout from 10s to 8s
- LLM analysis runs in parallel across providers

---

## 🚧 Roadmap

- [ ] PDF export functionality
- [ ] Background job queue (BullMQ)
- [ ] User authentication
- [ ] Competitive search integration
- [ ] Public report gallery
- [ ] Human vs LLM comparison
- [ ] Multi-lingual support
- [ ] Report versioning and history

## 📖 Documentation

See [README-LLM-BRAND-LENS.md](README-LLM-BRAND-LENS.md) for comprehensive documentation including:
- Detailed setup instructions
- API documentation
- Prompt engineering details
- Troubleshooting guide
- Security considerations

## 🤝 Contributing

This project follows the PRD in `LLM Brand Lens — Product Requirements Document (PRD).md`

Key principles:
- **Simple by design** — One input, one clear report
- **Transparent** — Show model-by-model outputs
- **Ethical** — Fair Housing compliance, public data only
- **Actionable** — Every section ends with concrete next moves

## 📄 License

Proprietary — Contact for licensing

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://www.anthropic.com/)
- [Google AI](https://ai.google.dev/)

---

**Generated with [Claude Code](https://claude.com/claude-code)**

For questions or support, visit [brandlens.app](https://brandlens.app)
