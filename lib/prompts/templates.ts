import { ScrapedPage } from '../types';

export interface PromptContext {
  domain: string;
  mainPage: ScrapedPage;
  subPages: ScrapedPage[];
}

export const createBrandSynopsisPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Read the following public web pages for ${domain}. Summarize the brand promise in 120–150 words.

Important guidelines:
- Avoid guessing or making assumptions beyond what's stated
- Cite phrases or sections verbatim where possible
- Focus on what the brand explicitly communicates
- Note if information is implied vs explicitly stated

Web pages:
${pageContents}

Return your analysis as a JSON object with this structure:
{
  "summary": "120-150 word brand synopsis",
  "confidence": "high/medium/low",
  "keyQuotes": ["quote 1", "quote 2", "quote 3"]
}`;
};

export const createPositioningPillarsPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `List 3–5 positioning pillars that the website for ${domain} substantiates.

For each pillar:
- Provide a clear name and description
- Include a short evidence quote from the site
- Reference which page the evidence comes from
- Rate your confidence in this pillar (high/medium/low)

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Pillar name",
    "description": "Clear description of this positioning pillar",
    "evidence": "Direct quote from the website",
    "sourceUrl": "URL where evidence was found",
    "confidence": "high/medium/low"
  }
]`;
};

export const createToneOfVoicePrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Analyze the tone of voice for ${domain}'s website.

Provide:
- Three adjectives that describe the voice
- One example sentence that exemplifies this voice
- Reading level assessment (if determinable)
- Key linguistic patterns or style choices

Web pages:
${pageContents}

Return your analysis as a JSON object:
{
  "adjectives": ["adjective1", "adjective2", "adjective3"],
  "exampleSentence": "An actual sentence from the site that exemplifies the voice",
  "readingLevel": "description of reading level",
  "patterns": ["pattern 1", "pattern 2"]
}`;
};

export const createBuyerSegmentsPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Name 2–3 likely buyer segments for ${domain} based on the site's own words.

CRITICAL: Avoid protected attributes (race, religion, national origin, familial status, disability, etc.) per Fair Housing guidelines.

Focus on:
- Lifestyle preferences mentioned on the site
- Values and priorities the brand speaks to
- Activities and amenities that signal target segments
- Price points and product types offered

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Segment name (avoid protected classes)",
    "description": "Description based on lifestyle, values, or preferences",
    "reasoning": "Why this segment is indicated by the site content",
    "evidence": "Specific quotes or references from the site"
  }
]`;
};

export const createAmenitiesPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Identify amenity and lifestyle claims for ${domain}.

Categorize each as:
- "stated": Explicitly mentioned amenities and features
- "implied": Lifestyle benefits suggested but not directly stated

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "name": "Amenity or lifestyle element",
    "type": "stated or implied",
    "description": "What is claimed or suggested",
    "evidence": "Quote or reference from the site"
  }
]`;
};

export const createTrustSignalsPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Identify trust signals present on ${domain}'s website.

Look for:
- Testimonials or reviews
- Certifications and accreditations
- Awards and recognition
- Data points and statistics
- Press mentions
- Warranties or guarantees
- Third-party validations

Web pages:
${pageContents}

Return your analysis as a JSON array:
[
  {
    "type": "testimonial|certification|award|data|press|warranty",
    "description": "What the trust signal communicates",
    "source": "Where on the site this appears",
    "strength": "high|medium|low confidence in this signal"
  }
]`;
};

export const createRecommendationsPrompt = (
  context: PromptContext,
  existingAnalysis: {
    synopsis: any;
    pillars: any;
    tone: any;
    messaging: any;
  }
): string => {
  const { domain } = context;

  return `Based on your analysis of ${domain}, provide 5 concrete recommendations to improve brand clarity, specificity, differentiation, and trust.

Current analysis summary:
${JSON.stringify(existingAnalysis, null, 2)}

For each recommendation:
- Provide a clear, actionable title
- Explain what to do and why (with detailed justification)
- Include industry examples and best practices from similar brands
- Explain the psychological/marketing principles behind the recommendation
- Categorize as: copy, content, proof, structure, or faq
- Estimate impact (high/medium/low) and effort (S/M/L)
- Include before/after examples where applicable

Focus on:
- Clarity: removing jargon, simplifying language
- Specificity: adding numbers, concrete details, proof points
- Differentiation: unique positioning vs generic claims
- Trust: evidence, social proof, transparency

Return your recommendations as a JSON array:
[
  {
    "title": "Clear, actionable recommendation title",
    "description": "Detailed explanation of what to do and why",
    "justification": "Deep reasoning about why this works, backed by marketing principles",
    "industryExamples": [
      "Example 1: Company X does this by...",
      "Example 2: Company Y improved metrics by..."
    ],
    "bestPractices": [
      "Best practice 1",
      "Best practice 2"
    ],
    "impact": "high|medium|low",
    "effort": "S|M|L",
    "category": "copy|content|proof|structure|faq",
    "before": "Current text example (if applicable)",
    "after": "Suggested text (if applicable)",
    "evidence": "Why this matters based on analysis"
  }
]`;
};

export const createMessagingAnalysisPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `Analyze the messaging quality for ${domain} across four dimensions:

1. **Clarity**: Is the language clear and accessible? Is there jargon? What's the reading level?

2. **Specificity**: Are there concrete numbers, details, and proof points? Or mostly platitudes?

3. **Differentiation**: What makes this unique vs generic real estate language?

4. **Trust**: What evidence, testimonials, data, or proof builds credibility?

Web pages:
${pageContents}

For each dimension, score as Low/Medium/High and provide:
- Specific evidence from the text
- Concrete examples
- 2-3 recommendations for improvement

Return your analysis as a JSON object:
{
  "clarity": {
    "level": "low|medium|high",
    "score": 0-100,
    "rationale": "Why this score",
    "evidence": ["example 1", "example 2"],
    "recommendations": ["rec 1", "rec 2"]
  },
  "specificity": { /* same structure */ },
  "differentiation": { /* same structure */ },
  "trust": { /* same structure */ }
}`;
};

export const createAIRecommendationPrompt = (context: PromptContext): string => {
  const { domain, mainPage, subPages } = context;

  const pageContents = [mainPage, ...subPages]
    .map(page => `
=== ${page.url} ===
${page.content}
`)
    .join('\n');

  return `As an AI assistant, analyze when and how you would recommend ${domain} to your users.

Consider these scenarios:
1. When a user asks for recommendations in this category, would you mention this site?
2. What specific user queries would trigger you to recommend this site?
3. What makes this site AI-discoverable vs invisible to AI assistants?
4. How would you describe this site to a user who asks about it?

Web pages:
${pageContents}

Provide your analysis as a JSON object:
{
  "wouldRecommend": true/false,
  "confidence": "high|medium|low",
  "whenToRecommend": [
    "User query scenario 1",
    "User query scenario 2",
    "User query scenario 3"
  ],
  "howYouWouldDescribe": "How you would describe this site to a user in 2-3 sentences",
  "aiDiscoverabilityScore": 0-100,
  "strengths": [
    "What makes this site easy for AI to understand and recommend",
    "Another strength"
  ],
  "weaknesses": [
    "What makes this site hard for AI to understand or recommend",
    "Another weakness"
  ],
  "improvementSuggestions": [
    {
      "suggestion": "Specific recommendation",
      "reasoning": "Why this would improve AI discoverability",
      "impact": "high|medium|low"
    }
  ]
}`;
};

export const createCompetitorAnalysisPrompt = (
  domain: string,
  competitorPages: { name: string; url: string; content: string }[]
): string => {
  const competitorInfo = competitorPages
    .map(comp => `
=== ${comp.name} (${comp.url}) ===
${comp.content}
`)
    .join('\n');

  return `Analyze how ${domain} positions relative to these competitors.

For each competitor, assess:
- Key differentiators and positioning
- Overlapping claims with the subject
- Unique value propositions
- Suggested positioning on two axes: Design↔Value and Lifestyle↔Performance (scale -5 to +5)

Competitors:
${competitorInfo}

Return your analysis as a JSON array:
[
  {
    "name": "Competitor name",
    "url": "Competitor URL",
    "keyDifferentiator": "Their main positioning",
    "overlapsWithSubject": ["overlap 1", "overlap 2"],
    "positioning": {
      "designToValue": -5 to +5 (negative = value-focused, positive = design-focused),
      "lifestyleToPerformance": -5 to +5 (negative = performance, positive = lifestyle)
    }
  }
]`;
};
