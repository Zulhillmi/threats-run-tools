export type SubmissionInput = {
  name?: unknown;
  website_url?: unknown;
  websiteUrl?: unknown;
  tagline?: unknown;
  description?: unknown;
  submitter_email?: unknown;
  submitterEmail?: unknown;
  category?: unknown;
  category_slug?: unknown;
  categorySlugs?: unknown;
  github_url?: unknown;
  githubUrl?: unknown;
  docs_url?: unknown;
  docsUrl?: unknown;
  image_url?: unknown;
  imageUrl?: unknown;
  screenshot_url?: unknown;
  screenshotUrl?: unknown;
  logo_url?: unknown;
  logoUrl?: unknown;
  pricing_model?: unknown;
  pricingModel?: unknown;
  tool_type?: unknown;
  toolType?: unknown;
  tags?: unknown;
  notes?: unknown;
};

export type ValidSubmission = {
  name: string;
  websiteUrl: string;
  tagline: string;
  description: string;
  submitterEmail: string;
  category: string;
  githubUrl: string | null;
  docsUrl: string | null;
  imageUrl: string | null;
  screenshotUrl: string | null;
  logoUrl: string | null;
  pricingModel: string;
  toolType: string;
  tags: string[];
  notes: string | null;
};

export type SubmissionValidationErrors = Partial<Record<keyof ValidSubmission | 'websiteUrl' | 'submitterEmail', string>>;

const CATEGORY_SLUGS = new Set(['cti', 'osint', 'malware-analysis', 'detection-engineering', 'web3-security', 'vulnerability-management', 'security-vendors']);
const PRICING_MODELS = new Set(['free', 'open-source', 'freemium', 'paid', 'enterprise']);

function text(value: unknown) {
  return String(value || '').trim();
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const current = text(value);
    if (current) return current;
  }
  return '';
}

function isSafeUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function optionalUrl(value: string, field: keyof SubmissionValidationErrors, errors: SubmissionValidationErrors) {
  if (!value) return null;
  if (!isSafeUrl(value)) {
    errors[field] = 'Use a valid http:// or https:// URL.';
    return null;
  }
  return value;
}

function asTags(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  return raw.map((item) => String(item).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).filter(Boolean).slice(0, 12);
}

export function getSubmissionValidationErrors(input: SubmissionInput): SubmissionValidationErrors {
  const errors: SubmissionValidationErrors = {};
  const name = text(input.name);
  const websiteUrl = firstText(input.websiteUrl, input.website_url);
  const tagline = text(input.tagline);
  const description = text(input.description);
  const submitterEmail = firstText(input.submitterEmail, input.submitter_email);
  const category = firstText(input.category, input.category_slug) || 'cti';
  const pricingModel = firstText(input.pricingModel, input.pricing_model) || 'freemium';
  const toolType = firstText(input.toolType, input.tool_type) || 'Security tool';

  if (name.length < 2) errors.name = 'Tool name is too short.';
  if (!isSafeUrl(websiteUrl)) errors.websiteUrl = 'Website URL must start with http:// or https://.';
  if (tagline.length < 8 || tagline.length > 140) errors.tagline = 'Tagline must be 8-140 characters.';
  if (description.length < 40) errors.description = 'Description needs at least 40 characters.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(submitterEmail)) errors.submitterEmail = 'Submitter email is invalid.';
  if (!CATEGORY_SLUGS.has(category)) errors.category = 'Choose a supported category.';
  if (!PRICING_MODELS.has(pricingModel)) errors.pricingModel = 'Choose a supported pricing model.';
  if (toolType.length < 3) errors.toolType = 'Tool type is too short.';

  optionalUrl(firstText(input.githubUrl, input.github_url), 'githubUrl', errors);
  optionalUrl(firstText(input.docsUrl, input.docs_url), 'docsUrl', errors);
  optionalUrl(firstText(input.imageUrl, input.image_url), 'imageUrl', errors);
  optionalUrl(firstText(input.screenshotUrl, input.screenshot_url), 'screenshotUrl', errors);
  optionalUrl(firstText(input.logoUrl, input.logo_url), 'logoUrl', errors);

  return errors;
}

export function validateSubmissionInput(input: SubmissionInput): { ok: true; value: ValidSubmission } | { ok: false; errors: SubmissionValidationErrors } {
  const errors = getSubmissionValidationErrors(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const category = firstText(input.category, input.category_slug) || 'cti';
  const pricingModel = firstText(input.pricingModel, input.pricing_model) || 'freemium';
  const toolType = firstText(input.toolType, input.tool_type) || 'Security tool';
  return {
    ok: true,
    value: {
      name: text(input.name),
      websiteUrl: firstText(input.websiteUrl, input.website_url),
      tagline: text(input.tagline),
      description: text(input.description),
      submitterEmail: firstText(input.submitterEmail, input.submitter_email),
      category,
      githubUrl: firstText(input.githubUrl, input.github_url) || null,
      docsUrl: firstText(input.docsUrl, input.docs_url) || null,
      imageUrl: firstText(input.imageUrl, input.image_url) || null,
      screenshotUrl: firstText(input.screenshotUrl, input.screenshot_url) || null,
      logoUrl: firstText(input.logoUrl, input.logo_url) || null,
      pricingModel,
      toolType,
      tags: asTags(input.tags),
      notes: text(input.notes) || null,
    },
  };
}
