# LLM Brand Lens

> See how AI reads your community

A comprehensive brand audit tool that shows how multiple frontier LLMs (OpenAI, Anthropic, Google) perceive a community's brand, positioning, and promise — based solely on public website content.

## Overview

LLM Brand Lens is an AI-powered brand auditing tool designed for:
- **Developers / CEOs / Partners** — Understanding how AI "reads" your brand and identifying blind spots
- **CMOs / Marketing Leads** — Stress-testing messaging, proof, and funnel; identifying content gaps
- **Sales Directors** — Aligning talking points with AI-generated responses
- **ULI Peers / Prospects** — Quick brand perception analysis

## Key Features

### 🤖 Multi-Model Analysis
- Queries **OpenAI GPT-4**, **Anthropic Claude**, and **Google Gemini** simultaneously
- Compares and contrasts perspectives across different AI models
- Identifies consensus and divergence in brand perception

### 📊 Comprehensive Brand Audit
- **Brand Synopsis** — How each AI model perceives your brand
- **Positioning Pillars** — Key differentiators identified by AI
- **Tone of Voice** — Linguistic style and communication patterns
- **Buyer Segments** — Target audience identification (Fair Housing compliant)
- **Amenity Analysis** — Stated vs implied lifestyle promises
- **Trust Signals** — Credibility indicators found on the site

### 📈 Messaging Analysis
- **Clarity Score** — Language accessibility and jargon assessment
- **Specificity Score** — Concrete details vs platitudes
- **Differentiation Score** — Uniqueness vs generic positioning
- **Trust Score** — Evidence and proof point density

### 💡 Actionable Recommendations
- Prioritized by impact and effort
- Specific copy suggestions with before/after examples
- Evidence-based improvements
- Category-organized (copy, content, proof, structure, FAQ)

### 🎯 Consensus Analysis
- Agreement Index (0-100%) across models
- Common themes identification
- Key divergences with explanations
- Evidence citations for all findings

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- Dark mode support

### Backend
- **Node.js** runtime
- **Prisma** ORM with PostgreSQL
- **OpenAI SDK** for GPT-4 analysis
- **Anthropic SDK** for Claude analysis
- **Google Generative AI** for Gemini analysis

### Services
- **Web Scraping** with Cheerio
- **Multi-provider LLM orchestration**
- **Consensus analysis algorithms**
- **Report generation and sharing**

## Project Structure

```
BrandAuditor/
├── app/
│   ├── api/
│   │   ├── projects/          # Project creation and status
│   │   └── reports/           # Report retrieval
│   ├── project/[id]/          # Project status page
│   ├── report/[token]/        # Report viewer
│   └── page.tsx               # Landing page
├── lib/
│   ├── prisma/
│   │   └── client.ts          # Prisma singleton
│   ├── services/
│   │   ├── scraper.ts         # Web scraping service
│   │   ├── llm-providers.ts   # LLM provider adapters
│   │   ├── brand-analyzer.ts  # Main orchestration
│   │   ├── consensus-analyzer.ts # Consensus analysis
│   │   └── report-generator.ts # Report assembly
│   ├── prompts/
│   │   └── templates.ts       # LLM prompt templates
│   └── types/
│       └── index.ts           # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
└── components/                # UI components
```

## Database Schema

### Key Tables
- **projects** — Brand audit projects
- **sources** — Scraped website content
- **llm_runs** — Individual LLM API calls with responses
- **findings** — Extracted insights and analysis
- **competitors** — Competitive positioning data
- **reports** — Generated reports with share tokens

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys for:
  - OpenAI
  - Anthropic
  - Google AI

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database
DATABASE_URL="your-postgres-connection-string"

# LLM Provider API Keys
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Settings
MAX_PAGES_PER_SITE=10
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (if you have a migration file)
npx prisma migrate dev

# Or push schema directly
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage Flow

### 1. Create Analysis
1. Enter a website URL on the landing page
2. Optionally add city/region context
3. Click "Generate Your AI Brand Read"

### 2. Monitor Progress
- Real-time status updates
- Progress indicators for each phase:
  - Website scraping
  - AI model analysis
  - Report generation

### 3. View Report
- **Overview Tab** — Executive summary and consensus
- **Model Perspectives** — Individual AI analyses
- **Messaging Analysis** — Quality scores
- **Recommendations** — Prioritized action items

### 4. Share & Export
- Unique shareable URL for each report
- PDF export capability (coming soon)
- Optional public gallery

## API Endpoints

### Create Project
```typescript
POST /api/projects
{
  "url": "https://example-community.com",
  "region": "Austin, TX" // optional
}

Response: {
  "id": "project-id",
  "url": "https://example-community.com",
  "status": "PENDING"
}
```

### Check Project Status
```typescript
GET /api/projects/:id

Response: {
  "id": "project-id",
  "url": "https://example-community.com",
  "status": "COMPLETED",
  "reportUrl": "/report/abc123"
}
```

### Get Report
```typescript
GET /api/reports/:token

Response: {
  // Complete BrandAuditReport object
}
```

## Prompt Engineering

The system uses carefully crafted prompts for each analysis dimension:

1. **Brand Synopsis** — Neutral, evidence-based summary
2. **Positioning Pillars** — Substantiated differentiators
3. **Tone of Voice** — Linguistic pattern analysis
4. **Buyer Segments** — Fair Housing compliant segments
5. **Amenities** — Stated vs implied parsing
6. **Trust Signals** — Credibility indicator detection
7. **Messaging Analysis** — Multi-dimensional scoring
8. **Recommendations** — Actionable, prioritized suggestions

All prompts request JSON responses for consistent parsing.

## Cost Management

- Token limits per model configurable
- Cost tracking per LLM run
- Page limit per website scan (default: 10)
- Graceful degradation if one model fails

## Ethical Considerations

### Fair Housing Compliance
- No sensitive segment inference
- Avoids protected attributes (race, religion, national origin, familial status, disability)
- Focus on lifestyle preferences and values

### Data Privacy
- Public content only
- No PII collection
- No private data ingestion
- Opt-out mechanism for site owners

### Transparency
- All findings cite source evidence
- Model outputs shown alongside consensus
- Clear disclaimers that outputs are AI interpretations

## Future Enhancements

- [ ] Multi-lingual analysis
- [ ] "FAQ the Bots" section generation
- [ ] Mention tracking across AI platforms
- [ ] A/B testing copy suggestions
- [ ] Competitive positioning automation
- [ ] Job queue implementation (BullMQ/Redis)
- [ ] User authentication
- [ ] PDF export
- [ ] Public report gallery
- [ ] Webhook notifications

## Development Notes

### Adding a New LLM Provider
1. Create provider class in `lib/services/llm-providers.ts`
2. Implement `ILLMProvider` interface
3. Add to `LLMProviderFactory`
4. Update Prisma enum

### Customizing Prompts
Edit templates in `lib/prompts/templates.ts`:
- Each function returns a formatted prompt string
- Include context and output format instructions
- Request JSON for consistent parsing

### Modifying Report Sections
Update the report structure in:
- `lib/types/index.ts` — Type definitions
- `lib/services/report-generator.ts` — Assembly logic
- `app/report/[token]/page.tsx` — UI rendering

## Troubleshooting

### Prisma Client Errors
```bash
# Regenerate client
npx prisma generate

# Reset database (caution: deletes data)
npx prisma migrate reset
```

### LLM API Errors
- Check API key validity
- Verify rate limits
- Review token usage
- Check model availability

### Scraping Issues
- Verify URL accessibility
- Check robots.txt compliance
- Review timeout settings
- Inspect network errors

## Performance Optimization

- Parallel LLM calls where possible
- Incremental report generation
- Database indexing on frequently queried fields
- Caching for repeat analyses (future)
- CDN for static assets

## Security Considerations

- API keys stored in environment variables
- Report tokens are unguessable (nanoid)
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection in Next.js

## Contributing

This project follows the PRD in `LLM Brand Lens — Product Requirements Document (PRD).md`

Key principles:
- **Simple by design** — One input, one clear report
- **Transparent** — Show model-by-model outputs
- **Ethical** — Fair Housing compliance, public data only
- **Actionable** — Every section ends with concrete next moves

## License

Proprietary — Contact for licensing

## Support

For issues, questions, or feature requests, please contact the development team.

---

**Generated with LLM Brand Lens** — Understanding how AI reads your brand.
