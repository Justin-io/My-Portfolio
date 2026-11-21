import { PROJECTS, ProjectCaseStudy, ProjectCategoryGroup } from '../data/projects';

export type RouteDescriptor =
  | { page: 'home' }
  | { page: 'projects' }
  | { page: 'project-detail'; slug: string }
  | { page: 'about' }
  | { page: 'contact' };

export function parseRoute(pathname: string): RouteDescriptor {
  const clean = pathname.trim().replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '') {
    return { page: 'home' };
  }
  if (clean === '/projects') {
    return { page: 'projects' };
  }
  if (clean.startsWith('/projects/')) {
    const slug = clean.slice('/projects/'.length).trim();
    if (slug) {
      return { page: 'project-detail', slug };
    }
    return { page: 'projects' };
  }
  if (clean === '/about') {
    return { page: 'about' };
  }
  if (clean === '/contact') {
    return { page: 'contact' };
  }
  return { page: 'home' };
}

export function filterProjects(
  projects: ProjectCaseStudy[],
  categoryGroup: ProjectCategoryGroup,
  searchQuery = ''
): ProjectCaseStudy[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return projects.filter((project) => {
    const matchesCategory = categoryGroup === 'all' || project.categoryGroup === categoryGroup;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      project.title,
      project.fullName,
      project.category,
      project.maturity,
      project.shortDescription,
      ...project.techStack
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getProjectBySlug(
  projects: ProjectCaseStudy[],
  slug: string
): ProjectCaseStudy | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(
  projects: ProjectCaseStudy[],
  currentSlug: string
): { previous: ProjectCaseStudy; next: ProjectCaseStudy } {
  const index = projects.findIndex((p) => p.slug === currentSlug);
  if (index === -1 || projects.length === 0) {
    return { previous: projects[0], next: projects[projects.length - 1] };
  }
  const prevIndex = (index - 1 + projects.length) % projects.length;
  const nextIndex = (index + 1) % projects.length;
  return {
    previous: projects[prevIndex],
    next: projects[nextIndex]
  };
}

export type ChillerEntityId = 'CHILLER-01' | 'CHILLER-02' | 'CHILLER-03';

export interface ChillerTelemetryProfile {
  entityId: ChillerEntityId;
  recordSliceCount: number;
  totalDatasetRecords: number;
  channelCount: number;
  datasetQualityScore: number;
  ridgeR2: number;
  operatingProfile: string;
  channels: {
    code: string;
    name: string;
    unit: string;
    nominalRange: string;
    ridgeWeightSign: 'Positive' | 'Negative' | 'Stabilized';
  }[];
  sampleResiduals: number[];
}

export const VOIDE_CHANNELS = [
  { code: 'CH-01', name: 'Chilled Water Supply Temp', unit: '°C', nominalRange: '6.2 – 7.8', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-02', name: 'Chilled Water Return Temp', unit: '°C', nominalRange: '11.4 – 13.5', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-03', name: 'Condenser Water In Temp', unit: '°C', nominalRange: '26.5 – 29.8', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-04', name: 'Condenser Water Out Temp', unit: '°C', nominalRange: '31.2 – 35.4', ridgeWeightSign: 'Stabilized' as const },
  { code: 'CH-05', name: 'Evaporator Approach Delta-T', unit: 'K', nominalRange: '1.1 – 2.4', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-06', name: 'Condenser Approach Delta-T', unit: 'K', nominalRange: '1.4 – 3.1', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-07', name: 'Compressor Load Current', unit: 'A', nominalRange: '142 – 310', ridgeWeightSign: 'Positive' as const },
  { code: 'CH-08', name: 'Electrical Input Power', unit: 'kW', nominalRange: '98.5 – 215.0', ridgeWeightSign: 'Stabilized' as const },
  { code: 'CH-09', name: 'Evaporator Flow Rate', unit: 'L/s', nominalRange: '34.0 – 48.5', ridgeWeightSign: 'Negative' as const },
  { code: 'CH-10', name: 'Suction Pressure', unit: 'kPa', nominalRange: '345 – 410', ridgeWeightSign: 'Negative' as const },
  { code: 'CH-11', name: 'Discharge Pressure', unit: 'kPa', nominalRange: '920 – 1140', ridgeWeightSign: 'Positive' as const }
];

export function getVoideChillerTelemetry(entityId: ChillerEntityId): ChillerTelemetryProfile {
  const slices: Record<
    ChillerEntityId,
    { count: number; profile: string; residuals: number[] }
  > = {
    'CHILLER-01': {
      count: 8335,
      profile: 'Primary baseload loop · High continuity · Lowest residual variance across thermal delta channels',
      residuals: [0.12, -0.08, 0.05, 0.19, -0.14, 0.04, -0.06, 0.11, -0.03, 0.07, 0.02, -0.05]
    },
    'CHILLER-02': {
      count: 8334,
      profile: 'Variable-load secondary loop · Step-change load transitions evaluated under L2 regularization',
      residuals: [-0.18, 0.24, -0.11, 0.09, 0.31, -0.22, 0.15, -0.09, 0.14, -0.17, 0.08, -0.04]
    },
    'CHILLER-03': {
      count: 8334,
      profile: 'Peak-shaving auxiliary loop · Audited for intermittent sensor dropout intervals in quality gate',
      residuals: [0.09, -0.15, 0.28, -0.34, 0.21, -0.12, 0.06, 0.18, -0.25, 0.13, -0.09, 0.05]
    }
  };

  const selected = slices[entityId];
  return {
    entityId,
    recordSliceCount: selected.count,
    totalDatasetRecords: 25003,
    channelCount: 11,
    datasetQualityScore: 90.4,
    ridgeR2: 0.9896,
    operatingProfile: selected.profile,
    channels: VOIDE_CHANNELS,
    sampleResiduals: selected.residuals
  };
}

export interface JarvisRoutingDecision {
  tier: 'Tier 1 — Deterministic Local' | 'Tier 2 — Local LLM (Ollama / llama.cpp)' | 'Tier 3 — Sanitized Cloud Fallback';
  privacyBoundary: '100% On-Device (Zero LLM Tokens)' | '100% On-Device (Local GGUF Weights)' | 'Outbound Payload Sanitized (Secrets Redacted)';
  classificationReason: string;
  targetLatencyClass: string;
  isExperimentalModule: boolean;
}

export function simulateJarvisRouting(
  query: string,
  allowCloudFallback: boolean
): JarvisRoutingDecision {
  const q = query.trim().toLowerCase();

  if (!q || q.includes('status') || q.includes('git') || q.includes('port') || q.includes('timer') || q.includes('service')) {
    return {
      tier: 'Tier 1 — Deterministic Local',
      privacyBoundary: '100% On-Device (Zero LLM Tokens)',
      classificationReason: 'Matched structured system command / workspace inspection intent. Routed directly to deterministic Python handler.',
      targetLatencyClass: 'Deterministic Local Execution',
      isExperimentalModule: false
    };
  }

  const requiresDeepSynthesis =
    q.includes('architecture') ||
    q.includes('compare') ||
    q.includes('design') ||
    q.includes('proof') ||
    q.includes('distributed');

  if (requiresDeepSynthesis && allowCloudFallback) {
    return {
      tier: 'Tier 3 — Sanitized Cloud Fallback',
      privacyBoundary: 'Outbound Payload Sanitized (Secrets Redacted)',
      classificationReason: 'High multi-step reasoning complexity detected and Cloud Fallback is authorized. Environment variables and file paths stripped before dispatch.',
      targetLatencyClass: 'Remote Frontier Reasoning (Experimental Fallback)',
      isExperimentalModule: true
    };
  }

  return {
    tier: 'Tier 2 — Local LLM (Ollama / llama.cpp)',
    privacyBoundary: '100% On-Device (Local GGUF Weights)',
    classificationReason: requiresDeepSynthesis
      ? 'High reasoning complexity detected, but Cloud Fallback is disabled—retaining execution on local quantized model.'
      : 'Contextual summarization / code analysis intent matched to local quantized LLM runtime.',
    targetLatencyClass: 'Local Hardware Inference (Ollama / llama.cpp)',
    isExperimentalModule: false
  };
}

export const GETFORM_ENDPOINT = 'https://getform.io/f/161d40d2-275f-4027-b38d-926c67413486';

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
  mailtoHref?: string;
}

export function validateContactInquiry(
  input: ContactFormInput,
  recipientEmail = 'harinandhan972@gmail.com'
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name) {
    errors.name = 'Please enter your name.';
  }
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!subject) {
    errors.subject = 'Please specify a brief subject or topic.';
  }
  if (!message || message.length < 12) {
    errors.message = 'Please include a short message (at least 12 characters).';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const encodedSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject}`);
  const encodedBody = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`
  );

  return {
    valid: true,
    errors: {},
    mailtoHref: `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`
  };
}

export { PROJECTS };
