# LLM Brand Lens — Product Requirements Document (PRD)
*Doc ID: auto · Prepared for: Sir Maestro Deven (ULI)*  
*Last updated: today*

> **Purpose (one line):** A simple, executive‑friendly audit that shows how multiple frontier LLMs *perceive* a community’s brand, positioning, and promise — based solely on its public website and a light competitive scan.

---

## 1) Scope & Intent
**In-scope**
- Input is a single **domain/URL** that represents a master‑planned residential community (MPC) or similar.
- The system queries **multiple LLMs** (e.g., OpenAI, Anthropic, Google) via API and generates:
  - Narrative brand summaries per model
  - Consensus & divergence analysis across models
  - Competitive positioning snapshot derived from basic web search
  - Amenity & lifestyle promise inventory (as stated vs implied)
  - Messaging/voice observations and clarity/differentiation heuristics
  - “Human vs LLM” contrast section (optionally using client-supplied brand statement)
  - A concise **recommendations** list (copy, content, proof points)

**Out-of-scope (for this product)**
- Technical web performance audits (handled by **Nexus Auditor** in another track)
- Deep regulatory/finance/ops tech stack mapping (the larger BUILD // 2025→2030 portal)
- Private data ingestion or enterprise CRM access
- Non-public social listening or ad account analysis

**Principles**
- **Simple by design**: one input, one clear report.
- **Transparent**: show model‑by‑model outputs and where they disagree.
- **Ethical**: avoid sensitive inferences; respect Fair Housing and privacy norms.
- **Actionable**: every section ends with two or three concrete next moves.

---

## 2) Users & Jobs-to-be-Done (JTBD)
- **Developer / CEO / Partner** — Understand how AI “reads” our community’s brand; spot blind spots; prepare board/LP narrative.  
- **CMO / Marketing Lead** — Stress‑test messaging, proof, and funnel; identify copy upgrades and content gaps.  
- **Sales Director** — Align talking points with what AI is likely to say when prospects ask generic questions.  
- **ULI Peers / Prospects** — Try the free version to see immediate value and book a deeper consult.

---

## 3) Inputs & Data Sources
- **Required:** Domain name (e.g., `examplecommunity.com`).  
- **Optional:** City/region for market context, a short **human brand statement** (100–150 words) for the “Human vs LLM” contrast.  
- **Public sources only:**  
  - Landing pages, sitemap subset (N pages cap to control cost)  
  - Basic web search results and top competitor pages (name + tagline + one-liner)  
  - Press mentions or listicles surfaced by search

---

## 4) Core Features
### 4.1 Multi‑Model Brand Read
- Run a **standardized prompt pack** against 3+ LLMs.  
- Outputs per model:  
  - **Brand Synopsis** (100–150 words)  
  - **Positioning Pillars** (3–5 bullets)  
  - **Tone‑of‑Voice** (3 adjectives + example sentence)  
  - **Primary Buyer Segments** (2–3 inferred, non‑sensitive)  
  - **Amenity & Lifestyle Claims** (bullet list, stated vs implied)  
  - **Trust Signals** (warranties, certifications, testimonials, awards, data)  
- Store raw responses for transparency and QA.

### 4.2 Consensus vs Divergence Map
- Compare model outputs to compute **Agreement Index** per pillar (0–100).  
- Flag **Disagreements** (e.g., one model perceives “luxury,” another “attainable”).  
- Display **Why** (cite source snippets from the site or search).

### 4.3 Competitive Positioning Snapshot
- Lightweight search to identify **3 nearby or topical peers**.  
- Derive a 2×2 **Positioning Grid** (axes configurable: *Design ↔ Value*, *Lifestyle ↔ Performance*, etc.).  
- Show **Claim Overlaps** and **Clear White Space**.

### 4.4 Messaging & Clarity Heuristics
- **Clarity** (jargon, reading level), **Specificity** (numbers vs platitudes), **Differentiation**, **Trust** (evidence density).  
- Each scored **Low / Medium / High** with one‑line evidence (no dark magic).

### 4.5 “Human vs LLM” Contrast
- Lay the **client’s brand statement** alongside the **LLM consensus summary**.  
- Highlight **Alignment** and **Gaps** with suggested edits (examples of replacement copy).

### 4.6 Recommendations
- **Top 5 Actions** prioritized by **Impact** and **Effort band** (S / M / L only; no time).  
- Copy trims, proof‑point ideas, amenity clarity, page hierarchy fixes, “FAQ the bots” items.

### 4.7 Shareable Report
- Clean, branded **web report** and **PDF export**.  
- Unique URL with access token; optional **public sample** gallery.

---

## 5) Functional Requirements
1. **URL ingestion**
   - Fetch main page + a limited set of key subpages (About, Homes/Plans, Amenities, Location, Contact).  
   - Respect robots and rate limits; fall back to static HTML snapshots when needed.
2. **Search & Competitor pick**
   - Query engine with safe parameters; extract top organic results for comparable communities.  
   - Allow manual override of competitor list.
3. **Prompt orchestration**
   - Deterministic **prompt frames** for each model; vendor‑specific safety settings.  
   - Capture **model, version, temperature, max tokens**, and raw outputs.
4. **Synthesis layer**
   - Normalize model outputs → compute Agreement Index and extract common pillars.  
   - Justify with **evidence snippets** from site/search.
5. **Scoring heuristics**
   - Rule‑based heuristics for Clarity/Specificity/Differentiation/Trust; configurable thresholds.  
   - Produce short human‑readable rationales.
6. **Report composer**
   - Assemble sections with cards, chips, and expandable raw model text.  
   - Export to **PDF** and **share link**.
7. **Audit trail**
   - Log inputs, prompts, outputs, and decisions with IDs for reproducibility.
8. **Privacy & compliance**
   - Public content only; no PII; **Fair Housing** safe language guidance; opt‑out link for site owners.

---

## 6) Non‑Functional Requirements
- **Reliability:** graceful degradation if one model fails; still produce a report with clear notes.  
- **Cost control:** cap tokens per model and per report; dynamic page selection.  
- **Explainability:** display why each conclusion was made with a one‑click “show evidence.”  
- **Accessibility:** semantic HTML, alt text, keyboard navigation for the report.  
- **Security:** signed URLs for reports; redact sensitive query parameters in logs.

---

## 7) Architecture (lightweight)
- **Frontend:** Next.js (edge‑ready) for landing + report viewer.  
- **Backend:** Node or Python service for crawl → summarize → multi‑model calls.  
- **LLM providers:** pluggable adapters (OpenAI / Anthropic / Google).  
- **Search:** configurable provider (e.g., Brave/Serper/Tavily).  
- **Storage:** object store for snapshots, Postgres for metadata.  
- **Queues:** job runner for multi‑model orchestration; webhooks for completion.  
- **Observability:** structured logs, prompt/response store, simple cost meter.

**Data model (key tables)**
- `projects` (id, url, region, created_by, status)  
- `sources` (project_id, type, url, content_hash, text_excerpt)  
- `llm_runs` (project_id, provider, model, settings, raw_json)  
- `findings` (project_id, kind, value, evidence_ref)  
- `competitors` (project_id, name, url, axis_x, axis_y, notes)  
- `reports` (project_id, url_token, is_public, version)

---

## 8) Report Outline (sections & components)
1. **Cover** — Title, community name, URL, region; “public content only” note.  
2. **Executive Summary** — One paragraph + **Top 5 Actions** chips.  
3. **Model Perspectives** — Side‑by‑side cards for each LLM (synopsis, pillars, tone, segments).  
4. **Consensus vs Divergence** — Agreement Index chips + explanation.  
5. **Positioning Grid** — 2×2 map with competitors; white‑space callouts.  
6. **Messaging Heuristics** — Clarity/Specificity/Differentiation/Trust badges with one‑line evidence.  
7. **Amenity & Lifestyle Inventory** — Stated vs implied table; “promise vs proof” notes.  
8. **Human vs LLM** — Alignment/gaps + suggested copy edits.  
9. **Appendix** — Raw model outputs; prompts; source list.

---

## 9) Scoring Rubrics (v1)
- **Clarity:** *Low* = vague copy; *Med* = some specifics; *High* = quantifiable claims and plain speech.  
- **Specificity:** counts of numbers, standards, or named amenities per 500 words.  
- **Differentiation:** uniqueness of phrases vs competitor corpus (n‑gram overlap).  
- **Trust:** presence of testimonials, certifications, third‑party recognition, measurable outcomes.

---

## 10) UX Notes (landing → report)
**Landing**
- Headline: *See how AI reads your community.*  
- Input: domain field; optional region + human brand statement.  
- CTA: *Generate your AI Brand Read.*  
- Sample reports gallery and ethics note.

**Report UI**
- Chips for LLM providers; toggle to show raw outputs.  
- Evidence popovers; copy‑to‑clipboard for recommended phrasing.  
- Share link + PDF export.

---

## 11) Risks & Mitigations
- **Hallucination risk** → Evidence‑only claims; show citations; restrict to on‑site text and first‑page search.  
- **Fair Housing / discrimination** → No sensitive segment inference; language checker with allowed patterns.  
- **Reputation** → Bold disclaimers that this is a *perception* read, not fact certification.  
- **Model drift** → Version pinning; provider field in every record.

---

## 12) Success Criteria
- Decision‑maker understands **what AI will likely say** about their community.  
- They take **at least one recommendation** live (copy change, proof point, page re‑order).  
- They **share** the report link or book a consult.

---

## 13) Future Extensions (when ready)
- Multi‑lingual reads; region‑specific tone adapters.  
- Structured “FAQ the Bots” section that improves LLM answers over time.  
- “Mention tracking” — where LLMs surface the brand in generic prompts.  
- Light A/B helper that proposes copy alternatives with evidence requirements.

---

## 14) Open Decisions
- Which **three** LLM providers to standardize for the first version?  
- Which **axes** should the default 2×2 use? (*Design ↔ Value*, *Lifestyle ↔ Performance* suggested.)  
- Do we allow **manual competitor overrides** in the free flow?  
- Preferred **brand voice** for the report (Strategic / Minimalist / Poetic blend recommended).

---

### Appendix A — Sample Prompt Frames (abbrev)
**Brand Synopsis (per model)**  
“Read the following public web pages for {{domain}}. Summarize the brand promise in 120–150 words. Avoid guessing. Cite phrases or sections verbatim where possible.”

**Positioning Pillars**  
“List 3–5 positioning pillars that the site substantiates. For each, include a short evidence quote and its page.”

**Tone-of-Voice**  
“Give three adjectives and one example sentence that matches the site’s voice.”

**Segments (non‑sensitive)**  
“Name 2–3 likely buyer segments based on the site’s own words. Avoid protected attributes.”

**Recommendations**  
“Return five concrete copy or content changes that increase clarity, specificity, differentiation, and trust, using only on‑site evidence.”

---

**Notes**  
- This audit is **not** a compliance certification, design review, or technical performance test.  
- All conclusions are **interpretations** produced by language models based on public content.