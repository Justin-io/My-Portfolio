import React from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROJECTS, ProjectCaseStudy } from '../data/projects';
import { getAdjacentProjects } from '../utils/portfolioLogic';
import { ProjectVisualSignature } from './ProjectVisualSignatures';

interface ProjectCaseStudyViewProps {
  project: ProjectCaseStudy;
  onNavigate: (path: string, sectionId?: string) => void;
}

export const ProjectCaseStudyView: React.FC<ProjectCaseStudyViewProps> = ({
  project,
  onNavigate
}) => {
  const { previous, next } = getAdjacentProjects(PROJECTS, project.slug);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-[1160px] mx-auto">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/', 'work');
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Selected Work</span>
        </a>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#A1A1AA]">
          <span>CASE STUDY {project.index} / 05</span>
          <span aria-hidden="true">·</span>
          <span>{project.category}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#E4E4E7]">Maturity: {project.maturity}</span>
        </div>
      </div>

      {/* Case Study Hero Header */}
      <header className="mb-12">
        <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
          {project.fullName}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#FFFFFF] leading-[1.1]">
          {project.title}
        </h1>
        <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-[68ch] mt-5">
          {project.shortDescription}
        </p>

        {/* Key Metrics Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="glass-surface rounded-xl p-4">
              <p className="font-mono text-xs text-[#71717A]">{metric.label}</p>
              <p className="font-mono text-xl font-semibold text-[#FFFFFF] mt-1 tabular-nums">
                {metric.value}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-1">{metric.context}</p>
            </div>
          ))}
        </div>

        {/* Honest Maturity Disclosure Banner */}
        <div className="mt-6 p-4 rounded-xl bg-[#0A0A0A] border border-white/15 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#E4E4E7] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-mono font-semibold text-[#FFFFFF]">
              ENGINEERING MATURITY DISCLOSURE ({project.maturity.toUpperCase()}):{' '}
            </span>
            <span className="text-[#A1A1AA]">{project.maturityNote}</span>
          </div>
        </div>
      </header>

      {/* Interactive System Visual Signature */}
      <section aria-label="Interactive System Architecture Workspace" className="mb-14">
        <ProjectVisualSignature project={project} compact={false} />
      </section>

      {/* 12-Section Structured Case Study Architecture */}
      <div className="space-y-12">
        {/* 01. Overview & 02. Problem Statement & 03. Engineering Objective */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">01 · PROJECT OVERVIEW</p>
            <h2 className="font-display text-lg font-semibold text-[#FFFFFF] mb-3">
              Context &amp; Scope
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{project.overview}</p>
          </section>

          <section className="glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">02 · PROBLEM STATEMENT</p>
            <h2 className="font-display text-lg font-semibold text-[#FFFFFF] mb-3">
              Technical Bottleneck
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{project.problemStatement}</p>
          </section>

          <section className="glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">03 · ENGINEERING OBJECTIVE</p>
            <h2 className="font-display text-lg font-semibold text-[#FFFFFF] mb-3">
              Target System Goal
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              {project.engineeringObjective}
            </p>
          </section>
        </div>

        {/* 04. Constraints & 05. System Architecture Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">04 · DESIGN CONSTRAINTS</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              Operating Boundaries
            </h2>
            <ul className="space-y-3 text-sm text-[#A1A1AA]">
              {project.constraints.map((constraint, i) => (
                <li key={i} className="pb-3 border-b border-white/10 last:border-none last:pb-0">
                  <span className="font-mono text-xs text-[#FFFFFF] mr-2">0{i + 1}.</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-7 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">05 · SYSTEM ARCHITECTURE</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-2">
              Subsystem Decomposition
            </h2>
            <p className="text-sm text-[#A1A1AA] mb-5">{project.systemArchitectureSummary}</p>

            <div className="divide-y divide-white/10 border-t border-white/10">
              {project.architectureNodes.map((node) => (
                <div key={node.id} className="py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#FFFFFF]">
                      {node.label} ·{' '}
                      <span className="font-mono text-xs text-[#E4E4E7]">{node.sublabel}</span>
                    </span>
                    <span className="font-mono text-xs text-[#71717A]">
                      Status: {node.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{node.details}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 06. Implementation & 07. Engineering Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-6 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">06 · IMPLEMENTATION</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              What Was Built
            </h2>
            <ul className="space-y-3 text-sm text-[#A1A1AA]">
              {project.implementation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E4E4E7] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-6 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">07 · ENGINEERING DECISIONS</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              Architectural Trade-Offs
            </h2>
            <div className="divide-y divide-white/10 border-t border-white/10">
              {project.engineeringDecisions.map((ed, idx) => (
                <div key={idx} className="py-3.5">
                  <h3 className="text-sm font-semibold text-[#FFFFFF]">{ed.decision}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1.5">
                    <strong className="text-[#FFFFFF]">Rationale:</strong> {ed.rationale}
                  </p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    <strong className="text-[#E4E4E7]">Trade-Off:</strong> {ed.tradeoff}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 08. Technical Challenges & 09. Results and Verification Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">08 · TECHNICAL CHALLENGES</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              Friction &amp; Edge Cases
            </h2>
            <ul className="space-y-3 text-sm text-[#A1A1AA]">
              {project.technicalChallenges.map((ch, idx) => (
                <li key={idx} className="pb-3 border-b border-white/10 last:border-none last:pb-0">
                  {ch}
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-7 glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">
              09 · RESULTS, EVALUATION &amp; VERIFICATION LEDGER
            </p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-2">
              Evidence vs. Unverified Targets
            </h2>
            <p className="text-sm text-[#A1A1AA] mb-5 leading-relaxed">
              {project.resultsAndEvaluation}
            </p>

            <div className="divide-y divide-white/10 border-t border-white/10">
              {project.verificationMatrix.map((v, idx) => (
                <div
                  key={idx}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">{v.aspect}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{v.notes}</p>
                  </div>
                  <span className="font-mono text-xs text-[#E4E4E7] shrink-0">
                    {v.stage}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 10. Known Limitations & 11. Future Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">10 · KNOWN LIMITATIONS</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              Current Boundaries &amp; Non-Claims
            </h2>
            <ul className="space-y-3 text-sm text-[#A1A1AA]">
              {project.limitations.map((lim, idx) => (
                <li key={idx} className="pb-3 border-b border-white/10 last:border-none last:pb-0">
                  {lim}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-surface rounded-2xl p-6">
            <p className="font-mono text-xs text-[#E4E4E7] mb-2">11 · FUTURE IMPROVEMENTS</p>
            <h2 className="font-display text-xl font-semibold text-[#FFFFFF] mb-4">
              Next Engineering Milestones
            </h2>
            <ul className="space-y-3 text-sm text-[#A1A1AA]">
              {project.futureImprovements.map((imp, idx) => (
                <li key={idx} className="pb-3 border-b border-white/10 last:border-none last:pb-0">
                  {imp}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 12. Source Code, Artifacts & Asset Integrity Disclosure */}
        <section className="glass-surface rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-[#E4E4E7] mb-2">
                12 · SOURCE CODE, ARTIFACTS &amp; ASSET DISCLOSURE
              </p>
              <h2 className="font-display text-xl font-semibold text-[#FFFFFF]">
                Repository &amp; Documentation
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-2 max-w-[75ch] leading-relaxed">
                {project.assetDisclosure}
              </p>
              <p className="font-mono text-xs text-[#71717A] mt-3">
                Stack:{' '}
                {project.techStack.map((t, i) => (
                  <React.Fragment key={t}>
                    <span className="text-[#F4F4F5]">{t}</span>
                    {i < project.techStack.length - 1 && ' · '}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl liquid-pill-action text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Inspect on GitHub</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Sequential Case Study Navigation Footer */}
      <nav
        aria-label="Adjacent Case Studies"
        className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <a
          href={`/projects/${previous.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/projects/${previous.slug}`);
          }}
          className="glass-interactive rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-mono text-xs text-[#71717A]">← PREVIOUS CASE STUDY</p>
            <p className="font-display text-base font-semibold text-[#FFFFFF] mt-1">
              {previous.index} · {previous.title}
            </p>
          </div>
        </a>

        <a
          href={`/projects/${next.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/projects/${next.slug}`);
          }}
          className="glass-interactive rounded-2xl p-5 flex items-center justify-between gap-4 text-right"
        >
          <div className="ml-auto">
            <p className="font-mono text-xs text-[#71717A]">NEXT CASE STUDY →</p>
            <p className="font-display text-base font-semibold text-[#FFFFFF] mt-1">
              {next.index} · {next.title}
            </p>
          </div>
        </a>
      </nav>
    </div>
  );
};
