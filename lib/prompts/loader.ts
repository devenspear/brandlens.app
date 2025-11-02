import { PromptContext } from './templates';
import { Industry } from '@prisma/client';

/**
 * Industry-specific prompt configuration
 * Allows customization of prompts per vertical market
 */

export interface IndustryPromptOverrides {
  brandSynopsis?: (context: PromptContext) => string;
  positioningPillars?: (context: PromptContext) => string;
  toneOfVoice?: (context: PromptContext) => string;
  buyerSegments?: (context: PromptContext) => string;
  amenities?: (context: PromptContext) => string;
  trustSignals?: (context: PromptContext) => string;
  messagingAnalysis?: (context: PromptContext) => string;
  recommendations?: (context: PromptContext, existingAnalysis: any) => string;
}

/**
 * Registry of active industries and their prompt configurations
 */
export const INDUSTRY_CONFIG: Record<Industry, {
  enabled: boolean;
  label: string;
  description: string;
  prompts?: IndustryPromptOverrides;
}> = {
  RESIDENTIAL_REAL_ESTATE: {
    enabled: true,
    label: 'Residential Real Estate',
    description: 'New home communities, master-planned developments, single-family residential',
    prompts: undefined // Will be loaded from industry/residential-real-estate.ts
  },
  COMMERCIAL_REAL_ESTATE: {
    enabled: false,
    label: 'Commercial Real Estate',
    description: 'Office buildings, retail centers, industrial properties',
  },
  HOSPITALITY: {
    enabled: false,
    label: 'Hospitality',
    description: 'Hotels, resorts, vacation rentals',
  },
  HEALTHCARE: {
    enabled: false,
    label: 'Healthcare',
    description: 'Hospitals, clinics, medical practices',
  },
  FINANCIAL_SERVICES: {
    enabled: false,
    label: 'Financial Services',
    description: 'Banks, investment firms, insurance companies',
  },
  TECHNOLOGY_SAAS: {
    enabled: false,
    label: 'Technology & SaaS',
    description: 'Software companies, tech startups, SaaS platforms',
  },
  PROFESSIONAL_SERVICES: {
    enabled: false,
    label: 'Professional Services',
    description: 'Consulting, legal, accounting, marketing agencies',
  },
  RETAIL: {
    enabled: false,
    label: 'Retail',
    description: 'E-commerce, retail stores, consumer brands',
  },
  EDUCATION: {
    enabled: false,
    label: 'Education',
    description: 'Schools, universities, online learning platforms',
  },
  MANUFACTURING: {
    enabled: false,
    label: 'Manufacturing',
    description: 'Industrial manufacturing, B2B products',
  },
  SENIOR_LIVING: {
    enabled: false,
    label: 'Senior Living',
    description: 'Retirement communities, assisted living facilities',
  },
  MULTIFAMILY: {
    enabled: false,
    label: 'Multifamily',
    description: 'Apartment communities, rental properties',
  },
};

/**
 * Get enabled industries for the dropdown selector
 */
export function getEnabledIndustries(): Array<{ value: Industry; label: string; description: string }> {
  return Object.entries(INDUSTRY_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([industry, config]) => ({
      value: industry as Industry,
      label: config.label,
      description: config.description,
    }));
}

/**
 * Get all industries (for admin UI)
 */
export function getAllIndustries(): Array<{ value: Industry; label: string; description: string; enabled: boolean }> {
  return Object.entries(INDUSTRY_CONFIG).map(([industry, config]) => ({
    value: industry as Industry,
    label: config.label,
    description: config.description,
    enabled: config.enabled,
  }));
}

/**
 * Load industry-specific prompts if they exist
 * Falls back to generic prompts from templates.ts
 */
export async function loadIndustryPrompts(industry: Industry): Promise<IndustryPromptOverrides | null> {
  const config = INDUSTRY_CONFIG[industry];

  if (!config || !config.enabled) {
    return null;
  }

  // Load industry-specific prompts if configured
  if (config.prompts) {
    return config.prompts;
  }

  // Try to dynamically import industry-specific module
  try {
    const module = await import(`./industry/${industry.toLowerCase().replace(/_/g, '-')}`);
    return module.prompts as IndustryPromptOverrides;
  } catch (error) {
    // No industry-specific prompts found, will use generic
    return null;
  }
}

/**
 * Check if an industry is enabled for production use
 */
export function isIndustryEnabled(industry: Industry): boolean {
  return INDUSTRY_CONFIG[industry]?.enabled ?? false;
}
