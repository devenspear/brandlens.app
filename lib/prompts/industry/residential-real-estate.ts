import { PromptContext } from '../templates';
import { IndustryPromptOverrides } from '../loader';

/**
 * Residential Real Estate Industry Prompts
 * Optimized for new home communities, master-planned developments, and builders
 */

export const prompts: IndustryPromptOverrides = {
  brandSynopsis: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `Read the following public web pages for ${domain}, a residential real estate development. Summarize the brand promise and community positioning in 120–150 words.

Focus specifically on:
- The type of community (master-planned, new homes, condos, etc.)
- Target homebuyer appeal (lifestyle, location, product)
- Key differentiators in the competitive residential market
- Builder/developer credibility and track record

Important guidelines:
- Avoid guessing or making assumptions beyond what's stated
- Cite phrases or sections verbatim where possible
- Focus on what the community explicitly communicates
- Note if information is implied vs explicitly stated
- Flag any Fair Housing compliance concerns

Web pages:
${pageContents}

Return your analysis as a JSON object with this structure:
{
  "summary": "120-150 word brand synopsis focused on residential real estate positioning",
  "confidence": "high/medium/low",
  "keyQuotes": ["quote 1", "quote 2", "quote 3"],
  "communityType": "master-planned|new homes|condos|townhomes|luxury|active adult|mixed-use",
  "pricePointSignals": "value|mid-market|premium|luxury (based on language, not explicit pricing)"
}`;
  },

  positioningPillars: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `List 3–5 positioning pillars for ${domain}, a residential real estate community.

For residential real estate, pillars typically fall into these categories:
- **Location** (proximity, neighborhood, schools, access)
- **Product** (home designs, customization, innovation)
- **Amenities** (clubhouse, pools, trails, gathering spaces)
- **Lifestyle** (community culture, activities, outdoor living)
- **Builder** (reputation, quality, warranty, experience)
- **Value** (pricing, incentives, investment appeal)

For each pillar:
- Provide a clear name and description
- Include a short evidence quote from the site
- Reference which page the evidence comes from
- Rate your confidence in this pillar (high/medium/low)
- Categorize into one of the pillar types above

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Pillar name",
    "category": "location|product|amenities|lifestyle|builder|value",
    "description": "Clear description of this positioning pillar",
    "evidence": "Direct quote from the website",
    "sourceUrl": "URL where evidence was found",
    "confidence": "high/medium/low"
  }
]`;
  },

  buyerSegments: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `Name 2–3 likely homebuyer segments for ${domain} based on the community's own words and signals.

CRITICAL: STRICT Fair Housing compliance required.
- NEVER infer protected attributes: race, color, religion, national origin, sex, familial status, or disability
- Focus ONLY on: lifestyle preferences, life stages, values, activities, and economic indicators

Residential real estate buyer segments should focus on:
- **Life stage signals** (starter homes, move-up, downsizing, retirement)
- **Lifestyle preferences** (active outdoor, urban walkable, resort-style, family-oriented)
- **Home priorities** (entertaining spaces, home office, outdoor living, low maintenance)
- **Economic indicators** (price points, square footage, upgrade options, location prestige)
- **Activity patterns** (golf, fitness, boating, pets, gardening)
- **Values** (sustainability, community, privacy, innovation)

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Segment name (lifestyle or life-stage based, NOT protected classes)",
    "description": "Description based on lifestyle, values, or preferences",
    "lifestageSignal": "starter|move-up|luxury|downsizer|active-adult|retiree (if determinable)",
    "reasoning": "Why this segment is indicated by the site content",
    "evidence": "Specific quotes or references from the site",
    "fairHousingCheck": "Confirm no protected attributes used"
  }
]`;
  },

  amenities: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `Identify amenity claims and lifestyle promises for ${domain}, a residential real estate community.

Categorize each amenity as:
- **community amenities** (clubhouse, pool, fitness, trails, parks, sports courts)
- **home features** (smart home, energy efficiency, design options, outdoor living)
- **location benefits** (schools, shopping, dining, employment centers, highways)
- **lifestyle promises** (implied benefits like "walkable", "resort-style", "nature-immersed")

For each, note if it is:
- "stated": Explicitly mentioned amenities and features
- "implied": Lifestyle benefits suggested but not directly stated
- "planned": Future amenities (vs currently available)

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Amenity or lifestyle element",
    "category": "community|home|location|lifestyle",
    "type": "stated|implied",
    "status": "current|planned|unclear",
    "description": "What is claimed or suggested",
    "evidence": "Quote or reference from the site"
  }
]`;
  },

  trustSignals: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `Identify trust and credibility signals for ${domain}, a residential real estate community.

For real estate, look for:
- **Builder credibility** (years in business, homes built, awards, certifications)
- **Quality indicators** (warranties, certifications like LEED/Energy Star, construction details)
- **Social proof** (testimonials, homeowner stories, waitlists, sales velocity)
- **Developer track record** (previous communities, portfolio, reputation)
- **Third-party validation** (awards, press, rankings, partnerships)
- **Transparency** (model homes, virtual tours, detailed pricing, FAQs)
- **Financial stability** (established company, backing, market presence)

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "type": "builder|quality|social-proof|developer|third-party|transparency|financial",
    "description": "What the trust signal communicates",
    "source": "Where on the site this appears",
    "strength": "high|medium|low confidence in this signal",
    "specificity": "How concrete or vague the claim is"
  }
]`;
  },

  messagingAnalysis: (context: PromptContext): string => {
    const { domain, mainPage, subPages } = context;

    const pageContents = [mainPage, ...subPages]
      .map(page => `
=== ${page.url} ===
${page.content}
`)
      .join('\n');

    return `Analyze the messaging quality for ${domain}, a residential real estate community, across four dimensions:

1. **Clarity**: Is the language clear and accessible? Is there real estate jargon that buyers might not understand? What's the reading level?

2. **Specificity**: Are there concrete numbers, details, and proof points?
   - Home sizes, lot sizes, price ranges?
   - Specific amenity details (pool dimensions, trail miles, clubhouse features)?
   - Location specifics (exact distances, school names, employment centers)?
   - Timeline and availability details?
   Or mostly vague platitudes like "luxury living" and "resort-style amenities"?

3. **Differentiation**: What makes this community unique vs generic residential real estate language?
   - Specific location advantages?
   - Unique home designs or customization?
   - Distinctive amenities or lifestyle?
   - Builder innovation or quality claims?
   Or could this copy describe any community?

4. **Trust**: What evidence, proof points, or credibility indicators build buyer confidence?
   - Builder track record and specifics?
   - Testimonials or homeowner stories?
   - Awards, certifications, rankings?
   - Detailed home/community information?
   - Transparency about pricing, timeline, availability?

Web pages:
${pageContents}

For each dimension, score as Low/Medium/High and provide:
- Specific evidence from the text
- Concrete examples
- 2-3 recommendations for improvement specific to residential real estate

Return your analysis as a JSON object:
{
  "clarity": {
    "level": "low|medium|high",
    "score": 0-100,
    "rationale": "Why this score - address jargon, reading level, accessibility",
    "evidence": ["example 1", "example 2"],
    "recommendations": ["rec 1", "rec 2"]
  },
  "specificity": {
    "level": "low|medium|high",
    "score": 0-100,
    "rationale": "Why this score - address concrete vs vague claims",
    "evidence": ["example 1", "example 2"],
    "recommendations": ["rec 1 specific to RE", "rec 2"],
    "missingDetails": ["What specific info is absent that buyers need?"]
  },
  "differentiation": {
    "level": "low|medium|high",
    "score": 0-100,
    "rationale": "Why this score - unique vs generic residential messaging",
    "evidence": ["example 1", "example 2"],
    "recommendations": ["rec 1", "rec 2"],
    "genericPhrases": ["List generic RE phrases used"]
  },
  "trust": {
    "level": "low|medium|high",
    "score": 0-100,
    "rationale": "Why this score - builder credibility, proof, transparency",
    "evidence": ["example 1", "example 2"],
    "recommendations": ["rec 1", "rec 2"],
    "credibilityGaps": ["What's missing to build trust?"]
  }
}`;
  },

  recommendations: (context: PromptContext, existingAnalysis: any): string => {
    const { domain } = context;

    return `Based on your analysis of ${domain}, a residential real estate community, provide 5 concrete recommendations to improve brand clarity, buyer appeal, differentiation, and trust.

Current analysis summary:
${JSON.stringify(existingAnalysis, null, 2)}

For each recommendation:
- Provide a clear, actionable title
- Explain what to do and why (specific to residential real estate marketing)
- Categorize as: copy, content, proof, structure, faq, or pricing-transparency
- Estimate impact (high/medium/low) and effort (S/M/L)
- Include before/after examples where applicable

Focus on residential real estate priorities:
- **Clarity**: Remove jargon, explain features, simplify for diverse buyers
- **Specificity**: Add home sizes, lot sizes, amenity details, location distances, timeline
- **Differentiation**: Unique location, design, builder, lifestyle vs generic "luxury community"
- **Trust**: Builder credentials, warranties, homeowner stories, transparency
- **Fair Housing**: Ensure language is compliant, lifestyle-focused, not demographic
- **Buyer Journey**: Information architecture, next steps, contact clarity

Return your recommendations as a JSON array:
[
  {
    "title": "Clear, actionable recommendation title",
    "description": "Detailed explanation of what to do and why (RE-specific)",
    "impact": "high|medium|low",
    "effort": "S|M|L",
    "category": "copy|content|proof|structure|faq|pricing-transparency",
    "before": "Current text example (if applicable)",
    "after": "Suggested text (if applicable)",
    "evidence": "Why this matters based on analysis",
    "buyerBenefit": "How this helps the homebuyer decision process"
  }
]`;
  },
};
