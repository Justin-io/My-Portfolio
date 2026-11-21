import React, { useState } from 'react';
import { Mail, ArrowUpRight, Copy, Check, Send } from 'lucide-react';
import { OWNER_CONTACT_INFO } from '../data/experienceAndNotes';
import { validateContactInquiry } from '../utils/portfolioLogic';

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
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<'name' | 'email' | 'subject' | 'message', string>>
  >({});
  const [submittedMailto, setSubmittedMailto] = useState<string | null>(null);
  const [copiedInquiry, setCopiedInquiry] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactInquiry(formState, OWNER_CONTACT_INFO.email);
    if (!result.valid) {
      setFormErrors(result.errors);
      setSubmittedMailto(null);
      return;
    }
    setFormErrors({});
    setSubmittedMailto(result.mailtoHref || `mailto:${OWNER_CONTACT_INFO.email}`);
  };

  const handleCopyFormattedInquiry = async () => {
    const formatted = `To: ${OWNER_CONTACT_INFO.email}\nFrom: ${formState.name} <${formState.email}>\nSubject: [Portfolio Inquiry] ${formState.subject}\n\n${formState.message}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedInquiry(true);
      setTimeout(() => setCopiedInquiry(false), 2500);
    } catch {
      setCopiedInquiry(true);
      setTimeout(() => setCopiedInquiry(false), 2500);
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
          {/* Left Column: Calm Editorial Closing & Authentic Direct Links */}
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
                data-nanobot-keyword={OWNER_CONTACT_INFO.email}
                data-nanobot-priority="2"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl glass-interactive text-xs sm:text-sm font-mono text-[#FFFFFF] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFFFFF]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-[#FFFFFF]" />
                    <span>Copied: {OWNER_CONTACT_INFO.email}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#A1A1AA]" />
                    <span>{OWNER_CONTACT_INFO.email}</span>
                  </>
                )}
              </button>
            </div>

            {/* Verified External Profile Channels */}
            <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
              <p className="font-mono text-xs text-[#71717A]">AUTHENTIC CONTACT CHANNELS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={OWNER_CONTACT_INFO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-interactive rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-xs text-[#71717A]">GITHUB REPOSITORIES</p>
                    <p className="text-sm font-semibold text-[#FFFFFF] mt-0.5">
                      <span
                        data-nanobot-keyword="github.com/harinandank"
                        data-nanobot-priority="2"
                        className="inline-block"
                      >
                        github.com/harinandank
                      </span>
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#E4E4E7]" />
                </a>

                <a
                  href={OWNER_CONTACT_INFO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-interactive rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-xs text-[#71717A]">LINKEDIN PROFILE</p>
                    <p className="text-sm font-semibold text-[#FFFFFF] mt-0.5">
                      <span
                        data-nanobot-keyword="LinkedIn · Hari Nandan K."
                        data-nanobot-priority="2"
                        className="inline-block"
                      >
                        Hari Nandan K.
                      </span>
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#E4E4E7]" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Structured Inquiry Builder */}
          <div className="lg:col-span-6">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="glass-surface rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <h3 className="font-display text-lg font-semibold text-[#FFFFFF]">
                  <span
                    data-nanobot-keyword="Direct Engineering Inquiry"
                    data-nanobot-priority="2"
                    className="inline-block"
                  >
                    Direct Engineering Inquiry
                  </span>
                </h3>
                <span className="font-mono text-xs text-[#71717A]">
                  To: {OWNER_CONTACT_INFO.email}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formState.name}
                    onChange={(e) => {
                      setFormState((s) => ({ ...s, name: e.target.value }));
                      setSubmittedMailto(null);
                    }}
                    placeholder="e.g., Rahul Nair"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                  />
                  {formErrors.name && (
                    <p role="alert" className="text-xs text-[#E4E4E7] mt-1 font-mono">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                  >
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => {
                      setFormState((s) => ({ ...s, email: e.target.value }));
                      setSubmittedMailto(null);
                    }}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                  />
                  {formErrors.email && (
                    <p role="alert" className="text-xs text-[#E4E4E7] mt-1 font-mono">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact-subject"
                  className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                >
                  Subject / Technical Topic
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={formState.subject}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, subject: e.target.value }));
                    setSubmittedMailto(null);
                  }}
                  placeholder="e.g., Applied AI, Embedded Hardware, or Research Collaboration"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                />
                {formErrors.subject && (
                  <p role="alert" className="text-xs text-[#E4E4E7] mt-1 font-mono">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="contact-message"
                  className="block font-mono text-xs text-[#A1A1AA] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={formState.message}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, message: e.target.value }));
                    setSubmittedMailto(null);
                  }}
                  placeholder="Describe the project, technical problem, or collaboration opportunity..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
                />
                {formErrors.message && (
                  <p role="alert" className="text-xs text-[#E4E4E7] mt-1 font-mono">
                    {formErrors.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl liquid-pill-action text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Prepare Inquiry</span>
                </button>
              </div>

              {submittedMailto && (
                <div
                  role="status"
                  className="mt-5 p-4 rounded-xl bg-[#000000] border border-white/30"
                >
                  <p className="text-xs font-semibold text-[#FFFFFF]">
                    Inquiry validated and ready for dispatch to {OWNER_CONTACT_INFO.email}.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={submittedMailto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFFFFF] text-[#000000] text-xs font-semibold hover:bg-[#E4E4E7] transition-colors"
                    >
                      <span>Open in Email Client</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyFormattedInquiry}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/20 text-xs font-mono text-[#FFFFFF] hover:bg-white/10 transition-colors"
                    >
                      {copiedInquiry ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#FFFFFF]" />
                          <span>Formatted Inquiry Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Formatted Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Quiet Editorial Footer (No Fake Telemetry Tickers) */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 max-w-[1240px] mx-auto text-xs text-[#71717A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[#FFFFFF] font-semibold">Hari Nandan K.</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>Applied AI &amp; Systems Engineer</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
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
          </div>
        </div>
      </footer>
    </>
  );
};
