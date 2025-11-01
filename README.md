# 🔍 LLM Brand Lens

> **See how AI reads your community**

A comprehensive brand audit tool that analyzes how multiple frontier LLMs (OpenAI, Anthropic, Google) perceive your community's brand, positioning, and promise — based solely on public website content.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

## 🎯 What It Does

LLM Brand Lens provides an AI-powered brand audit by:

- **Querying 3 frontier LLMs** simultaneously (GPT-4, Claude 3.5, Gemini 1.5)
- **Analyzing 8 dimensions** per model: brand synopsis, positioning, tone, segments, amenities, trust signals, messaging quality, and recommendations
- **Computing consensus** across models with agreement scores and divergence detection
- **Generating actionable insights** prioritized by impact and effort
- **Creating shareable reports** with comprehensive analysis

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

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **AI Models**: OpenAI GPT-4, Anthropic Claude 3.5, Google Gemini 1.5
- **Web Scraping**: Cheerio
- **Utilities**: Zod validation, nanoid for tokens

## 📈 Database Schema

6 core tables:
- `projects` — Brand audit projects
- `sources` — Scraped website content
- `llm_runs` — LLM API calls with responses
- `findings` — Extracted insights (now with provider tagging)
- `competitors` — Competitive positioning data
- `reports` — Generated reports with share tokens

## 📝 Project Status & Development Phases

### ✅ Phase 1: Provider Tagging & Core Reliability (COMPLETED)

**Problem Solved:** All three LLM outputs were showing identical text in reports because findings weren't tagged with their source provider.

**Changes Implemented:**
1. **Database Schema** (`prisma/schema.prisma`):
   - Added `provider` field to Finding model (LlmProvider enum)
   - Added `projectId` field for efficient queries
   - Added composite index `[projectId, provider, kind]` for fast filtering
   - Added real estate-specific FindingKind enums: `PRODUCT_MIX`, `PRICE_POSITIONING`, `COMPLIANCE_RISK`, `LOCATION_DRIVER`, `BUILDER_CREDIBILITY`
   - Added `humanBrandStatement` field to Project model for human vs LLM comparison

2. **Brand Analyzer** (`lib/services/brand-analyzer.ts`):
   - Updated `saveFinding()` method to include `projectId` and `provider` parameters
   - All 8 analysis steps now tag findings with their source provider
   - Increased OpenAI token limits from 4,000 to 8,000 for improved reliability
   - Implemented graceful degradation with `Promise.allSettled` (continue if ≥1 provider succeeds)

3. **Report Generator** (`lib/services/report-generator.ts`):
   - `buildModelPerspectives()` now filters findings by `llmRunId` (which maps to unique provider)
   - Added `buildHumanVLLMComparison()` method for human vs AI analysis
   - Each provider's perspective now shows distinct, authentic outputs

4. **LLM Providers** (`lib/services/llm-providers.ts`):
   - Defensive JSON parsing with markdown fence stripping
   - Detailed error logging (first 500 chars of failed parses)
   - OpenAI now uses 8,000 max tokens (up from 4,000)

5. **Type Definitions** (`lib/types/index.ts`):
   - Added `humanVLLM` alias to BrandAuditReport interface for compatibility

**Impact:**
- ✅ Each LLM now shows unique, authentic analysis in reports
- ✅ OpenAI reliability improved with increased token limits
- ✅ Better error handling and debugging capabilities
- ✅ Database ready for industry-specific customization
- ✅ Support for human brand statement comparison

**Testing Status:**
- ✅ TypeScript build successful
- ✅ All finding creation calls updated with provider tagging
- ⏳ Awaiting production database migration
- ⏳ Requires one full test analysis to verify distinct outputs

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

### 🔮 Phase 3: Admin Dashboard (PLANNED)

**Objective:** Centralized control panel for system configuration and monitoring.

**Planned Features:**

1. **Authentication:**
   - Password protection: `Admin@SS2005`
   - Session management
   - Routes: `/admin/*`

2. **Dashboard Sections:**

   **a) Analytics** (`/admin/analytics`):
   - Total projects analyzed
   - LLM provider success rates
   - Average analysis time
   - Cost per project breakdown
   - Token usage trends
   - Error rate monitoring

   **b) Prompt Editor** (`/admin/prompts`):
   - Visual JSON editor for prompt templates
   - Industry-specific prompt management
   - Version control for prompts
   - Test prompt output preview

   **c) Settings** (`/admin/settings`):
   - Token limit controls per provider
   - Cost threshold alerts
   - Max pages per site configuration
   - Timeout adjustments
   - Feature flags

   **d) Debug Tools** (`/admin/debug`):
   - Recent error logs
   - LLM response inspection
   - Database query viewer
   - System health checks
   - Manual project retry

3. **UI Framework:**
   - Clean, professional SaaS-style interface
   - Dark mode support
   - Real-time data updates
   - Responsive design

**Timeline:** After Phase 2 industry customization is validated

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
