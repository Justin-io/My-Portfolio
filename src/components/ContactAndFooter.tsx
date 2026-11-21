import React, { useState } from 'react';
import { Mail, ArrowUpRight, Copy, Check, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { OWNER_CONTACT_INFO } from '../data/experienceAndNotes';
import { GETFORM_ENDPOINT } from '../utils/portfolioLogic';

interface ContactAndFooterProps {
  onNavigate: (path: string, sectionId?: string) => void;
  isStandalonePage?: boolean;
}

export const ContactAndFooter: React.FC<ContactAndFooterProps> = ({
  onNavigate,
  isStandalonePage = false
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    project_type: '',
    timeline: '1 Month',
    budget: '$3,000 - $6,000',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [fallbackMailto, setFallbackMailto] = useState<string | null>(null);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OWNER_CONTACT_INFO.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Zero-trust client-side validation
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) {
      errors.name = 'Please enter your name.';
    }
    if (!formState.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formState.project_type) {
      errors.project_type = 'Please select a service or project category.';
    }
    if (!formState.message.trim() || formState.message.trim().length < 10) {
      errors.message = 'Please provide requirements (minimum 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Build payload for Getform endpoint
    const formData = new FormData();
    formData.append('name', formState.name.trim());
    formData.append('email', formState.email.trim());
    formData.append('project_type', formState.project_type);
    formData.append('timeline', formState.timeline);
    formData.append('budget', formState.budget);
    formData.append('message', formState.message.trim());

    // Prepare mailto fallback
    const encodedSubject = encodeURIComponent(`[Portfolio Inquiry] ${formState.project_type || 'Engineering Collaboration'}`);
    const encodedBody = encodeURIComponent(
      `Name: ${formState.name.trim()}\nEmail: ${formState.email.trim()}\nProject: ${formState.project_type}\nTimeline: ${formState.timeline}\nBudget: ${formState.budget}\n\nRequirements:\n${formState.message.trim()}`
    );
    setFallbackMailto(`mailto:${OWNER_CONTACT_INFO.email}?subject=${encodedSubject}&body=${encodedBody}`);

    try {
      const response = await fetch(GETFORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        setSubmitStatus('success');
        setStatusMessage(
          'Inquiry Received: Thank you for reaching out. I will review your project requirements and follow up using the contact details you provided.'
        );
        setFormState({
          name: '',
          email: '',
          project_type: '',
          timeline: '1 Month',
          budget: '$3,000 - $6,000',
          message: ''
        });
      } else {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
    } catch {
      setSubmitStatus('error');
      setStatusMessage(
        'Submission encountered an issue. You can retry transmission or open your email client directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section
        id="contact"
        className={`${
          isStandalonePage ? 'pt-32 pb-20' : 'py-20 sm:py-28 border-t border-white/10'
        } px-4 sm:px-6 max-w-[1240px] mx-auto`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Links & Authentic Profiles */}
          <div className="lg:col-span-6">
            <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
              07 · INITIATE DIALOGUE
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
              <span
                data-nanobot-keyword="Have something worth building?"
                data-nanobot-priority="3"
                className="inline-block"
              >
                Have something worth building?
              </span>
            </h2>
            <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed max-w-[54ch]">
              I&apos;m interested in engineering problems involving AI, data, intelligent systems,
              and hardware.
            </p>

            {/* Primary Email Action & Copy Button */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${OWNER_CONTACT_INFO.email}`}
                data-nanobot-keyword="Start a Conversation"
                data-nanobot-priority="3"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl liquid-pill-action text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Start a Conversation</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl glass-interactive text-sm font-mono text-[#E4E4E7] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                aria-label="Copy direct email address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-[#A5B4FC]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#A1A1AA]" />
                    <span>{OWNER_CONTACT_INFO.email}</span>
                  </>
                )}
              </button>
            </div>

            {/* Authentic GitHub and LinkedIn Channels */}
            <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
              <p className="font-mono text-xs text-[#71717A]">AUTHENTIC CONTACT CHANNELS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* GitHub Channel */}
                <a
                  href={OWNER_CONTACT_INFO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-interactive rounded-xl p-4 flex items-center justify-between group"
                  aria-label="GitHub Profile: Justin-io"
                >
                  <div>
                    <p className="font-mono text-xs text-[#71717A]">GITHUB REPOSITORIES</p>
                    <p className="text-sm font-semibold text-[#FFFFFF] mt-0.5">
                      <span
                        data-nanobot-keyword="github.com/Justin-io"
                        data-nanobot-priority="2"
                        className="inline-block"
                      >
                        github.com/Justin-io
                      </span>
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#E4E4E7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* LinkedIn Channel */}
                <a
                  href={OWNER_CONTACT_INFO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-interactive rounded-xl p-4 flex items-center justify-between group"
                  aria-label="LinkedIn Profile: Hari Nandan K."
                >
                  <div>
                    <p className="font-mono text-xs text-[#71717A]">LINKEDIN PROFILE</p>
                    <p className="text-sm font-semibold text-[#FFFFFF] mt-0.5">
                      <span
                        data-nanobot-keyword="linkedin.com/in/hari-nandan-k"
                        data-nanobot-priority="2"
                        className="inline-block"
                      >
                        linkedin.com/in/hari-nandan-k
                      </span>
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#E4E4E7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Project Inquiry Form Connected to Getform Backend */}
          <div className="lg:col-span-6">
            <form
              id="contactForm"
              action={GETFORM_ENDPOINT}
              method="POST"
              onSubmit={handleSubmit}
              noValidate
              className="glass-surface rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <h3 className="font-display text-lg font-semibold text-[#FFFFFF]">
                  <span
                    data-nanobot-keyword="Project Inquiry Form"
                    data-nanobot-priority="2"
                    className="inline-block"
                  >
                    Project Inquiry Form
                  </span>
                </h3>
                <span className="font-mono text-xs text-[#71717A]">
                  Direct Dispatch
                </span>
              </div>

              {/* Status Box */}
              {submitStatus === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 text-xs sm:text-sm flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-300">Inquiry Received</p>
                    <p className="mt-1 leading-relaxed text-emerald-200/90">{statusMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-5 p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-200 text-xs sm:text-sm flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-300">Submission Notice</p>
                      <p className="mt-1 leading-relaxed text-rose-200/90">{statusMessage}</p>
                    </div>
                  </div>
                  {fallbackMailto && (
                    <div className="flex items-center gap-2 pt-2 border-t border-rose-500/20">
                      <a
                        href={fallbackMailto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send via Email Client</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Your Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => {
                      setFormState((s) => ({ ...s, name: e.target.value }));
                      if (formErrors.name) setFormErrors((errs) => ({ ...errs, name: '' }));
                    }}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                  />
                  {formErrors.name && (
                    <p role="alert" className="text-xs text-rose-400 mt-1 font-mono">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Work Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => {
                      setFormState((s) => ({ ...s, email: e.target.value }));
                      if (formErrors.email) setFormErrors((errs) => ({ ...errs, email: '' }));
                    }}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                  />
                  {formErrors.email && (
                    <p role="alert" className="text-xs text-rose-400 mt-1 font-mono">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Type Dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="project_type"
                  className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                >
                  What are you looking to build? *
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  required
                  value={formState.project_type}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, project_type: e.target.value }));
                    if (formErrors.project_type) setFormErrors((errs) => ({ ...errs, project_type: '' }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] focus:outline-2 focus:outline-[#FFFFFF]"
                >
                  <option value="" disabled>Select a Service Offering...</option>
                  <option value="AI Application & LLM Systems">AI Application / Custom RAG / Autonomous Agent</option>
                  <option value="Full-Stack Web App / MVP">Full-Stack Web Product / SaaS MVP</option>
                  <option value="Workflow Automation & Bots">Workflow Automation / WhatsApp Bot / Data Scraper</option>
                  <option value="Security Engineering & Audit">Security Audit / API Hardening / Zero-Trust Architecture</option>
                  <option value="Other Custom Engineering">Other Custom Engineering Project</option>
                </select>
                {formErrors.project_type && (
                  <p role="alert" className="text-xs text-rose-400 mt-1 font-mono">
                    {formErrors.project_type}
                  </p>
                )}
              </div>

              {/* Timeline & Budget Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="timeline"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Estimated Timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formState.timeline}
                    onChange={(e) => setFormState((s) => ({ ...s, timeline: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] focus:outline-2 focus:outline-[#FFFFFF]"
                  >
                    <option value="Urgent (< 2 Weeks)">Urgent (&lt; 2 Weeks)</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2-3 Months">2–3 Months</option>
                    <option value="Flexible / Ongoing">Flexible / Ongoing Partnership</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Estimated Budget
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formState.budget}
                    onChange={(e) => setFormState((s) => ({ ...s, budget: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] focus:outline-2 focus:outline-[#FFFFFF]"
                  >
                    <option value="$1,500 - $3,000">$1,500 – $3,000</option>
                    <option value="$3,000 - $6,000">$3,000 – $6,000</option>
                    <option value="$6,000 - $10,000+">$6,000 – $10,000+</option>
                    <option value="Custom / Let's Discuss">Custom / Let&apos;s Discuss</option>
                  </select>
                </div>
              </div>

              {/* Project Requirements Textarea */}
              <div className="mb-5">
                <label
                  htmlFor="message"
                  className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                >
                  Project Overview &amp; Key Requirements *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formState.message}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, message: e.target.value }));
                    if (formErrors.message) setFormErrors((errs) => ({ ...errs, message: '' }));
                  }}
                  placeholder="Tell me about your product goals, technical stack, current bottlenecks, and any specific deadlines..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                />
                {formErrors.message && (
                  <p role="alert" className="text-xs text-rose-400 mt-1 font-mono">
                    {formErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl liquid-pill-action text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Project Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Editorial Footer with Clear Social & Navigation Links */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 max-w-[1240px] mx-auto text-xs text-[#71717A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="text-[#FFFFFF] font-semibold">Hari Nandan K.</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Applied AI &amp; Systems Engineer</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>B.Tech Data Science · Kerala, India</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'hero');
              }}
              className="hover:text-[#FFFFFF] transition-colors"
            >
              Home
            </a>
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/projects');
              }}
              className="hover:text-[#FFFFFF] transition-colors"
            >
              Case Studies
            </a>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/about');
              }}
              className="hover:text-[#FFFFFF] transition-colors"
            >
              About
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/contact');
              }}
              className="hover:text-[#FFFFFF] transition-colors"
            >
              Contact
            </a>
            <span className="text-white/20" aria-hidden="true">|</span>
            <a
              href={OWNER_CONTACT_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FFFFFF] text-[#A1A1AA] font-medium transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-[#71717A]" />
            </a>
            <a
              href={OWNER_CONTACT_INFO.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FFFFFF] text-[#A1A1AA] font-medium transition-colors inline-flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-[#71717A]" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
