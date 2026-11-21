import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ArrowUpRight, X, Sparkles, Code2, Cpu } from 'lucide-react';

interface StudentProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProjectModal: React.FC<StudentProjectModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll and set data-modal-open attribute to suppress nanobots
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-modal-open');
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150]"
              aria-hidden="true"
            />

            {/* Modal / Bottom Sheet Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-modal-title"
              initial={
                isMobile
                  ? { y: '100%', opacity: 0.5 }
                  : { scale: 0.94, opacity: 0, y: 16 }
              }
              animate={
                isMobile
                  ? { y: 0, opacity: 1 }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              exit={
                isMobile
                  ? { y: '100%', opacity: 0 }
                  : { scale: 0.94, opacity: 0, y: 16 }
              }
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-[160] w-full sm:max-w-lg bg-[#08090E] border border-white/15 rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Mobile swipe / grab indicator */}
              <div className="sm:hidden w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-5" />

              {/* Header: Tag & Dismiss Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>STUDENT DEV LAB · MENTORSHIP</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Core Pitch */}
              <div className="mt-4">
                <h3
                  id="student-modal-title"
                  className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#FFFFFF] leading-snug"
                >
                  Are you a student looking for project development?
                </h3>
                <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed mt-3">
                  Whether you need assistance with your final year capstone, mini-project, research prototype,
                  or hackathon MVP, I provide 1-on-1 architecture design, implementation mentorship, and
                  hands-on engineering support to bring your ideas to life.
                </p>
              </div>

              {/* Project Domain Capabilities */}
              <div className="mt-5 space-y-2.5">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">Applied AI &amp; Generative Systems</p>
                    <p className="text-xs text-[#71717A] mt-0.5">Custom RAG pipelines, fine-tuning, computer vision, and local LLM routing.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">Full-Stack Web &amp; Automation</p>
                    <p className="text-xs text-[#71717A] mt-0.5">FastAPI, React, TypeScript, database modeling, and automated workflows.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#FFFFFF]">Embedded &amp; Hardware Telemetry</p>
                    <p className="text-xs text-[#71717A] mt-0.5">ESP32 IoT sensor nodes, KiCad PCB layout studies, and FPGA HDL logic.</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <a
                  href="https://build-with-hari.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#000000] bg-[#FFFFFF] hover:bg-[#E4E4E7] transition-all shadow-lg group cursor-pointer"
                >
                  <span>Explore Build With Hari</span>
                  <ArrowUpRight className="w-4 h-4 text-[#000000] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-mono text-[#71717A] hover:text-[#E4E4E7] transition-colors text-center cursor-pointer"
                >
                  Continue to Portfolio
                </button>
              </div>
            </motion.div>
          </div>
      )}
        </AnimatePresence>
      );
};

