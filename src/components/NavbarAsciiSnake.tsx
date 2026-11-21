import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  computeNanoBotDissolveFrame,
  computeNanoBotNavbarExitFrame,
  computeNanoBotReassembleFrame,
  computeNavbarSwarmReturnFormation,
  computeNavbarSwarmSeekFormation,
  createNanoBotSwarm,
  sampleKeywordShapePerimeter,
  selectActiveKeywordTarget,
  stepNanoBotSwarmPhysics,
  CursorState,
  KeywordTargetRect,
  NanoBotAgent,
  NanoBotLetterReassemblyState,
  NavBarContainerRect
} from '../utils/nanoBotSwarmPhysics';

export type NanoBotLifecycleStage =
  | 'waiting'
  | 'morphing'
  | 'navbar-seek'
  | 'screen-roam'
  | 'returning-home';

const SOURCE_NAME = 'Hari Nandan K.';
// Matches Hero.tsx "K." drift completion (delay 3.75s + duration 3.35s = 7.10s)
const K_LOAD_COMPLETE_MS = 7100;
const MORPH_DURATION_MS = 950;
const NAVBAR_SEEK_DURATION_MS = 2850;
const RETURN_HOME_DURATION_MS = 4100;
const CURSOR_ACTIVE_TIMEOUT_MS = 4800;

export const NavbarAsciiSnake: React.FC = () => {
  const anchorSpanRef = useRef<HTMLSpanElement | null>(null);
  const wordmarkSlotRef = useRef<HTMLSpanElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stageRef = useRef<NanoBotLifecycleStage>('waiting');
  const runCountRef = useRef<number>(0);
  const seekStartTimeRef = useRef<number>(0);
  const roamStartTimeRef = useRef<number>(0);
  const returnStartTimeRef = useRef<number>(0);
  const returnOriginRef = useRef<{ x: number; y: number }>({ x: 360, y: 240 });
  const morphIntervalRef = useRef<number | undefined>(undefined);
  const coveredKeywordsRef = useRef<Set<string>>(new Set());

  const [stage, setStage] = useState<NanoBotLifecycleStage>('waiting');
  const [inlineNanoText, setInlineNanoText] = useState<string>(SOURCE_NAME);
  const [runCount, setRunCount] = useState<number>(0);
  const [coveredCount, setCoveredCount] = useState<number>(0);
  const [reassemblyState, setReassemblyState] = useState<NanoBotLetterReassemblyState>(() =>
    computeNanoBotReassembleFrame(SOURCE_NAME, 1, 0)
  );

  const updateStage = useCallback((next: NanoBotLifecycleStage) => {
    stageRef.current = next;
    anchorSpanRef.current?.setAttribute('data-snake-stage', next);
    setStage(next);
  }, []);

  const clearMorphInterval = useCallback(() => {
    if (morphIntervalRef.current !== undefined) {
      window.clearInterval(morphIntervalRef.current);
      morphIntervalRef.current = undefined;
    }
  }, []);

  /**
   * Starts (or restarts on tap/click) the full Hydro-Droplet Nano-Bot lifecycle:
   * morphing -> navbar-seek (dramatic escape) -> screen-roam (calmly covers visible keywords) -> returning-home (letter-by-letter reassembly) -> waiting
   */
  const startNanoBotCycle = useCallback(() => {
    clearMorphInterval();

    const isAutostart =
      typeof window !== 'undefined' && window.location.search.includes('autostart=1');
    const isFastReturn =
      typeof window !== 'undefined' && window.location.search.includes('fastreturn=1');
    const morphDur = isFastReturn ? 240 : isAutostart ? 380 : MORPH_DURATION_MS;
    const seekDur = isFastReturn ? 850 : isAutostart ? 1750 : NAVBAR_SEEK_DURATION_MS;

    coveredKeywordsRef.current.clear();
    setCoveredCount(0);
    anchorSpanRef.current?.setAttribute('data-covered-count', '0');

    runCountRef.current += 1;
    setRunCount(runCountRef.current);
    anchorSpanRef.current?.setAttribute('data-run-count', String(runCountRef.current));

    updateStage('morphing');

    const morphStartTimestamp = performance.now();
    let tickCounter = 0;

    morphIntervalRef.current = window.setInterval(() => {
      tickCounter += 1;
      const now = performance.now();

      if (stageRef.current === 'morphing') {
        const elapsed = now - morphStartTimestamp;
        const progress = Math.min(1, elapsed / morphDur);
        setInlineNanoText(computeNanoBotDissolveFrame(SOURCE_NAME, progress, tickCounter));

        if (progress >= 1) {
          seekStartTimeRef.current = now;
          updateStage('navbar-seek');
        }
      } else if (stageRef.current === 'navbar-seek') {
        const seekElapsed = now - seekStartTimeRef.current;
        const exitWindow = Math.min(760, seekDur * 0.45);
        const exitProgress = Math.min(1, seekElapsed / exitWindow);
        setInlineNanoText(computeNanoBotNavbarExitFrame(exitProgress, tickCounter));

        if (seekElapsed >= seekDur) {
          setInlineNanoText('');
          roamStartTimeRef.current = now;
          updateStage('screen-roam');
          clearMorphInterval();
        }
      }
    }, 40);
  }, [clearMorphInterval, updateStage]);

  // Initial automatic launch after Hero "K." finishes its drift (or immediately on early scroll / autostart=1)
  useEffect(() => {
    const isAutostart =
      typeof window !== 'undefined' && window.location.search.includes('autostart=1');
    const initialDelay = isAutostart ? 100 : K_LOAD_COMPLETE_MS;

    const loadTimerId = window.setTimeout(() => {
      if (stageRef.current === 'waiting') {
        startNanoBotCycle();
      }
    }, initialDelay);

    const handleEarlyScroll = () => {
      if (window.scrollY > 18 && stageRef.current === 'waiting') {
        window.clearTimeout(loadTimerId);
        startNanoBotCycle();
      }
    };

    window.addEventListener('scroll', handleEarlyScroll, { passive: true });

    return () => {
      window.clearTimeout(loadTimerId);
      clearMorphInterval();
      window.removeEventListener('scroll', handleEarlyScroll);
    };
  }, [clearMorphInterval, startNanoBotCycle]);

  // Handler when the visitor taps/clicks the name ("HK · Hari Nandan K.") to start the nano-bots again
  const handleWordmarkTap = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    startNanoBotCycle();
  };

  const isCanvasMounted =
    stage === 'navbar-seek' || stage === 'screen-roam' || stage === 'returning-home';

  useEffect(() => {
    if (!isCanvasMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isAutostart =
      typeof window !== 'undefined' && window.location.search.includes('autostart=1');
    const isFastReturn =
      typeof window !== 'undefined' && window.location.search.includes('fastreturn=1');

    const seekDurationMs = isFastReturn ? 850 : isAutostart ? 1750 : NAVBAR_SEEK_DURATION_MS;
    const returnDurationMs = isFastReturn ? 1350 : isAutostart ? 2800 : RETURN_HOME_DURATION_MS;
    // Slow, unhurried 5.2s dwell cycle per element in normal viewing (4.4s in autostart, 0.45s only in fastreturn test mode)
    const keywordDwellCycleSec = isFastReturn ? 0.45 : isAutostart ? 4.4 : 5.2;

    const getWordmarkOrigin = () => {
      const rect = anchorSpanRef.current?.getBoundingClientRect();
      if (rect) {
        return { x: rect.left + Math.max(68, rect.width * 0.75), y: rect.top + rect.height * 0.5 };
      }
      return { x: 160, y: 30 };
    };

    const getWordmarkLetterSlotRect = (): NavBarContainerRect => {
      const slotEl = wordmarkSlotRef.current;
      if (slotEl) {
        const r = slotEl.getBoundingClientRect();
        if (r.width > 40 && r.height > 10) {
          return { left: r.left, top: r.top, width: r.width, height: r.height };
        }
      }
      const anchorRect = anchorSpanRef.current?.getBoundingClientRect();
      if (anchorRect) {
        return {
          left: anchorRect.left + 34,
          top: anchorRect.top,
          width: 112,
          height: Math.max(18, anchorRect.height)
        };
      }
      return { left: 130, top: 20, width: 112, height: 22 };
    };

    const getNavBarContainerRect = (): NavBarContainerRect => {
      const glassNav = anchorSpanRef.current?.closest('.glass-nav');
      if (glassNav) {
        const r = glassNav.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      }
      return {
        left: Math.max(16, (window.innerWidth - 1200) * 0.5),
        top: 16,
        width: Math.min(1200, window.innerWidth - 32),
        height: 54
      };
    };

    const initialOrigin = getWordmarkOrigin();
    // 220 Hydro-Nano-Bot Collective partitioned into 14 cohesive water-droplet packets (1 packet per letter of "Hari Nandan K.")
    let bots: NanoBotAgent[] = createNanoBotSwarm(initialOrigin.x, initialOrigin.y, 220);

    let lastFrameTime = performance.now();
    let lastScrollY = window.scrollY;
    let smoothedScrollVelocity = 0;
    let scrollSplitBlend = 0;
    let lastScrollActiveTimestamp = -99999;
    let lastScrollDirection = 1;
    let rafId = 0;
    let frameTick = 0;

    // Live cursor tracker with slow viscous fluid follow + autonomous fallback when idle
    let rawCursorX = window.innerWidth * 0.5;
    let rawCursorY = window.innerHeight * 0.36;
    let fluidCursorX = rawCursorX;
    let fluidCursorY = rawCursorY;
    let lastCursorMoveTimestamp = -99999;

    const handleMouseMove = (e: MouseEvent) => {
      rawCursorX = e.clientX;
      rawCursorY = e.clientY;
      lastCursorMoveTimestamp = performance.now();
    };

    const handleWindowScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      if (Math.abs(delta) > 0.2) {
        lastScrollDirection = delta >= 0 ? 1 : -1;
      }
      lastScrollActiveTimestamp = performance.now();
      if (stageRef.current === 'screen-roam') {
        scrollSplitBlend = Math.min(1, Math.max(scrollSplitBlend, 0.72) + 0.14);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const collectKeywordTargets = (): KeywordTargetRect[] => {
      const results: KeywordTargetRect[] = [];
      const taggedNodes = document.querySelectorAll('[data-nanobot-keyword]');
      taggedNodes.forEach((node, idx) => {
        const rect = node.getBoundingClientRect();
        if (rect.width > 12 && rect.height > 10 && rect.width < 720 && rect.height < 140) {
          const label =
            node.getAttribute('data-nanobot-keyword') ||
            (node.textContent || `KEYWORD-${idx}`).trim();
          const priorityAttr = Number(node.getAttribute('data-nanobot-priority') || '3');
          results.push({
            id: `kw-${idx}`,
            label,
            priority: priorityAttr,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          });
        }
      });
      return results;
    };

    const renderFrame = (now: number) => {
      frameTick += 1;

      // When any modal or bottom sheet is active, suppress nanobots completely
      if (typeof document !== 'undefined' && document.body.getAttribute('data-modal-open') === 'true') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const dt = Math.min(0.045, Math.max(0.004, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      const timeSec = now / 1000;

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      const rawScrollDelta = scrollDiff / Math.max(0.008, dt);
      lastScrollY = currentScrollY;
      smoothedScrollVelocity = smoothedScrollVelocity * 0.84 + rawScrollDelta * 0.16;

      if (Math.abs(scrollDiff) > 0.5 || Math.abs(smoothedScrollVelocity) > 16) {
        lastScrollActiveTimestamp = now;
        if (Math.abs(scrollDiff) > 0.2) {
          lastScrollDirection = scrollDiff >= 0 ? 1 : -1;
        }
      }

      const currentStage = stageRef.current;

      // Asymmetric Scroll-Split Envelope during screen-roam
      const timeSinceScrollStopMs = now - lastScrollActiveTimestamp;
      if (currentStage === 'screen-roam' && timeSinceScrollStopMs < 300) {
        const attackRate = 11.5;
        scrollSplitBlend = Math.min(
          1,
          scrollSplitBlend + (1 - scrollSplitBlend) * Math.min(1, attackRate * dt)
        );
      } else {
        const cinematicDecaySpeed = currentStage === 'returning-home' ? 2.2 : 0.36;
        scrollSplitBlend = Math.max(0, scrollSplitBlend - cinematicDecaySpeed * dt);
      }

      canvas.setAttribute('data-scroll-split', scrollSplitBlend.toFixed(2));
      canvas.setAttribute('data-phase', currentStage);
      canvas.setAttribute('data-bot-count', String(bots.length));

      // Viscous fluid cursor smoothing
      const cursorFollowAlpha = Math.min(1, 4.8 * dt);
      fluidCursorX += (rawCursorX - fluidCursorX) * cursorFollowAlpha;
      fluidCursorY += (rawCursorY - fluidCursorY) * cursorFollowAlpha;
      const isCursorActive = now - lastCursorMoveTimestamp < CURSOR_ACTIVE_TIMEOUT_MS;

      const cursorState: CursorState = {
        x: fluidCursorX,
        y: fluidCursorY,
        active: isCursorActive
      };

      const navBarRect = getNavBarContainerRect();
      const allTargets = collectKeywordTargets();

      let activeFormation;
      let returnProgress = 0;

      if (currentStage === 'navbar-seek') {
        const seekProgress = Math.min(1, (now - seekStartTimeRef.current) / seekDurationMs);
        activeFormation = computeNavbarSwarmSeekFormation(navBarRect, seekProgress, timeSec);
      } else if (currentStage === 'returning-home') {
        returnProgress = Math.min(1, (now - returnStartTimeRef.current) / returnDurationMs);
        const wordmarkRect = getWordmarkLetterSlotRect();
        activeFormation = computeNavbarSwarmReturnFormation(
          wordmarkRect,
          returnProgress,
          timeSec,
          returnOriginRef.current.x,
          returnOriginRef.current.y
        );

        // Update letter-by-letter DOM state as each of the 14 droplet packets docks into its character slot
        const nextReassembly = computeNanoBotReassembleFrame(
          SOURCE_NAME,
          returnProgress,
          frameTick
        );
        setReassemblyState(nextReassembly);

        if (returnProgress >= 1) {
          setInlineNanoText(SOURCE_NAME);
          updateStage('waiting');
          return;
        }
      } else {
        // Use elapsed roam time starting at 0 when screen-roam begins so element 0..N are visited sequentially for the full 4.2s each
        const roamElapsedSec = Math.max(0, (now - (roamStartTimeRef.current || now)) / 1000);
        activeFormation = selectActiveKeywordTarget(
          allTargets,
          currentScrollY,
          window.innerWidth,
          window.innerHeight,
          roamElapsedSec,
          smoothedScrollVelocity || lastScrollDirection * 0.01,
          cursorState,
          scrollSplitBlend,
          undefined,
          keywordDwellCycleSec
        );
      }

      canvas.setAttribute('data-active-keyword', activeFormation.targetLabel);

      // Step 220-Bot Hydro-Droplet Surface-Tension Swarm Physics
      bots = stepNanoBotSwarmPhysics(bots, activeFormation, dt, timeSec);

      let avgDistToSlot = 0;
      for (let i = 0; i < bots.length; i++) {
        avgDistToSlot += Math.hypot(bots[i].tx - bots[i].x, bots[i].ty - bots[i].y);
      }
      avgDistToSlot /= Math.max(1, bots.length);
      const formationLock = Math.max(0, Math.min(1, 1 - avgDistToSlot / 80));

      // Mark each element covered only after the swarm has dwelled on it through the second half of its calm cycle (transitionProgress >= 0.65)
      if (currentStage === 'screen-roam' && scrollSplitBlend < 0.25) {
        if (
          activeFormation.transitionProgress >= 0.62 &&
          !coveredKeywordsRef.current.has(activeFormation.targetLabel)
        ) {
          coveredKeywordsRef.current.add(activeFormation.targetLabel);
          setCoveredCount(coveredKeywordsRef.current.size);
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const visibleTargets = allTargets.filter(
          (t) =>
            t.top >= 68 &&
            t.top + t.height <= vh - 28 &&
            t.left >= 12 &&
            t.left + t.width <= vw - 12
        );
        const focusZoneY = currentScrollY < 60 ? vh * 0.42 : vh * 0.46;
        const rankedVisible = [...visibleTargets]
          .sort((a, b) => {
            const scoreA = Math.abs(a.top + a.height * 0.5 - focusZoneY) - a.priority * 55;
            const scoreB = Math.abs(b.top + b.height * 0.5 - focusZoneY) - b.priority * 55;
            return scoreA - scoreB;
          })
          .slice(0, Math.min(10, visibleTargets.length));

        const minRequiredToReturn = Math.max(1, Math.min(6, rankedVisible.length));
        const allVisiblePoolCovered =
          rankedVisible.length > 0 &&
          coveredKeywordsRef.current.size >= minRequiredToReturn &&
          rankedVisible.every((t) => coveredKeywordsRef.current.has(t.label));

        // Wait until the final element's full calm dwell finishes (transitionProgress >= 0.86) before returning home
        if (
          allVisiblePoolCovered &&
          activeFormation.transitionProgress >= 0.86 &&
          scrollSplitBlend < 0.12
        ) {
          returnOriginRef.current = { x: activeFormation.cx, y: activeFormation.cy };
          returnStartTimeRef.current = now;
          setReassemblyState(computeNanoBotReassembleFrame(SOURCE_NAME, 0, 0));
          updateStage('returning-home');
        }
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // 0A. CINEMATIC VIEWPORT EDGE & CORNER SPLIT FRAME GUIDES (While scrolling / merging)
      if (currentStage === 'screen-roam' && scrollSplitBlend > 0.08) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const m = 22;
        const arm = Math.min(74, Math.max(40, Math.min(vw, vh) * 0.072));
        const frameAlpha = (scrollSplitBlend * 0.22).toFixed(3);

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${frameAlpha})`;
        ctx.lineWidth = 0.9;

        const corners = [
          { x: m, y: m, sx: 1, sy: 1 },
          { x: vw - m, y: m, sx: -1, sy: 1 },
          { x: vw - m, y: vh - m, sx: -1, sy: -1 },
          { x: m, y: vh - m, sx: 1, sy: -1 }
        ];

        for (const c of corners) {
          ctx.beginPath();
          ctx.moveTo(c.x + c.sx * arm, c.y);
          ctx.lineTo(c.x, c.y);
          ctx.lineTo(c.x, c.y + c.sy * arm);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 0B. DRAMATIC NAVBAR CONTAINMENT SURGE & GLASS BREACH RUPTURE FX (Stage: 'navbar-seek')
      if (currentStage === 'navbar-seek') {
        const breachX = activeFormation.escapeBreachX ?? navBarRect.left + navBarRect.width * 0.74;
        const breachY = activeFormation.escapeBreachY ?? navBarRect.top + navBarRect.height;
        const pressure = activeFormation.escapePressure ?? 0;

        ctx.save();

        if (activeFormation.shapeMode === 'navbar-droplet-stream') {
          const railHalfSpan = 96;
          const railAlpha = (0.28 + pressure * 0.55).toFixed(3);
          ctx.strokeStyle = `rgba(255, 255, 255, ${railAlpha})`;
          ctx.lineWidth = 1.65;

          ctx.beginPath();
          ctx.moveTo(
            Math.max(navBarRect.left + 18, activeFormation.cx - railHalfSpan),
            navBarRect.top + 1
          );
          ctx.lineTo(
            Math.min(
              navBarRect.left + navBarRect.width - 18,
              activeFormation.cx + railHalfSpan * 0.75
            ),
            navBarRect.top + 1
          );
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(
            Math.max(navBarRect.left + 18, activeFormation.cx - railHalfSpan),
            breachY - 1
          );
          ctx.lineTo(
            Math.min(
              navBarRect.left + navBarRect.width - 18,
              activeFormation.cx + railHalfSpan * 0.75
            ),
            breachY - 1
          );
          ctx.stroke();
        }

        if (activeFormation.shapeMode === 'navbar-escape-breach' || pressure > 0.2) {
          const breachT =
            activeFormation.shapeMode === 'navbar-escape-breach'
              ? activeFormation.transitionProgress
              : 0;
          const bulgeWidth = 58 + pressure * 32;
          const bulgeDepth =
            breachT < 0.28
              ? (breachT / 0.28) * 20
              : Math.max(0, 20 * (1 - (breachT - 0.28) / 0.48));

          if (bulgeDepth > 0.5) {
            ctx.beginPath();
            ctx.moveTo(breachX - bulgeWidth, breachY - 0.5);
            ctx.quadraticCurveTo(
              breachX,
              breachY + bulgeDepth * 1.75,
              breachX + bulgeWidth,
              breachY - 0.5
            );
            ctx.strokeStyle = `rgba(255, 255, 255, ${(0.38 + pressure * 0.55).toFixed(3)})`;
            ctx.lineWidth = 1.85;
            ctx.stroke();
          }

          if (breachT > 0.04 && breachT < 0.94) {
            for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
              const ringPhase = Math.max(0, (breachT - 0.04 - ringIdx * 0.12) / 0.72);
              if (ringPhase > 0 && ringPhase < 1) {
                const ringRx = 18 + ringPhase * 124;
                const ringRy = 8 + ringPhase * 46;
                const ringAlpha = (1 - ringPhase) * 0.52;
                ctx.beginPath();
                ctx.ellipse(breachX, breachY + 2, ringRx, ringRy, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha.toFixed(3)})`;
                ctx.lineWidth = 1.4 - ringPhase * 0.7;
                ctx.stroke();
              }
            }

            const sparkCount = 12;
            for (let s = 0; s < sparkCount; s++) {
              const sparkPhase = (breachT * 2.2 + s * 0.11) % 1;
              if (sparkPhase < 0.82) {
                const normS = sparkPhase / 0.82;
                const spreadAngle = Math.PI * 0.16 + (s / (sparkCount - 1)) * Math.PI * 0.68;
                const sparkDist = 10 + normS * 84;
                const sx =
                  breachX + Math.cos(spreadAngle) * sparkDist * (s % 2 === 0 ? 1 : -1) * 0.75;
                const sy = breachY + Math.sin(spreadAngle) * sparkDist;
                const tailLen = 7 + (1 - normS) * 10;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx - Math.cos(spreadAngle) * 2.5, sy - tailLen);
                ctx.strokeStyle = `rgba(244, 244, 245, ${((1 - normS) * 0.58).toFixed(3)})`;
                ctx.lineWidth = 1.1;
                ctx.stroke();
              }
            }
          }
        }

        ctx.restore();
      }

      // 0C. LETTER-BY-LETTER NAVBAR CONDENSATION PULSES (Stage: 'returning-home')
      if (currentStage === 'returning-home') {
        const wmLeft = activeFormation.returnWordmarkLeft ?? 130;
        const wmTop = activeFormation.returnWordmarkTop ?? 20;
        const wmWidth = Math.max(84, activeFormation.returnWordmarkWidth ?? 112);
        const wmHeight = Math.max(16, activeFormation.returnWordmarkHeight ?? 20);

        ctx.save();
        for (let g = 0; g < 14; g++) {
          const normIdx = g / 13;
          const landThreshold = 0.22 + normIdx * 0.74;
          const pulseDelta = returnProgress - landThreshold;
          // Draw a crisp monochrome condensation ring right as droplet packet g locks into letter g
          if (pulseDelta > -0.04 && pulseDelta < 0.14) {
            const pulseT = (pulseDelta + 0.04) / 0.18;
            const lx = wmLeft + ((g + 0.5) / 14) * wmWidth;
            const ly = wmTop + wmHeight * 0.5;
            const pulseR = 3 + pulseT * 12;
            const pulseAlpha = Math.sin(pulseT * Math.PI) * 0.55;

            ctx.beginPath();
            ctx.arc(lx, ly, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha.toFixed(3)})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 1. Subtle Geometric Contour Guide ONLY for continuous closed perimeter shapes when not split to screen edges
      if (
        currentStage === 'screen-roam' &&
        formationLock > 0.48 &&
        scrollSplitBlend < 0.18 &&
        (activeFormation.shapeMode === 'circle-orbit' ||
          activeFormation.shapeMode === 'diamond-rhombus-cage')
      ) {
        ctx.save();
        ctx.beginPath();
        const steps = 64;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const pt = sampleKeywordShapePerimeter(
            activeFormation.cx,
            activeFormation.cy,
            activeFormation.rx,
            activeFormation.ry,
            activeFormation.rawWidth,
            activeFormation.rawHeight,
            theta,
            activeFormation.shapeMode,
            1.0,
            timeSec
          );
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.08 * formationLock * (1 - scrollSplitBlend)).toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.setLineDash([2, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Clean Surface-Tension Meniscus Bridges
      const isEscapeStage = currentStage === 'navbar-seek';
      const isReturnStage = currentStage === 'returning-home';
      const isEdgeSplitActive = scrollSplitBlend > 0.15;
      const linkThreshold = isEscapeStage || isReturnStage ? 20 : isEdgeSplitActive ? 18 : 14;
      const linkThresholdSq = linkThreshold * linkThreshold;

      for (let i = 0; i < bots.length; i++) {
        const a = bots[i];
        if (isReturnStage) {
          const landThresholdA = 0.22 + (a.dropletGroup / 13) * 0.74;
          if (returnProgress > landThresholdA + 0.02) continue;
        }
        let connections = 0;
        const maxScan = Math.min(bots.length, i + (isEdgeSplitActive || isReturnStage ? 28 : 12));
        for (let j = i + 1; j < maxScan; j++) {
          if (connections >= 2) break;
          const b = bots[j];
          if (!isEscapeStage && !isReturnStage && !isEdgeSplitActive && a.ring !== b.ring) continue;
          if (
            (isEscapeStage || isReturnStage || isEdgeSplitActive) &&
            a.dropletGroup !== b.dropletGroup
          )
            continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < linkThresholdSq) {
            const dist = Math.sqrt(dSq);
            const sameDroplet = a.dropletGroup === b.dropletGroup;
            const alpha =
              (1 - dist / linkThreshold) *
              (isEscapeStage || isReturnStage
                ? 0.42
                : isEdgeSplitActive
                  ? 0.36
                  : sameDroplet
                    ? 0.26
                    : 0.14);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(228, 228, 231, ${alpha.toFixed(3)})`;
            ctx.lineWidth =
              isEscapeStage || isReturnStage || isEdgeSplitActive ? 1.0 : sameDroplet ? 0.8 : 0.5;
            ctx.stroke();
            connections += 1;
          }
        }
      }

      // 3. Render 220 Hydro-Nano-Bot Units
      for (let i = 0; i < bots.length; i++) {
        const bot = bots[i];

        // During 'returning-home', once droplet packet g docks into letter g, fade its canvas particles into the crisp DOM letter
        let botAlpha = 1;
        if (isReturnStage) {
          const landThreshold = 0.22 + (bot.dropletGroup / 13) * 0.74;
          if (returnProgress >= landThreshold - 0.02) {
            botAlpha = Math.max(0, 1 - (returnProgress - (landThreshold - 0.02)) / 0.06);
          }
          if (botAlpha <= 0.02) continue;
        }

        const speed = Math.hypot(bot.vx, bot.vy);
        const distToSlot = Math.hypot(bot.tx - bot.x, bot.ty - bot.y);
        const unitScale = Math.max(0.68, Math.min(1.05, bot.radius / 2.35));

        ctx.save();
        if (botAlpha < 0.99) {
          ctx.globalAlpha = botAlpha;
        }
        ctx.translate(bot.x, bot.y);
        ctx.rotate(bot.angle);

        const showWake =
          isEscapeStage || isReturnStage ? speed > 28 : distToSlot > 22 && speed > 72;
        if (showWake) {
          const wakeLen =
            isEscapeStage || isReturnStage
              ? Math.min(16, speed * 0.04)
              : Math.min(7.5, speed * 0.018);
          ctx.beginPath();
          ctx.moveTo(-1.5, 0);
          ctx.lineTo(-1.5 - wakeLen, 0);
          ctx.strokeStyle =
            isEscapeStage || isReturnStage
              ? 'rgba(255, 255, 255, 0.42)'
              : 'rgba(228, 228, 231, 0.22)';
          ctx.lineWidth = isEscapeStage || isReturnStage ? 1.1 : 0.8;
          ctx.stroke();
        }

        if (bot.role === 'droplet-core') {
          const r = 2.35 * unitScale;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = '#0A0A0A';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(r * 0.26, -r * 0.24, 0.72, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        } else if (bot.role === 'command') {
          ctx.beginPath();
          ctx.moveTo(3.1, 0);
          ctx.lineTo(0, 2.0);
          ctx.lineTo(-2.7, 0);
          ctx.lineTo(0, -2.0);
          ctx.closePath();
          ctx.fillStyle = '#000000';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-0.65, -0.65, 1.3, 1.3);
        } else {
          const stretch =
            1 +
            Math.min(
              isEscapeStage || isReturnStage ? 0.58 : 0.35,
              speed / (isEscapeStage || isReturnStage ? 220 : 300)
            );
          const rX = 1.95 * unitScale * stretch;
          const rY = (1.28 * unitScale) / Math.sqrt(stretch);

          ctx.beginPath();
          ctx.moveTo(rX * 1.1, 0);
          ctx.quadraticCurveTo(rX * 0.18, rY, -rX * 0.85, rY * 0.52);
          ctx.arc(-rX * 0.52, 0, rY * 0.52, Math.PI * 0.5, -Math.PI * 0.5, false);
          ctx.quadraticCurveTo(rX * 0.18, -rY, rX * 1.1, 0);
          ctx.closePath();

          ctx.fillStyle =
            isEscapeStage || isReturnStage || bot.ring === 'pointer'
              ? '#FFFFFF'
              : bot.ring === 'inner'
                ? '#F4F4F5'
                : '#A1A1AA';
          ctx.fill();
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [isCanvasMounted, updateStage]);

  return (
    <span
      ref={anchorSpanRef}
      onClick={handleWordmarkTap}
      data-testid="navbar-ascii-snake"
      data-snake-stage={stage}
      data-run-count={runCount}
      data-covered-count={coveredCount}
      data-locked-letters={stage === 'waiting' ? SOURCE_NAME.length : reassemblyState.lockedCharCount}
      data-reassembled-text={stage === 'waiting' ? SOURCE_NAME : reassemblyState.assembledText}
      title={
        stage === 'waiting'
          ? 'Tap to launch Hydro-Droplet Nano-Bot Collective'
          : 'Hari Nandan K. — Hydro-Droplet Nano-Bot Collective'
      }
      className="inline-flex items-center gap-1.5 cursor-pointer select-none"
    >
      <span className="text-[#FFFFFF] font-semibold">HK</span>

      {stage === 'waiting' && (
        <>
          <span className="text-[#71717A]">·</span>
          <span ref={wordmarkSlotRef} className="text-[#FFFFFF] inline-flex items-center">
            {SOURCE_NAME}
          </span>
        </>
      )}

      {(stage === 'morphing' || (stage === 'navbar-seek' && inlineNanoText.length > 0)) && (
        <>
          <span className="text-[#71717A]">·</span>
          <span
            ref={wordmarkSlotRef}
            className="font-mono text-xs sm:text-[13px] tracking-tight text-[#E4E4E7] inline-flex items-center"
          >
            {inlineNanoText.split('').map((ch, idx) => {
              const isCommandNode = ch === '◈' || ch === '⊹' || ch === '❖';
              const verticalJitter =
                stage === 'navbar-seek'
                  ? idx % 2 === 0
                    ? '-translate-y-[1.5px]'
                    : 'translate-y-[1.5px]'
                  : '';
              return (
                <span
                  key={idx}
                  className={`inline-block transition-transform duration-75 ${verticalJitter} ${
                    isCommandNode
                      ? 'text-[#FFFFFF] font-bold scale-110'
                      : 'text-[#A1A1AA]'
                  }`}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              );
            })}
          </span>
        </>
      )}

      {stage === 'returning-home' && (
        <>
          <span className="text-[#71717A]">·</span>
          <span
            ref={wordmarkSlotRef}
            data-testid="navbar-letter-reassembly"
            className="text-[#FFFFFF] inline-flex items-center"
          >
            {reassemblyState.slots.map((slot, idx) => {
              if (slot.status === 'locked') {
                return (
                  <span
                    key={idx}
                    data-letter-status="locked"
                    className="inline-block text-[#FFFFFF] transition-all duration-150 opacity-100 scale-100"
                  >
                    {slot.char === ' ' ? '\u00A0' : slot.char}
                  </span>
                );
              }
              if (slot.status === 'condensing') {
                return (
                  <span
                    key={idx}
                    data-letter-status="condensing"
                    className="inline-block font-mono text-xs text-[#FFFFFF] font-bold scale-110 transition-all duration-75"
                  >
                    {slot.displayChar}
                  </span>
                );
              }
              return (
                <span
                  key={idx}
                  data-letter-status="pending"
                  className="inline-block opacity-0 pointer-events-none"
                >
                  {slot.char === ' ' ? '\u00A0' : slot.char}
                </span>
              );
            })}
          </span>
        </>
      )}

      {isCanvasMounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <canvas
            ref={canvasRef}
            data-testid="nanobot-swarm-canvas"
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-60"
          />,
          document.body
        )}
    </span>
  );
};
