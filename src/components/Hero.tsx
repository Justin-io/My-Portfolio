import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Cpu,
  Compass,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Sliders
} from 'lucide-react';
import { OWNER_CONTACT_INFO } from '../data/experienceAndNotes';

interface HeroProps {
  onNavigate: (path: string, sectionId?: string) => void;
}

interface PhysicsDustParticle {
  id: string;
  kind: 'plume' | 'grit' | 'streak';
  originX: number;
  originY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  size: number;
  endScale: number;
  delay: number;
  duration: number;
  blur: number;
  rotate: number;
  color: string;
}

const TYPED_INTRO_ROLE = 'Applied AI & Systems Engineer.';

/*
 * 25-SAMPLE PARAMETRIC OVAL DRIFT TRAJECTORY WITH APPLIED SLIP-ANGLE & FRICTION PHYSICS
 * - Starts after "Nandan" finishes (delay: 3.75s, duration: 3.35s -> docks at 7.10s)
 * - Launches from far top-left corner (-620, -340)
 * - Enters a wide horizontal oval drift loop (width ~410px, height ~156px, centered at cx=96, cy=14)
 * - Angular velocity decelerates through the high-friction outer right apex & bottom skid arc
 * - Settles with counter-steer damping onto baseline (0, 0) beside "Hari Nandan"
 */
const K_DRIFT_KEYFRAMES = {
  times: [
    0.0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54,
    0.60, 0.66, 0.72, 0.77, 0.82, 0.86, 0.90, 0.94, 0.97, 1.0
  ],
  x: [
    -620, -450, -280, -110, 45, 165, 245, 282, 274, 228,
    154, 68, -14, -74, -98, -82, -42, 12, -3, 0
  ],
  y: [
    -340, -248, -162, -96, -58, -42, -14, 24, 62, 86,
    92, 80, 54, 20, -14, -34, -22, 6, -2, 0
  ],
  scale: [
    0.34, 0.48, 0.64, 0.82, 0.98, 1.12, 1.24, 1.30, 1.26, 1.20,
    1.15, 1.10, 1.07, 1.05, 1.04, 1.03, 1.02, 1.01, 1.0, 1.0
  ],
  // Slip-angle banking rotation (chassis leads velocity vector during oval drift, then counter-steers)
  rotate: [
    -32, -26, -18, -8, 6, 18, 28, 24, 12, -6,
    -18, -24, -20, -12, 4, 14, 8, -4, 1, 0
  ],
  opacity: [
    0.0, 0.28, 0.54, 0.78, 0.92, 0.98, 1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
  ],
  filter: [
    'blur(12px)', 'blur(7px)', 'blur(4px)', 'blur(2px)', 'blur(0.8px)',
    'blur(0.3px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)',
    'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)',
    'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'
  ]
};

/*
 * APPLIED-PHYSICS DRIFT DUST, VOLUMETRIC SMOKE PLUMES & TANGENTIAL GRIT PARTICLES
 * Emitted along the wide oval drift trajectory as "K." carves through the curve (t = 4.65s .. 7.05s)
 */
const PHYSICS_DUST_PARTICLES: PhysicsDustParticle[] = [
  // Zone 1: Upper-Right Oval Entry & High-Speed Braking (x: 45..245, y: -58..-14)
  { id: 'p1', kind: 'plume', originX: 85, originY: -48, midX: 128, midY: -78, endX: 158, endY: -96, size: 12, endScale: 2.6, delay: 4.62, duration: 1.05, blur: 5, rotate: 15, color: '#A1A1AA' },
  { id: 'p2', kind: 'grit', originX: 135, originY: -44, midX: 185, midY: -68, endX: 215, endY: -74, size: 3, endScale: 0.9, delay: 4.72, duration: 0.72, blur: 0, rotate: 0, color: '#FFFFFF' },
  { id: 'p3', kind: 'plume', originX: 195, originY: -32, midX: 252, midY: -54, endX: 288, endY: -66, size: 15, endScale: 2.9, delay: 4.82, duration: 1.15, blur: 6, rotate: 28, color: '#E4E4E7' },
  { id: 'p4', kind: 'streak', originX: 225, originY: -22, midX: 284, midY: -36, endX: 318, endY: -42, size: 4, endScale: 1.4, delay: 4.90, duration: 0.68, blur: 0.5, rotate: 22, color: '#FFFFFF' },

  // Zone 2: Outer-Right Oval Apex (Maximum Lateral G-Force & Tire/Thruster Smoke Billow, x: 245..282, y: -14..62)
  { id: 'p5', kind: 'plume', originX: 268, originY: 4, midX: 334, midY: -6, endX: 378, endY: -12, size: 18, endScale: 3.2, delay: 5.02, duration: 1.25, blur: 7, rotate: 40, color: '#E4E4E7' },
  { id: 'p6', kind: 'grit', originX: 280, originY: 18, midX: 348, midY: 24, endX: 392, endY: 34, size: 3.5, endScale: 0.8, delay: 5.08, duration: 0.78, blur: 0, rotate: 0, color: '#FFFFFF' },
  { id: 'p7', kind: 'plume', originX: 282, originY: 32, midX: 346, midY: 52, endX: 386, endY: 68, size: 20, endScale: 3.4, delay: 5.15, duration: 1.3, blur: 8, rotate: 55, color: '#A1A1AA' },
  { id: 'p8', kind: 'grit', originX: 276, originY: 48, midX: 338, midY: 76, endX: 374, endY: 98, size: 2.5, endScale: 0.9, delay: 5.22, duration: 0.74, blur: 0, rotate: 0, color: '#FFFFFF' },
  { id: 'p9', kind: 'plume', originX: 266, originY: 58, midX: 322, midY: 92, endX: 358, endY: 118, size: 16, endScale: 3.0, delay: 5.28, duration: 1.2, blur: 6.5, rotate: 68, color: '#E4E4E7' },

  // Zone 3: Bottom Oval Sweeping Skid Arc (x: 228..68, y: 80..92)
  { id: 'p10', kind: 'plume', originX: 234, originY: 82, midX: 278, midY: 124, endX: 306, endY: 152, size: 17, endScale: 3.1, delay: 5.40, duration: 1.22, blur: 7, rotate: 82, color: '#A1A1AA' },
  { id: 'p11', kind: 'grit', originX: 202, originY: 88, midX: 236, midY: 132, endX: 256, endY: 162, size: 3, endScale: 0.85, delay: 5.48, duration: 0.76, blur: 0, rotate: 0, color: '#FFFFFF' },
  { id: 'p12', kind: 'plume', originX: 164, originY: 92, midX: 184, midY: 138, endX: 196, endY: 168, size: 18, endScale: 3.2, delay: 5.56, duration: 1.25, blur: 7.5, rotate: 95, color: '#E4E4E7' },
  { id: 'p13', kind: 'streak', originX: 124, originY: 88, midX: 128, midY: 134, endX: 130, endY: 162, size: 4, endScale: 1.3, delay: 5.66, duration: 0.72, blur: 0.5, rotate: 105, color: '#FFFFFF' },
  { id: 'p14', kind: 'plume', originX: 82, originY: 82, midX: 68, midY: 126, endX: 54, endY: 154, size: 15, endScale: 2.8, delay: 5.76, duration: 1.15, blur: 6, rotate: 118, color: '#A1A1AA' },
  { id: 'p15', kind: 'grit', originX: 42, originY: 70, midX: 18, midY: 112, endX: 2, endY: 138, size: 3, endScale: 0.9, delay: 5.86, duration: 0.7, blur: 0, rotate: 0, color: '#FFFFFF' },

  // Zone 4: Inner-Left Oval Hairpin Turn & Counter-Steer Recovery (x: -14..-98, y: 54..-34)
  { id: 'p16', kind: 'plume', originX: -12, originY: 54, midX: -48, midY: 84, endX: -74, endY: 106, size: 14, endScale: 2.7, delay: 5.98, duration: 1.1, blur: 5.5, rotate: 140, color: '#E4E4E7' },
  { id: 'p17', kind: 'grit', originX: -54, originY: 32, midX: -98, midY: 52, endX: -128, endY: 66, size: 2.5, endScale: 0.85, delay: 6.12, duration: 0.68, blur: 0, rotate: 0, color: '#FFFFFF' },
  { id: 'p18', kind: 'plume', originX: -88, originY: -4, midX: -138, midY: -12, endX: -172, endY: -16, size: 15, endScale: 2.8, delay: 6.26, duration: 1.08, blur: 6, rotate: 175, color: '#A1A1AA' },
  { id: 'p19', kind: 'plume', originX: -76, originY: -28, midX: -116, midY: -58, endX: -144, endY: -78, size: 12, endScale: 2.4, delay: 6.42, duration: 0.98, blur: 5, rotate: 205, color: '#E4E4E7' },
  { id: 'p20', kind: 'grit', originX: -36, originY: -20, midX: -62, midY: -48, endX: -78, endY: -64, size: 3, endScale: 0.8, delay: 6.58, duration: 0.64, blur: 0, rotate: 0, color: '#FFFFFF' },

  // Zone 5: Final Baseline Docking Lock-In Puff (x: 12..0, y: 6..0)
  { id: 'p21', kind: 'plume', originX: 8, originY: 6, midX: 34, midY: 22, endX: 52, endY: 34, size: 10, endScale: 2.2, delay: 6.82, duration: 0.85, blur: 4, rotate: 0, color: '#E4E4E7' },
  { id: 'p22', kind: 'grit', originX: 2, originY: 4, midX: -22, midY: 18, endX: -36, endY: 28, size: 2.5, endScale: 0.8, delay: 6.92, duration: 0.58, blur: 0, rotate: 0, color: '#FFFFFF' }
];

export interface HeroSlide {
  id: string;
  url: string;
  title: string;
  shortLabel: string;
  badge: string;
  category: string;
  caption: string;
  orbitMetadata: string;
  detailedSummary: string;
  telemetryEvidence: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'workstation',
    url: '/assets/img/me.webp',
    title: 'Hari Nandan K. — Applied AI & Systems Engineer',
    shortLabel: '01 · Profile',
    badge: 'LEAD ENGINEER',
    category: 'Engineering Profile',
    caption: 'Formal engineering profile — B.Tech Data Science student exploring applied AI, telemetry, and embedded hardware.',
    orbitMetadata: 'B.Tech Data Science · Kerala, India',
    detailedSummary: 'Lead engineer focusing on deterministic multi-stage LLM evaluation, industrial telemetry analytics, and physical edge computing.',
    telemetryEvidence: 'Autonomous AI Data Scientist · V.O.I.D.E. Telemetry · ORION-X R1'
  },
  {
    id: 'engineering-expo',
    url: '/assets/img/expo.webp',
    title: 'Engineering Project Expo & Demonstrations',
    shortLabel: '02 · Expo 2024',
    badge: 'EXPO 2024',
    category: 'Field Exhibition',
    caption: 'Demonstrating hardware prototypes and telemetry software at state-level engineering exhibitions.',
    orbitMetadata: 'Live Demonstrator · Sensor Testbench',
    detailedSummary: 'Interactive demonstration of industrial telemetry monitoring and edge intelligence prototypes before academic and industry evaluators.',
    telemetryEvidence: 'State-level Innovation Demonstrations · Physical Sensor Testbenches'
  },
  {
    id: 'ideathon-presentation',
    url: '/assets/img/ideathon.webp',
    title: 'Ideathon & Technical Strategy Briefing',
    shortLabel: '03 · Ideathon',
    badge: 'IDEATHON',
    category: 'Architecture Defense',
    caption: 'Presenting operational intelligence architectures, defensive telemetry, and edge computing models.',
    orbitMetadata: 'Strategy Defense · Architecture Review',
    detailedSummary: 'Presenting bounded autonomous reasoning workflows, privacy boundaries, and regularized regression benchmarks to engineering panels.',
    telemetryEvidence: 'V.O.I.D.E. 25,003-Record Dataset · Autonomous Workflow Defense'
  },
  {
    id: 'obsidian-monolith',
    url: '/src/assets/images/hero_obsidian_glass_system_1795162935558.jpg',
    title: 'Deep Space Astrometric Monolith',
    shortLabel: '04 · Obsidian',
    badge: 'OBSIDIAN CORE',
    category: 'Interface Architecture',
    caption: 'Obsidian liquid-glass interface design study — high-contrast monochrome aesthetic for telemetry systems.',
    orbitMetadata: 'Design System · High-Contrast Monochrome',
    detailedSummary: 'Minimalist astrometric interface language crafted with optical glass surfaces, pure monochrome hierarchies, and zero distracting gradients.',
    telemetryEvidence: 'Obsidian Glass System Architecture · Typographic Hierarchy'
  },
  {
    id: 'orion-fpga',
    url: '/src/assets/images/orion_x_fpga_cad_render_1795162936048.jpg',
    title: 'ORION-X R1 — PCIe FPGA Accelerator',
    shortLabel: '05 · FPGA CAD',
    badge: 'FPGA ACCELERATOR',
    category: 'Hardware Design Study',
    caption: 'Kintex-7 XC7K160T hardware architecture schematic and 3D CAD visualization.',
    orbitMetadata: 'XC7K160T · PCIe Gen2 x4 · 10-Layer Stack',
    detailedSummary: 'High-density Kintex-7 FPGA accelerator design study featuring dual 32-bit DDR3L SDRAM channels and impedance-controlled PCIe routing.',
    telemetryEvidence: 'KiCad Hardware Design Study · PCB Schematic & Stack-Up Ledger'
  }
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 52, y: 48 });
  const [typedLength, setTypedLength] = useState(0);

  // Slideshow and Lightbox State
  const [currentSlide, setCurrentSlide] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const s = parseInt(new URLSearchParams(window.location.search).get('slide') || '0', 10);
    return !isNaN(s) && s >= 0 && s < HERO_SLIDES.length ? s : 0;
  });
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('gallery') === 'open';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const openSlideshow = (index?: number) => {
    if (typeof index === 'number') {
      setCurrentSlide(index);
    }
    setIsMonochrome(false); // Display in full natural color when tapped open
    setIsSlideshowOpen(true);
  };

  // Auto-scroll / Auto-advance interval (3.5s in preview, 4.5s in modal when autoplay is active)
  useEffect(() => {
    if (isHovered && !isSlideshowOpen) return;
    if (isSlideshowOpen && !isAutoplay) return;

    const intervalTime = isSlideshowOpen ? 4500 : 3500;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, intervalTime);

    return () => window.clearInterval(timer);
  }, [isHovered, isSlideshowOpen, isAutoplay]);

  // Keyboard navigation for fullscreen slideshow modal
  useEffect(() => {
    if (!isSlideshowOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSlideshowOpen(false);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoplay((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideshowOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    setTouchStartX(null);
  };

  // Smooth character-by-character typing animation for "Applied AI & Systems Engineer."
  useEffect(() => {
    setTypedLength(0);
    let intervalId: number | undefined;

    // Begin typing right as "K." finishes its long oval drift and locks beside "Hari Nandan" (~6.95s)
    const startTimeout = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setTypedLength((prev) => {
          if (prev >= TYPED_INTRO_ROLE.length) {
            if (intervalId !== undefined) window.clearInterval(intervalId);
            return TYPED_INTRO_ROLE.length;
          }
          return prev + 1;
        });
      }, 28);
    }, 6950);

    return () => {
      window.clearTimeout(startTimeout);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPointerPos({ x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) });
  };

  return (
    <section
      id="hero"
      className="relative pt-28 pb-14 sm:pt-36 sm:pb-24 px-4 sm:px-6 max-w-[1240px] mx-auto"
    >
      {/* 2-Column Split Hero with items-stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: Choreographed Multi-Phase Headline Sequence, Long Oval Drift "K." with Physics Dust & Slide-Up CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-between py-1">
          <div>
            <p className="font-mono text-xs tracking-wider text-[#A1A1AA] mb-5">
              ENGINEERING · INTELLIGENCE · SPACE-GRADE SYSTEMS
            </p>

            {/*
              MULTI-PHASE CHOREOGRAPHED HEADLINE SEQUENCE:
              1. "Hi," & "I'm" arrive at the combined display scale of both the greeting and name (outer wrapper starts at scale: 2.15, y: 54).
              2. Phase 3 (delay: 1.55s, duration: 1.05s): Both "Hi," and "I'm" smoothly shrink and glide upward together (scale: 2.15 -> 1.0, y: 54 -> 0) into their original intro row size.
              3. Phase 4 (delay: 2.30s & 2.70s): "Hari" and "Nandan" glide upward with optical blur clearance to form "Hari Nandan" (completing at ~3.55s).
              4. Phase 5 (delay: 3.75s, duration: 3.35s): After a deliberate beat following "Nandan", "K." launches from the far top-left corner (-620, -340), sweeps into a long, wide 20-stage oval drift loop with realistic slip-angle rotation, dual-track oval skid wake, and volumetric dust/grit physics plumes before counter-steering onto the baseline beside "Hari Nandan".
              5. Phase 6 (delay: 6.95s): "Applied AI & Systems Engineer." types in character-by-character under the name.
            */}
            <div className="mb-6 relative">
              {/* Phase 3 Wrapper: Starts at the combined size of greeting + name (scale: 2.15, y: 54), then transitions to original size (scale: 1.0, y: 0) */}
              <motion.div
                initial={{ y: 54, scale: 2.15 }}
                animate={{ y: 0, scale: 1.0 }}
                transition={{
                  delay: 1.55,
                  duration: 1.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-flex items-baseline gap-3.5 mb-3.5 origin-top-left will-change-transform"
              >
                {/* Phase 1: "Hi," Arrives First & Prominent */}
                <motion.span
                  initial={{ scale: 1.45, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ scale: 1.0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="inline-block px-4 py-1.5 rounded-xl liquid-pill-action font-display font-bold text-xl sm:text-2xl lg:text-[1.75rem] text-[#000000] tracking-tight"
                >
                  Hi,
                </motion.span>

                {/* Phase 2: "I'm" Joins Smoothly at Combined Scale */}
                <motion.span
                  initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: 0.72,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="font-display text-xl sm:text-2xl lg:text-[1.75rem] font-medium text-[#E4E4E7] tracking-tight"
                >
                  I&apos;m
                </motion.span>
              </motion.div>

              {/* Main H1 with "Hari Nandan" Lock-In and Long Parametric Oval Drift "K." + Physics Dust System */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-tight text-[#FFFFFF] leading-[1.05]">
                <span className="inline-flex flex-wrap items-baseline gap-x-4 gap-y-1 relative">
                  {/* "Hari" Appears */}
                  <motion.span
                    initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 2.3,
                      duration: 0.85,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="inline-block text-[#FFFFFF]"
                  >
                    Hari
                  </motion.span>

                  {/* "Nandan" Follows */}
                  <motion.span
                    initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 2.7,
                      duration: 0.85,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="inline-block text-[#FFFFFF]"
                  >
                    Nandan
                  </motion.span>

                  {/* Anchor Wrapper for "K." + Applied-Physics Dust & Smoke Plumes */}
                  <span className="relative inline-block">
                    {/* Physics-Driven Volumetric Dust Plumes & Tangential Grit Particles */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
                    >
                      {PHYSICS_DUST_PARTICLES.map((p) => (
                        <motion.span
                          key={p.id}
                          initial={{
                            opacity: 0,
                            x: p.originX,
                            y: p.originY,
                            scale: 0.2,
                            rotate: p.rotate
                          }}
                          animate={{
                            opacity: [0, 0.85, 0.45, 0],
                            x: [p.originX, p.midX, p.endX],
                            y: [p.originY, p.midY, p.endY],
                            scale: [0.2, p.endScale * 0.65, p.endScale],
                            rotate: [p.rotate, p.rotate + 24, p.rotate + 48]
                          }}
                          transition={{
                            delay: p.delay,
                            duration: p.duration,
                            times: [0, 0.38, 1],
                            ease: [0.12, 0.8, 0.24, 1]
                          }}
                          style={{
                            width: p.kind === 'streak' ? `${p.size * 3.2}px` : `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined
                          }}
                          className="absolute rounded-full will-change-transform"
                        />
                      ))}
                    </span>

                    {/* "K." 20-Sample Long Parametric Oval Drift with Slip-Angle Physics */}
                    <motion.span
                      initial={{
                        opacity: 0,
                        x: -620,
                        y: -340,
                        scale: 0.34,
                        rotate: -32,
                        filter: 'blur(12px)'
                      }}
                      animate={{
                        opacity: K_DRIFT_KEYFRAMES.opacity,
                        x: K_DRIFT_KEYFRAMES.x,
                        y: K_DRIFT_KEYFRAMES.y,
                        scale: K_DRIFT_KEYFRAMES.scale,
                        rotate: K_DRIFT_KEYFRAMES.rotate,
                        filter: K_DRIFT_KEYFRAMES.filter
                      }}
                      transition={{
                        delay: 3.75,
                        duration: 3.35,
                        times: K_DRIFT_KEYFRAMES.times,
                        ease: 'linear'
                      }}
                      className="relative z-10 inline-block text-[#E4E4E7] will-change-transform"
                    >
                      K.
                    </motion.span>
                  </span>
                </span>

                {/* Typing Animation Line Under Name: "Applied AI & Systems Engineer." */}
                <span
                  aria-label={TYPED_INTRO_ROLE}
                  className="block text-[#A1A1AA] font-normal mt-3 text-2xl sm:text-3xl lg:text-[2.3rem] leading-[1.15] min-h-[1.25em]"
                >
                  <span>{TYPED_INTRO_ROLE.slice(0, typedLength)}</span>
                  <span className="typing-cursor" aria-hidden="true" />
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-[#F4F4F5] font-medium leading-relaxed max-w-[58ch] mt-5">
              I build{' '}
              <span
                data-nanobot-keyword="intelligent systems"
                data-nanobot-priority="3"
                className="text-[#FFFFFF] inline-block"
              >
                intelligent systems
              </span>{' '}
              across{' '}
              <span
                data-nanobot-keyword="software, data, and hardware"
                data-nanobot-priority="3"
                className="text-[#FFFFFF] inline-block"
              >
                software, data, and hardware
              </span>
              .
            </p>

            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-[62ch] mt-3.5">
              I explore the intersection of{' '}
              <span
                data-nanobot-keyword="applied AI"
                data-nanobot-priority="2"
                className="text-[#E4E4E7] inline-block"
              >
                applied AI
              </span>
              ,{' '}
              <span
                data-nanobot-keyword="data engineering"
                data-nanobot-priority="2"
                className="text-[#E4E4E7] inline-block"
              >
                data engineering
              </span>
              ,{' '}
              <span
                data-nanobot-keyword="intelligent automation"
                data-nanobot-priority="2"
                className="text-[#E4E4E7] inline-block"
              >
                intelligent automation
              </span>
              , and{' '}
              <span
                data-nanobot-keyword="hardware systems"
                data-nanobot-priority="2"
                className="text-[#E4E4E7] inline-block"
              >
                hardware systems
              </span>{' '}
              — turning complex technical ideas into practical engineering projects.
            </p>
          </div>

          {/* CTA Action Row with Slide-Up-From-Bottom Entrance Animations */}
          <div className="mt-9 pt-6 border-t border-white/15 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <motion.a
                href="/#work"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/', 'work');
                }}
                initial={{ opacity: 0, y: 44, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 0.95,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1]
                }}
                data-nanobot-keyword="Explore My Work"
                data-nanobot-priority="2"
                className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3.5 rounded-xl liquid-pill-action text-sm font-semibold whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
              >
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/contact', 'contact');
                }}
                initial={{ opacity: 0, y: 44, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 1.15,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3.5 rounded-xl glass-interactive text-[#FFFFFF] text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
              >
                <span>Get in Touch</span>
              </motion.a>

              <motion.a
                href="/projects"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/projects');
                }}
                initial={{ opacity: 0, y: 36, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 1.32,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
              >
                <span>All 5 Case Studies</span>
              </motion.a>

              {OWNER_CONTACT_INFO.resumeAvailable && (
                <motion.a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.45,
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>View Resume</span>
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pure Black & White Space Astrometric Liquid-Glass Monolith */}
        <div className="lg:col-span-5 flex flex-col">
          <div
            onMouseMove={handleMouseMove}
            className="glass-surface rounded-2xl p-4 sm:p-6 h-full flex flex-col justify-between relative overflow-hidden cursor-crosshair"
          >
            {/* Top Dossier Header */}
            <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-mono text-[#A1A1AA] pb-3.5 border-b border-white/15">
              <span className="inline-flex items-center gap-1.5 text-[#FFFFFF]">
                <Compass className="w-3.5 h-3.5 text-[#E4E4E7]" />
                <span>ENGINEERING VISUAL DOSSIER · ARCHIVAL EVIDENCE</span>
              </span>
              <span className="text-[#E4E4E7] tabular-nums">
                RECORD 0{currentSlide + 1} / 0{HERO_SLIDES.length} · {isHovered ? 'PAUSED' : 'LIVE 3.5s'}
              </span>
            </div>

            {/* Central Deep-Space Astrometric Viewport (Auto-Scrolling Slideshow Preview) */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => openSlideshow()}
              className="relative z-10 my-3 rounded-xl overflow-hidden border border-white/20 bg-[#000000] aspect-4/3 cursor-pointer group select-none shadow-2xl"
              role="button"
              tabIndex={0}
              aria-label="Click to open full photo slideshow"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSlideshow();
                }
              }}
            >
              {/* Image with AnimatePresence for smooth crossfade/scale */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={HERO_SLIDES[currentSlide].id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  {!imageErrors[HERO_SLIDES[currentSlide].id] ? (
                    <img
                      src={HERO_SLIDES[currentSlide].url}
                      alt={HERO_SLIDES[currentSlide].title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [HERO_SLIDES[currentSlide].id]: true
                        }))
                      }
                      className="w-full h-full object-cover grayscale contrast-115 brightness-95 opacity-70 group-hover:opacity-90 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0A0A0A] flex items-center justify-center">
                      <Cpu className="w-12 h-12 text-[#71717A]" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Monochrome contrast scrim */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[#000000]/40 group-hover:bg-[#000000]/25 transition-colors pointer-events-none"
              />

              {/* Astrometric Telemetry SVG overlay */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.24)"
                  strokeWidth="0.35"
                  strokeDasharray="2 1.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  fill="none"
                  stroke="rgba(228, 228, 231, 0.28)"
                  strokeWidth="0.35"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="42"
                  ry="18"
                  transform="rotate(-24 50 50)"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="0.35"
                />
              </svg>

              {/* Top-Right Tap-to-Expand Indicator */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#E4E4E7] shadow-lg group-hover:border-white/60 group-hover:text-white transition-all">
                <Maximize2 className="w-3 h-3 text-[#E4E4E7] group-hover:scale-110 transition-transform" />
                <span>TAP TO EXPAND</span>
              </div>

              {/* Top-Left Slide Index Indicator */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#E4E4E7]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tabular-nums">
                  0{currentSlide + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              {/* Prev / Next Chevrons on Hover */}
              <div className="absolute inset-y-0 left-0 flex items-center px-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                  }}
                  className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white/60 transition-all cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
                  }}
                  className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white/60 transition-all cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom HUD Caption Bar */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-2.5 sm:p-3 bg-gradient-to-t from-black/95 via-black/85 to-transparent backdrop-blur-sm border-t border-white/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[9px] uppercase tracking-wider text-white font-semibold shrink-0">
                      {HERO_SLIDES[currentSlide].badge}
                    </span>
                    <h4 className="text-xs font-semibold text-white tracking-tight truncate">
                      {HERO_SLIDES[currentSlide].title}
                    </h4>
                  </div>
                  {/* Miniature dot track */}
                  <div className="flex items-center gap-1 shrink-0">
                    {HERO_SLIDES.map((_, idx) => (
                      <span
                        key={idx}
                        className={`block h-1 rounded-full transition-all duration-300 ${
                          idx === currentSlide ? 'w-3 bg-white' : 'w-1 bg-white/25'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#A1A1AA] line-clamp-1 leading-snug font-sans">
                  {HERO_SLIDES[currentSlide].caption}
                </p>
              </div>
            </div>

            {/* Visual Record Selector Pills */}
            <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none my-2.5">
              {HERO_SLIDES.map((slide, idx) => {
                const isSelected = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-white text-black font-semibold border-white shadow-sm scale-102'
                        : 'bg-white/5 text-[#A1A1AA] hover:text-white border-white/10 hover:border-white/30'
                    }`}
                  >
                    {slide.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Active Record Readout Footer */}
            <div className="relative z-10 pt-2.5 border-t border-white/15">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-1">
                <span className="text-[#FFFFFF] font-semibold truncate max-w-[280px]">
                  {HERO_SLIDES[currentSlide].badge} · {HERO_SLIDES[currentSlide].title}
                </span>
                <span className="text-[#A1A1AA] tabular-nums text-[11px]">
                  {HERO_SLIDES[currentSlide].orbitMetadata}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                {HERO_SLIDES[currentSlide].detailedSummary}
              </p>
              <p className="text-[11px] font-mono text-[#71717A] mt-1.5 leading-normal">
                Visual Evidence: {HERO_SLIDES[currentSlide].telemetryEvidence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Space Telemetry & Positioning Metadata Strip Below Hero Split */}
      <div className="mt-10 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="font-mono text-xs text-[#71717A]">ACADEMIC DISCIPLINE</p>
          <p className="text-sm font-medium text-[#FFFFFF] mt-1">
            <span
              data-nanobot-keyword="B.Tech — Data Science"
              data-nanobot-priority="2"
              className="inline-block"
            >
              B.Tech — Data Science
            </span>
          </p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Emerging Systems &amp; AI Engineer</p>
        </div>

        <div>
          <p className="font-mono text-xs text-[#71717A]">STATION COORDINATES</p>
          <p className="text-sm font-medium text-[#FFFFFF] mt-1">Kerala, India</p>
          <p className="text-xs text-[#A1A1AA] mt-0.5 font-mono tabular-nums">
            10.8505° N · 76.2711° E
          </p>
        </div>

        <div>
          <p className="font-mono text-xs text-[#71717A]">ENGINEERING SPECTRUM</p>
          <p className="text-sm font-medium text-[#FFFFFF] mt-1">
            <span
              data-nanobot-keyword="Software · Data · Hardware"
              data-nanobot-priority="2"
              className="inline-block"
            >
              Software · Data · Hardware
            </span>
          </p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">From LLM Evaluation to KiCad FPGA PCBs</p>
        </div>

        <div>
          <p className="font-mono text-xs text-[#71717A]">VERIFICATION TELEMETRY</p>
          <p className="text-sm font-medium text-[#FFFFFF] mt-1">
            <span
              data-nanobot-keyword="5 Flagship Case Studies"
              data-nanobot-priority="2"
              className="inline-block"
            >
              5 Flagship Case Studies
            </span>
          </p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Explicit Maturity &amp; DRC Ledgers</p>
        </div>
      </div>

      {/* Fullscreen Slideshow Lightbox Modal */}
      <AnimatePresence>
        {isSlideshowOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-[#000000]/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
                    PORTFOLIO GALLERY
                  </span>
                </div>
                <span className="font-mono text-xs text-[#71717A] hidden sm:inline">·</span>
                <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
                  0{currentSlide + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Monochrome Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMonochrome(!isMonochrome)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/15 transition-all cursor-pointer"
                  title="Toggle Natural Color / B&W Monochrome"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#E4E4E7]" />
                  <span className="hidden sm:inline">
                    {!isMonochrome ? 'Natural Color' : 'B&W Mode'}
                  </span>
                </button>

                {/* Autoplay Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/15 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  title={isAutoplay ? 'Pause auto-scroll' : 'Resume auto-scroll'}
                >
                  {isAutoplay ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-white" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-white" />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsSlideshowOpen(false)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-mono text-white border border-white/25 transition-all cursor-pointer inline-flex items-center gap-1"
                  aria-label="Close slideshow"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">ESC</span>
                </button>
              </div>
            </div>

            {/* Modal Stage (Main Image Viewport) */}
            <div className="relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden min-h-0">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                className="absolute left-2 sm:left-6 z-30 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 hover:border-white/60 backdrop-blur-md transition-all cursor-pointer shadow-xl hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Main Image with animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={HERO_SLIDES[currentSlide].id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-full max-w-full flex items-center justify-center relative p-2"
                >
                  {!imageErrors[HERO_SLIDES[currentSlide].id] ? (
                    <img
                      src={HERO_SLIDES[currentSlide].url}
                      alt={HERO_SLIDES[currentSlide].title}
                      referrerPolicy="no-referrer"
                      className={`max-h-[60vh] sm:max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/15 transition-all duration-500 ${
                        isMonochrome
                          ? 'grayscale contrast-115 brightness-95'
                          : 'contrast-100 brightness-100'
                      }`}
                    />
                  ) : (
                    <div className="w-72 h-72 rounded-xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <Cpu className="w-12 h-12" />
                      <span className="font-mono text-xs">Image unavailable</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
                }
                className="absolute right-2 sm:right-6 z-30 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 hover:border-white/60 backdrop-blur-md transition-all cursor-pointer shadow-xl hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Bottom Panel (Caption & Thumbnails) */}
            <div className="shrink-0 space-y-2.5 pt-2 border-t border-white/10">
              {/* Active Slide Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider font-semibold">
                      {HERO_SLIDES[currentSlide].badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                      {HERO_SLIDES[currentSlide].title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    {HERO_SLIDES[currentSlide].caption}
                  </p>
                </div>
                <div className="font-mono text-xs text-[#71717A] shrink-0">
                  {HERO_SLIDES[currentSlide].category}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        isActive
                          ? 'border-white scale-105 shadow-md ring-2 ring-white/50'
                          : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/40'
                      }`}
                    >
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className={`w-full h-full object-cover ${
                          isMonochrome ? 'grayscale' : ''
                        }`}
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
