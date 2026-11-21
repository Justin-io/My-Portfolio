import React, { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { EXPERIENCE_ENTRIES, ENGINEERING_NOTES } from '../data/experienceAndNotes';

interface ExperienceAndNotesProps {
  onNavigate: (path: string, sectionId?: string) => void;
}

export const ExperienceAndNotes: React.FC<ExperienceAndNotesProps> = ({ onNavigate }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(ENGINEERING_NOTES[0].id);
  const activeNote =
    ENGINEERING_NOTES.find((n) => n.id === selectedNoteId) || ENGINEERING_NOTES[0];

  return (
    <>
      {/* SECTION 10 — EXPERIENCE & LEADERSHIP */}
      <section
        id="experience"
        className="py-20 sm:py-28 border-t border-white/10 px-4 sm:px-6 max-w-[1240px] mx-auto"
      >
        <div className="max-w-[68ch] mb-12">
          <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
            04 · INITIATIVES &amp; PRACTICAL LEADERSHIP
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
            <span
              data-nanobot-keyword="Building Beyond the Code."
              data-nanobot-priority="3"
              className="inline-block"
            >
              Building Beyond the Code.
            </span>
          </h2>
          <p className="text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Confirmed engineering initiatives and hardware architecture studies — focusing on
            concrete technical contributions rather than inflated titles.
          </p>
        </div>

        <div className="space-y-8">
          {EXPERIENCE_ENTRIES.map((entry, idx) => (
            <article key={entry.id} className="glass-surface rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10 font-mono text-xs">
                <div className="text-[#FFFFFF] font-semibold">
                  <span
                    data-nanobot-keyword={entry.organization}
                    data-nanobot-priority="3"
                    className="inline-block"
                  >
                    0{idx + 1} · {entry.organization}
                  </span>
                </div>
                <div className="text-[#E4E4E7]">
                  {entry.location} · {entry.timelineDisclosure}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#FFFFFF]">
                    {entry.role}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">{entry.summary}</p>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="font-mono text-[11px] text-[#71717A] mb-2">FOCUS AREAS</p>
                    <p className="text-xs text-[#F4F4F5] leading-relaxed">
                      {entry.focusAreas.map((area, areaIdx) => (
                        <React.Fragment key={area}>
                          <span
                            {...(areaIdx === 0
                              ? {
                                  'data-nanobot-keyword': area,
                                  'data-nanobot-priority': '2',
                                  className: 'inline-block'
                                }
                              : {})}
                          >
                            {area}
                          </span>
                          {areaIdx < entry.focusAreas.length - 1 && ' · '}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-xs text-[#E4E4E7] mb-3">
                      CONCRETE CONTRIBUTIONS &amp; ENGINEERING SCOPE
                    </p>
                    <ul className="space-y-3 text-sm text-[#A1A1AA]">
                      {entry.contributions.map((c, i) => (
                        <li
                          key={i}
                          className="pb-3 border-b border-white/10 last:border-none last:pb-0"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 font-mono text-xs text-[#A1A1AA]">
                    <span className="text-[#71717A]">DOCUMENTED ARTIFACTS: </span>
                    <span className="text-[#F4F4F5]">
                      {entry.artifactsAndOutcomes.join(' · ')}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 11 — ABOUT SECTION */}
      <section
        id="about"
        className="py-20 sm:py-28 border-t border-white/10 px-4 sm:px-6 max-w-[1240px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
              05 · ENGINEERING PHILOSOPHY &amp; BACKGROUND
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF] leading-[1.15]">
              <span
                data-nanobot-keyword="Curiosity is the starting point."
                data-nanobot-priority="3"
                className="inline-block"
              >
                Curiosity is the starting point.
              </span>{' '}
              <span
                data-nanobot-keyword="Engineering is the process."
                data-nanobot-priority="3"
                className="inline-block"
              >
                Engineering is the process.
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base text-[#A1A1AA] leading-relaxed max-w-[64ch]">
              <p className="text-[#FFFFFF] font-medium">
                I am a{' '}
                <span
                  data-nanobot-keyword="B.Tech Data Science student"
                  data-nanobot-priority="2"
                  className="inline-block"
                >
                  B.Tech Data Science student
                </span>{' '}
                interested in building systems that connect intelligence with the real world.
              </p>
              <p>
                My work spans applied AI, data engineering, software development, embedded systems,
                and experimental hardware design.
              </p>
              <p>
                I enjoy understanding how things work beneath the surface — from the logic behind an
                intelligent model to the electronics and architecture that make a physical system
                operate.
              </p>
              <p>
                I approach projects as engineering problems: understand the constraints, explore
                possible solutions, implement, test, document, and improve.
              </p>
              <p className="text-[#F4F4F5]">
                I am particularly interested in the intersection of{' '}
                <span
                  data-nanobot-keyword="intelligent software and physical systems"
                  data-nanobot-priority="3"
                  className="inline-block"
                >
                  intelligent software and physical systems
                </span>
                .
              </p>
            </div>
          </div>

          {/* Engineering Method & Authentic Portrait Asset Slot */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-surface rounded-2xl p-6">
              <p className="font-mono text-xs text-[#E4E4E7] mb-4">
                THE ENGINEERING METHODOLOGY
              </p>
              <div className="space-y-4">
                {[
                  {
                    step: '01. Understand Constraints',
                    desc: 'Identify schema limits, pin budgets, power rails, or retrieval bottlenecks before writing code.'
                  },
                  {
                    step: '02. Explore & Architect',
                    desc: 'Decompose complex goals into verifiable stages—whether a 7-stage data pipeline or a multilayer PCB stack-up.'
                  },
                  {
                    step: '03. Implement & Validate',
                    desc: 'Test against real datasets (like 25,003 chiller telemetry rows) or CAD design rules without fabricating metrics.'
                  },
                  {
                    step: '04. Document Transparently',
                    desc: 'Clearly separate verified results from design targets and ongoing validation.'
                  }
                ].map((item) => (
                  <div
                    key={item.step}
                    className="pb-3.5 border-b border-white/10 last:border-none last:pb-0"
                  >
                    <p className="text-sm font-semibold text-[#FFFFFF]">
                      <span
                        data-nanobot-keyword={item.step}
                        data-nanobot-priority="2"
                        className="inline-block"
                      >
                        {item.step}
                      </span>
                    </p>
                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/15 font-mono text-xs text-[#71717A]">
              <span className="text-[#FFFFFF]">PORTRAIT ASSET SLOT: </span>
              Reserved for an authentic photograph of Hari Nandan K. Per portfolio integrity rules,
              no synthetic or AI-generated portrait is substituted.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — RESEARCH & ENGINEERING NOTES */}
      <section
        id="notes"
        className="py-20 sm:py-28 border-t border-white/10 px-4 sm:px-6 max-w-[1240px] mx-auto"
      >
        <div className="max-w-[68ch] mb-12">
          <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-3">
            06 · TECHNICAL DISPATCHES
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#FFFFFF]">
            <span
              data-nanobot-keyword="Notes from the Engineering Process."
              data-nanobot-priority="3"
              className="inline-block"
            >
              Notes from the Engineering Process.
            </span>
          </h2>
          <p className="text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Architectural trade-offs, verification discipline, and debugging notes drawn directly
            from actual project documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Selectable Engineering Notes List */}
          <div className="lg:col-span-5 space-y-3">
            {ENGINEERING_NOTES.map((note) => {
              const isSelected = note.id === activeNote.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all focus-visible:outline-2 focus-visible:outline-[#FFFFFF] ${
                    isSelected
                      ? 'glass-surface border-white/40 bg-white/[0.08]'
                      : 'bg-[#0A0A0A] border border-white/15 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-[#A1A1AA] mb-2">
                    <span
                      data-nanobot-keyword={`${note.number} · ${note.category}`}
                      data-nanobot-priority="2"
                      className="text-[#FFFFFF] inline-block"
                    >
                      {note.number}
                    </span>
                    <span>
                      {note.category} · {note.readTime}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#FFFFFF] leading-snug">
                    {note.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-2">{note.summary}</p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Editorial Note Reader */}
          <article className="lg:col-span-7 glass-surface rounded-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-white/10 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#E4E4E7]">
                <BookOpen className="w-4 h-4" />
                <span
                  data-nanobot-keyword={`${activeNote.number} · ${activeNote.category}`}
                  data-nanobot-priority="3"
                  className="inline-block"
                >
                  {activeNote.number} · {activeNote.category}
                </span>
              </div>
              <span className="text-[#71717A]">{activeNote.readTime}</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFFFFF] leading-tight">
              {activeNote.title}
            </h3>

            <p className="text-sm sm:text-base text-[#F4F4F5] font-medium mt-4 leading-relaxed">
              {activeNote.summary}
            </p>

            <div className="mt-6">
              <h4 className="font-mono text-xs text-[#E4E4E7] mb-2">
                ENGINEERING PROBLEM &amp; CONTEXT
              </h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{activeNote.problemContext}</p>
            </div>

            <div className="mt-6">
              <h4 className="font-mono text-xs text-[#E4E4E7] mb-3">
                KEY ARCHITECTURAL FINDINGS
              </h4>
              <ul className="space-y-2.5 text-sm text-[#A1A1AA]">
                {activeNote.keyFindings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="pb-2.5 border-b border-white/10 last:border-none last:pb-0"
                  >
                    <span className="font-mono text-xs text-[#FFFFFF] mr-2">0{idx + 1}.</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="font-mono text-xs text-[#71717A] mb-2">{activeNote.codeOrSpecTitle}</p>
              <pre className="p-4 rounded-xl bg-[#000000] border border-white/15 font-mono text-xs text-[#F4F4F5] overflow-x-auto leading-relaxed">
                <code>{activeNote.codeOrSpecBlock}</code>
              </pre>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#A1A1AA] italic max-w-[56ch]">
                Takeaway: &ldquo;{activeNote.takeaway}&rdquo;
              </p>

              <a
                href={`/projects/${activeNote.relatedProjectSlug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/projects/${activeNote.relatedProjectSlug}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E4E4E7] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Inspect {activeNote.relatedProjectTitle} Case Study</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};
