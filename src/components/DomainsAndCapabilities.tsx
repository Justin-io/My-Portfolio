import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { EXPLORATION_DOMAINS, CAPABILITY_GROUPS } from '../data/domainsAndCapabilities';

interface DomainsAndCapabilitiesProps {
  onNavigate: (path: string, sectionId?: string) => void;
}

export const DomainsAndCapabilities: React.FC<DomainsAndCapabilitiesProps> = ({
  onNavigate
}) => {
  const [activeDomainId, setActiveDomainId] = useState<string>(EXPLORATION_DOMAINS[0].id);
  const [activeCapabilityGroupId, setActiveCapabilityGroupId] = useState<string>('all');

  const visibleCapabilityGroups =
    activeCapabilityGroupId === 'all'
      ? CAPABILITY_GROUPS
      : CAPABILITY_GROUPS.filter((g) => g.id === activeCapabilityGroupId);

  return (
    <>
      {/* SECTION 09 — AREAS OF EXPLORATION */}
      <section
        id="domains"
        className="py-20 sm:py-28 border-t border-white/10 px-4 sm:px-6 max-w-[1240px] mx-auto"
      >
        <div className="max-w-[68ch] mb-12">
          <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
            02 · ENGINEERING DOMAINS
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
            <span
              data-nanobot-keyword="Areas of Exploration."
              data-nanobot-priority="3"
              className="inline-block"
            >
              Areas of Exploration.
            </span>
          </h2>
          <p className="text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Four interconnected domains of practical project work and ongoing academic exploration
            across intelligent software, data pipelines, and physical hardware systems.
          </p>
        </div>

        {/* Four Interactive Monochrome Liquid Glass Domain Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXPLORATION_DOMAINS.map((domain) => {
            const isSelected = activeDomainId === domain.id;
            return (
              <div
                key={domain.id}
                onMouseEnter={() => setActiveDomainId(domain.id)}
                className={`glass-interactive rounded-2xl p-6 sm:p-8 flex flex-col justify-between ${
                  isSelected ? 'border-white/35' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10 font-mono text-xs">
                    <span className="text-[#E4E4E7]">DOMAIN {domain.index}</span>
                    <span className="text-[#71717A]">{domain.subtitle}</span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#FFFFFF]">
                    <span
                      data-nanobot-keyword={domain.title}
                      data-nanobot-priority="3"
                      className="inline-block"
                    >
                      {domain.title}
                    </span>
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">
                    {domain.description}
                  </p>

                  {/* Unboxed Topics List with Typographic Separators */}
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="font-mono text-[11px] text-[#71717A] mb-2">
                      ACTIVE AREAS OF INVESTIGATION
                    </p>
                    <p className="text-xs sm:text-sm text-[#F4F4F5] leading-relaxed">
                      {domain.topics.map((topic, idx) => (
                        <React.Fragment key={topic}>
                          <span
                            {...(idx === 0
                              ? {
                                  'data-nanobot-keyword': topic,
                                  'data-nanobot-priority': '2',
                                  className: 'inline-block'
                                }
                              : {})}
                          >
                            {topic}
                          </span>
                          {idx < domain.topics.length - 1 && (
                            <span className="mx-2 text-[#71717A]" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>

                {/* Related Projects & Architectural Evidence */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="font-mono text-[11px] text-[#E4E4E7] mb-2">
                    LINKED PROJECT EVIDENCE
                  </p>
                  <div className="space-y-1.5">
                    {domain.relatedProjectSlugs.map((rel) => (
                      <a
                        key={rel.slug}
                        href={`/projects/${rel.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(`/projects/${rel.slug}`);
                        }}
                        className="flex items-center justify-between text-xs text-[#A1A1AA] hover:text-[#FFFFFF] py-1 transition-colors"
                      >
                        <span className="font-medium text-[#FFFFFF]">{rel.title}</span>
                        <span className="font-mono text-[11px] text-[#71717A] inline-flex items-center gap-1">
                          {rel.maturity}
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#E4E4E7]" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 12 — TECHNICAL CAPABILITIES */}
      <section
        id="capabilities"
        className="py-20 sm:py-24 border-t border-white/10 px-4 sm:px-6 max-w-[1240px] mx-auto"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
              03 · TECHNICAL INVENTORY
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
              <span
                data-nanobot-keyword="Technical Capabilities."
                data-nanobot-priority="3"
                className="inline-block"
              >
                Technical Capabilities.
              </span>
            </h2>
            <p className="text-base text-[#A1A1AA] max-w-[64ch] mt-3 leading-relaxed">
              Organized by engineering function and tied directly to documented repositories and
              case studies — without arbitrary percentage ratings.
            </p>
          </div>

          {/* Interactive Group Filter */}
          <div
            role="group"
            aria-label="Filter capabilities by domain"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#0A0A0A] border border-white/15"
          >
            <button
              type="button"
              onClick={() => setActiveCapabilityGroupId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeCapabilityGroupId === 'all'
                  ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                  : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
              }`}
            >
              All Groups (5)
            </button>
            {CAPABILITY_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveCapabilityGroupId(group.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCapabilityGroupId === group.id
                    ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#FFFFFF]'
                }`}
              >
                {group.category.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCapabilityGroups.map((group, index) => (
            <div
              key={group.id}
              className="glass-surface rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <p className="font-mono text-xs text-[#E4E4E7] mb-1">
                  0{index + 1} · CAPABILITY DOMAIN
                </p>
                <h3 className="font-display text-lg font-semibold text-[#FFFFFF]">
                  <span
                    data-nanobot-keyword={group.category}
                    data-nanobot-priority="3"
                    className="inline-block"
                  >
                    {group.category}
                  </span>
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                  {group.contextNote}
                </p>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                  {group.items.map((item, itemIdx) => (
                    <div key={item.name} className="text-xs">
                      <p className="font-semibold text-[#FFFFFF]">
                        <span
                          {...(itemIdx === 0
                            ? {
                                'data-nanobot-keyword': item.name,
                                'data-nanobot-priority': '2',
                                className: 'inline-block'
                              }
                            : {})}
                        >
                          {item.name}
                        </span>
                      </p>
                      <p className="text-[#71717A] font-mono text-[11px] mt-0.5">
                        {item.linkedEvidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
