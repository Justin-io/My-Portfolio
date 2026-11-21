import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { PROJECTS, ProjectCategoryGroup } from '../data/projects';
import { filterProjects } from '../utils/portfolioLogic';
import { ProjectVisualSignature } from './ProjectVisualSignatures';

interface SelectedWorkProps {
  onNavigate: (path: string, sectionId?: string) => void;
  isArchivePage?: boolean;
}

const FILTER_TABS: { id: ProjectCategoryGroup; label: string }[] = [
  { id: 'all', label: 'All Systems (5)' },
  { id: 'ai-data', label: 'Applied AI & Data (3)' },
  { id: 'hardware', label: 'Hardware & FPGA (1)' },
  { id: 'systems-research', label: 'Local-First & Systems (1)' }
];

export const SelectedWork: React.FC<SelectedWorkProps> = ({
  onNavigate,
  isArchivePage = false
}) => {
  const [selectedGroup, setSelectedGroup] = useState<ProjectCategoryGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const visibleProjects = filterProjects(PROJECTS, selectedGroup, searchQuery);

  return (
    <section
      id="work"
      className={`${
        isArchivePage ? 'pt-32 pb-24' : 'py-20 sm:py-28 border-t border-white/10'
      } px-4 sm:px-6 max-w-[1240px] mx-auto`}
    >
      {/* Editorial Section Header (section#work > div:nth-of-type(1)) */}
      <div className="mb-14 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-2.5">
              01 · ENGINEERING CASE STUDIES
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF] leading-tight">
              <span
                data-nanobot-keyword="Selected Work."
                data-nanobot-priority="3"
                className="inline-block"
              >
                Selected Work.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-7">
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed lg:max-w-[60ch] lg:ml-auto">
              Projects built through experimentation, engineering, and a continuous interest in
              understanding how systems work. Each case study separates verified implementation from
              ongoing research and design targets.
            </p>
          </div>
        </div>

        {/* Full-Width Symmetrical 4-Column Filter Segmented Control */}
        <div
          role="group"
          aria-label="Filter projects by engineering domain"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5 rounded-xl glass-surface"
        >
          {FILTER_TABS.map((tab) => {
            const active = selectedGroup === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGroup(tab.id)}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FFFFFF] ${
                  active
                    ? 'liquid-pill-action font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional search bar on /projects archive route */}
      {isArchivePage && (
        <div className="mb-10">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="project-archive-search" className="sr-only">
              Filter case studies by technology or keyword
            </label>
            <input
              id="project-archive-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword (e.g., XC7K160T, Ridge, RAG)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/15 text-sm text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-2 focus:outline-[#FFFFFF]"
            />
          </div>
        </div>
      )}

      {/* Curated Project List */}
      {visibleProjects.length === 0 ? (
        <div className="glass-surface rounded-2xl p-10 text-center">
          <p className="text-base text-[#FFFFFF] font-medium">
            No engineering case studies match the current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#F4F4F5] text-[#000000] text-xs font-semibold hover:bg-[#FFFFFF] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-20">
          {visibleProjects.map((project) => (
            <article
              key={project.slug}
              className="pt-10 first:pt-4 border-t border-white/10 first:border-t-0"
            >
              {/* Clean Unboxed Metadata Header (Zero-Pill Compliance) */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2 text-[#A1A1AA]">
                  <span className="text-[#FFFFFF] font-semibold">PROJECT {project.index}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.category}</span>
                </div>
                <div className="flex items-center gap-2 text-[#E4E4E7]">
                  <span
                    data-nanobot-keyword={`Maturity: ${project.maturity}`}
                    data-nanobot-priority="2"
                  >
                    Maturity Classification: {project.maturity}
                  </span>
                </div>
              </div>

              {/* Project Title, Description & Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                <div className="lg:col-span-7">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFFFFF] tracking-tight">
                    <a
                      href={`/projects/${project.slug}`}
                      data-nanobot-keyword={project.title}
                      data-nanobot-priority="3"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/projects/${project.slug}`);
                      }}
                      className="inline-block hover:text-[#E4E4E7] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFFFFF]"
                    >
                      {project.title}
                    </a>
                  </h3>
                  <p className="text-sm font-mono text-[#71717A] mt-1">
                    {project.fullName}
                  </p>
                  <p className="text-base text-[#F4F4F5] font-medium mt-4 leading-relaxed max-w-[65ch]">
                    {project.shortDescription}
                  </p>
                  <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed max-w-[65ch]">
                    {project.overview}
                  </p>

                  {/* Unboxed Tech Stack Line */}
                  <div className="mt-5 pt-4 border-t border-white/10 text-xs font-mono text-[#A1A1AA]">
                    <span className="text-[#71717A]">TECHNICAL STACK: </span>
                    {project.techStack.map((tech, i) => (
                      <React.Fragment key={tech}>
                        <span className="text-[#F4F4F5]">{tech}</span>
                        {i < project.techStack.length - 1 && (
                          <span className="mx-2 text-[#71717A]" aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Documented Evidence & Metrics Column (Separated by Hairline Dividers, No Nested Cards) */}
                <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-white/10 border-y border-white/10">
                  {project.metrics.map((metric) => (
                    <div key={metric.label} className="py-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-xs text-[#71717A]">{metric.label}</span>
                        <span
                          data-nanobot-keyword={metric.value}
                          data-nanobot-priority="3"
                          className="font-mono text-base font-semibold text-[#FFFFFF] tabular-nums inline-block"
                        >
                          {metric.value}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-1">{metric.context}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project's Distinct Interactive Visual Signature */}
              <div className="mb-6">
                <ProjectVisualSignature project={project} compact={false} />
              </div>

              {/* Maturity Note & Case Study Actions */}
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs font-mono text-[#71717A] max-w-[70ch]">
                  Verification Note: {project.maturityNote}
                </p>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-[#A1A1AA] hover:text-[#FFFFFF] border border-white/15 hover:border-white/35 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>GitHub Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`/projects/${project.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/projects/${project.slug}`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl liquid-pill-action text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFFFFF]"
                  >
                    <span>Inspect Full Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
