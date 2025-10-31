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
- `findings` — Extracted insights
- `competitors` — Competitive positioning data
- `reports` — Generated reports with share tokens

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
