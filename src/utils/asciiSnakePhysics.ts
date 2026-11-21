export interface SnakeVertebra {
  x: number;
  y: number;
  angle: number;
  curvature: number;
  widthFactor: number;
  dorsalGlyph: string;
  leftFlankGlyph: string;
  rightFlankGlyph: string;
}

export interface HeadingAnchorRect {
  id: string;
  text: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface NavBarContainerRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type SnakeBehaviorMode =
  | 'navbar-seek'
  | 'navbar-spiral'
  | 'heading-crawl'
  | 'heading-spiral'
  | 'scroll-transit';

export interface SnakeTargetState {
  x: number;
  y: number;
  mode: SnakeBehaviorMode;
  activeHeadingText: string;
  spiralPhase: number;
}

const MORPH_CIPHER_GLYPHS = ['░', '▒', '▓', '█', '◈', '❖', '╬', '╫', '≡', '═', '~', '∙'];

const LIVE_NAVBAR_SNAKE_BODY = [
  '~', '∙', '░', '▒', '▓', '█', '◈', '█', '▓', '▒', '░', '▒', '▓', '█', '◈', '⟪', 'º', '◈', 'º', '⟫'
];

const TONGUE_FRAMES = ['~═<:', '~──<:', '~─<', '~<:3', '~═<:', '~'];

/**
 * Computes the inline navbar ASCII transformation string as "Hari Nandan K."
 * morphs into an ASCII serpent right after the Hero "K." finishes loading.
 */
export function computeAsciiMorphFrame(
  sourceText: string,
  progress: number,
  tick: number
): string {
  const clamped = Math.max(0, Math.min(1, progress));

  if (clamped <= 0) {
    return sourceText;
  }

  if (clamped >= 1) {
    const waveChars = LIVE_NAVBAR_SNAKE_BODY.map((glyph, idx) => {
      if (idx >= 2 && idx <= 14) {
        const waveIndex = (idx + tick) % 6;
        if (waveIndex === 0) return '◈';
        if (waveIndex === 1) return '█';
        if (waveIndex === 2) return '▓';
        if (waveIndex === 3) return '▒';
        if (waveIndex === 4) return '░';
        return '═';
      }
      return glyph;
    }).join('');

    const tongue = TONGUE_FRAMES[tick % TONGUE_FRAMES.length];
    return `${waveChars}${tongue}`;
  }

  // Intermediate morphing phase (0 < progress < 1): character-by-character cellular ASCII dissolution
  const targetLen = LIVE_NAVBAR_SNAKE_BODY.length;
  const maxLen = Math.max(sourceText.length, targetLen);
  const chars: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const charThreshold = i / maxLen;
    if (clamped < charThreshold * 0.65) {
      if (i < sourceText.length) {
        chars.push(sourceText[i]);
      }
    } else if (clamped < charThreshold * 0.65 + 0.32) {
      const glyphIdx = (i * 3 + tick) % MORPH_CIPHER_GLYPHS.length;
      chars.push(MORPH_CIPHER_GLYPHS[glyphIdx]);
    } else {
      if (i < targetLen) {
        chars.push(LIVE_NAVBAR_SNAKE_BODY[i]);
      }
    }
  }

  return chars.join('');
}

/**
 * As the full-bodied canvas snake crawls away from the wordmark and seeks through the navbar,
 * the inline text characters slither out from tail to head until the inline text slot empties,
 * leaving "HK" cleanly in the navbar while the single snake lives on the canvas.
 */
export function computeNavbarSlitherExitFrame(
  exitProgress: number,
  tick: number
): string {
  const clamped = Math.max(0, Math.min(1, exitProgress));
  if (clamped >= 1) {
    return '';
  }
  const full = computeAsciiMorphFrame('Hari Nandan K.', 1, tick);
  const remainingCount = Math.max(
    0,
    Math.round(full.length * (1 - clamped))
  );
  // Slice from the tail end as the snake crawls to the right through the navbar
  return full.slice(0, remainingCount);
}

/**
 * Computes the trajectory as the snake seeks THROUGH the navbar glass container:
 * - 0.0 -> 0.72: Slithers horizontally left-to-right through the inside of the navbar bar,
 *   weaving a tight serpentine S-wave across the navigation links.
 * - 0.72 -> 1.0: Coils near the right-center of the navbar and dives down through the
 *   bottom glass border onto the main screen!
 */
export function computeNavbarSeekTargetPoint(
  navBarRect: NavBarContainerRect,
  seekProgress: number,
  timeSec: number
): SnakeTargetState {
  const p = Math.max(0, Math.min(1, seekProgress));
  const startX = navBarRect.left + 88;
  const endRightX = navBarRect.left + navBarRect.width * 0.82;
  const centerY = navBarRect.top + navBarRect.height * 0.52;

  if (p < 0.74) {
    // Seeking horizontally right through the navbar interior with serpentine S-undulation
    const traverseT = p / 0.74;
    const easeT = traverseT * traverseT * (3 - 2 * traverseT);
    const x = startX + (endRightX - startX) * easeT;
    const y = centerY + Math.sin(traverseT * Math.PI * 5.5) * Math.min(14, navBarRect.height * 0.34);
    return {
      x,
      y,
      mode: 'navbar-seek',
      activeHeadingText: 'NAVBAR · SEEK',
      spiralPhase: traverseT * Math.PI * 2
    };
  }

  // Final 26% of navbar seek: curls in a tight half-spiral and dives down out of the navbar onto the screen
  const exitT = (p - 0.74) / 0.26;
  const loopAngle = -Math.PI * 0.25 + exitT * Math.PI * 1.35;
  const exitCenterX = navBarRect.left + navBarRect.width * 0.56;
  const x = exitCenterX + Math.cos(loopAngle) * (85 * (1 - exitT * 0.35));
  const y = centerY + exitT * (navBarRect.height * 0.95 + 78) + Math.sin(timeSec * 8) * 6;

  return {
    x,
    y,
    mode: 'navbar-seek',
    activeHeadingText: 'SCREEN · ENTRY',
    spiralPhase: loopAngle
  };
}

/**
 * Anatomical profile & ASCII glyph assignment for each vertebra along the spine.
 */
export function getVertebraAnatomy(
  index: number,
  total: number
): {
  widthFactor: number;
  dorsalGlyph: string;
  leftFlankGlyph: string;
  rightFlankGlyph: string;
} {
  const t = index / Math.max(1, total - 1);

  if (index === 0) {
    return { widthFactor: 1.35, dorsalGlyph: '◈', leftFlankGlyph: '⟪', rightFlankGlyph: '⟫' };
  }
  if (index === 1) {
    return { widthFactor: 1.5, dorsalGlyph: '█', leftFlankGlyph: '╔', rightFlankGlyph: '╗' };
  }
  if (index >= 2 && index <= 6) {
    const hoodFlare = 1.65 - Math.abs(index - 3.5) * 0.14;
    return {
      widthFactor: hoodFlare,
      dorsalGlyph: index % 2 === 0 ? '◈' : '█',
      leftFlankGlyph: index % 2 === 0 ? '⟦' : '▓',
      rightFlankGlyph: index % 2 === 0 ? '⟧' : '▓'
    };
  }

  if (t < 0.66) {
    const bodyTaper = 1.25 - (t - 0.15) * 0.65;
    const dorsalCycle = ['█', '▓', '◈', '▓', '❖', '▓', '╬', '▒'];
    const flankLeftCycle = ['▒', '░', '(', '∷', '▒', '░', '⟦', '∙'];
    const flankRightCycle = ['▒', '░', ')', '∷', '▒', '░', '⟧', '∙'];
    return {
      widthFactor: Math.max(0.55, bodyTaper),
      dorsalGlyph: dorsalCycle[index % dorsalCycle.length],
      leftFlankGlyph: flankLeftCycle[index % flankLeftCycle.length],
      rightFlankGlyph: flankRightCycle[index % flankRightCycle.length]
    };
  }

  const tailT = (t - 0.66) / 0.34;
  const tailGlyphs = ['▒', '░', '≡', '═', '─', '~', '·', '∙'];
  const glyphIdx = Math.min(
    tailGlyphs.length - 1,
    Math.floor(tailT * tailGlyphs.length)
  );
  return {
    widthFactor: Math.max(0.15, (1 - tailT) * 0.65),
    dorsalGlyph: tailGlyphs[glyphIdx],
    leftFlankGlyph: tailT < 0.45 ? '·' : '',
    rightFlankGlyph: tailT < 0.45 ? '·' : ''
  };
}

/**
 * Creates the initial N-vertebra ASCII serpent spine aligned horizontally inside the navbar wordmark
 * (head on the right end of "Hari Nandan K.", tail on the left next to "HK ·") so it seamlessly
 * wakes up in-place and seeks right through the navbar!
 */
export function createSnakeSpine(
  originX: number,
  originY: number,
  segmentCount = 44,
  segmentLength = 9.0
): SnakeVertebra[] {
  const spine: SnakeVertebra[] = [];
  // Align horizontally from head (originX) leftward toward tail so it matches the wordmark span
  for (let i = 0; i < segmentCount; i++) {
    const x = originX - i * (segmentLength * 0.48);
    const y = originY + Math.sin(i * 0.42) * 2.2;
    const anatomy = getVertebraAnatomy(i, segmentCount);
    spine.push({
      x,
      y,
      angle: 0,
      curvature: 0,
      ...anatomy
    });
  }
  return spine;
}

/**
 * Selects the active main heading in the viewport and computes the snake's target trajectory:
 * - Crawling directly above the main heading ridge with pronounced serpentine S-wave undulation
 * - Coiling into multi-loop Archimedean spirals above the main heading
 * - Responding dynamically to scroll velocity when transitioning between headings
 */
export function computeHeadingTargetPoint(
  headings: HeadingAnchorRect[],
  scrollY: number,
  viewportWidth: number,
  viewportHeight: number,
  timeSec: number,
  scrollVelocity: number,
  navAnchor: { x: number; y: number }
): SnakeTargetState {
  const idealFocusY = scrollY < 60 ? viewportHeight * 0.28 : viewportHeight * 0.32;

  let activeHeading: HeadingAnchorRect | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const h of headings) {
    if (h.top > -60 && h.top < viewportHeight * 0.88) {
      const dist = Math.abs(h.top - idealFocusY);
      if (dist < bestScore) {
        bestScore = dist;
        activeHeading = h;
      }
    }
  }

  if (!activeHeading) {
    const spiralAngle = timeSec * 3.1;
    const spiralRadius = 24 + 14 * Math.sin(timeSec * 1.2);
    return {
      x: Math.max(40, Math.min(viewportWidth - 40, navAnchor.x + 80 + Math.cos(spiralAngle) * spiralRadius)),
      y: Math.max(48, Math.min(viewportHeight - 40, navAnchor.y + 38 + Math.sin(spiralAngle) * (spiralRadius * 0.68))),
      mode: 'navbar-spiral',
      activeHeadingText: 'HK · NAV',
      spiralPhase: spiralAngle
    };
  }

  const cyclePeriod = 8.5;
  const cyclePhase = (timeSec % cyclePeriod) / cyclePeriod;
  const isHighScrollTransit = Math.abs(scrollVelocity) > 22;

  const headingLeft = Math.max(36, activeHeading.left);
  const headingSpan = Math.max(200, Math.min(activeHeading.width, viewportWidth * 0.62));
  const ridgeBaseY = Math.max(66, activeHeading.top - 24);

  if (isHighScrollTransit) {
    const sweepX = headingLeft + headingSpan * (0.5 + 0.4 * Math.sin(timeSec * 3.8));
    const waveY = ridgeBaseY + Math.sin(timeSec * 8.2) * 20;
    return {
      x: Math.max(36, Math.min(viewportWidth - 36, sweepX)),
      y: Math.max(58, Math.min(viewportHeight - 40, waveY)),
      mode: 'scroll-transit',
      activeHeadingText: activeHeading.text,
      spiralPhase: timeSec * 4.5
    };
  }

  if (cyclePhase < 0.58) {
    // PHASE 1: SERPENTINE CRAWL ABOVE MAIN HEADING RIDGE
    const normalizedCrawl = cyclePhase / 0.58;
    const horizontalProgress = 0.5 - 0.5 * Math.cos(normalizedCrawl * Math.PI * 2);
    const targetX = headingLeft + horizontalProgress * headingSpan;
    const undulationY =
      ridgeBaseY +
      Math.sin(normalizedCrawl * Math.PI * 7 + timeSec * 3.4) * 18 -
      Math.cos(normalizedCrawl * Math.PI * 2) * 7;

    return {
      x: Math.max(36, Math.min(viewportWidth - 36, targetX)),
      y: Math.max(56, Math.min(viewportHeight - 40, undulationY)),
      mode: 'heading-crawl',
      activeHeadingText: activeHeading.text,
      spiralPhase: 0
    };
  }

  // PHASE 2: MULTI-LOOP ARCHIMEDEAN SPIRAL COIL ABOVE THE MAIN HEADING
  const spiralProgress = (cyclePhase - 0.58) / 0.42;
  const theta = spiralProgress * Math.PI * 5.0 + timeSec * 1.5;
  const radiusEnvelope = 15 + 39 * (0.5 + 0.5 * Math.cos(spiralProgress * Math.PI * 2));
  const spiralCenterX = Math.min(
    viewportWidth - 90,
    headingLeft + headingSpan * 0.65
  );
  const spiralCenterY = Math.max(82, ridgeBaseY - 8);

  const targetX = spiralCenterX + Math.cos(theta) * radiusEnvelope;
  const targetY = spiralCenterY + Math.sin(theta) * (radiusEnvelope * 0.82);

  return {
    x: Math.max(36, Math.min(viewportWidth - 36, targetX)),
    y: Math.max(54, Math.min(viewportHeight - 40, targetY)),
    mode: 'heading-spiral',
    activeHeadingText: activeHeading.text,
    spiralPhase: theta
  };
}

/**
 * Advances the 44-vertebra snake using:
 * 1) Head steering with lateral serpentine sinusoidal slither wave
 * 2) Pure Follow-the-Leader Inverse Kinematics with angular curvature constraint
 */
export function stepSnakePhysics(
  prevSpine: SnakeVertebra[],
  target: { x: number; y: number },
  dt: number,
  timeSec: number,
  mode: SnakeBehaviorMode,
  segmentLength = 9.0
): SnakeVertebra[] {
  if (prevSpine.length === 0) return [];

  const clampedDt = Math.max(0.004, Math.min(0.05, dt));
  const nextSpine: SnakeVertebra[] = prevSpine.map((v) => ({ ...v }));

  // 1. Head Kinematics (Vertebra 0)
  const head = nextSpine[0];
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const distToTarget = Math.hypot(dx, dy);

  const baseSpeed =
    mode === 'navbar-seek'
      ? 470
      : mode === 'scroll-transit'
        ? 560
        : mode === 'heading-spiral'
          ? 370
          : 310;
  const desiredSpeed = Math.min(baseSpeed, Math.max(125, distToTarget * 5.2));

  const targetAngle = Math.atan2(dy, dx);
  const lateralHeadWave =
    mode === 'heading-spiral'
      ? Math.sin(timeSec * 8.0) * 0.14
      : mode === 'navbar-seek'
        ? Math.sin(timeSec * 12.0) * 0.28
        : Math.sin(timeSec * 9.2) * 0.42;

  let angleDiff = targetAngle + lateralHeadWave - head.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  const turnRate = mode === 'heading-spiral' || mode === 'navbar-seek' ? 16.5 : 11.5;
  head.angle += angleDiff * Math.min(1, turnRate * clampedDt);

  const stepDist = Math.min(distToTarget + 4, desiredSpeed * clampedDt);
  head.x += Math.cos(head.angle) * stepDist;
  head.y += Math.sin(head.angle) * stepDist;

  // 2. Follow-the-Leader Inverse Kinematics with Angular Curvature Constraint & Subtle Muscle Ripple
  const maxTurnPerSegment = 0.36;

  for (let i = 1; i < nextSpine.length; i++) {
    const leader = nextSpine[i - 1];
    const follower = nextSpine[i];

    const segDx = leader.x - follower.x;
    const segDy = leader.y - follower.y;
    let segAngle = Math.atan2(segDy, segDx);

    let relAngle = segAngle - leader.angle;
    while (relAngle > Math.PI) relAngle -= Math.PI * 2;
    while (relAngle < -Math.PI) relAngle += Math.PI * 2;

    if (relAngle > maxTurnPerSegment) {
      segAngle = leader.angle + maxTurnPerSegment;
    } else if (relAngle < -maxTurnPerSegment) {
      segAngle = leader.angle - maxTurnPerSegment;
    }

    const normalX = -Math.sin(segAngle);
    const normalY = Math.cos(segAngle);
    const envelope = Math.sin((i / nextSpine.length) * Math.PI);
    const muscleRipple =
      Math.sin(i * 0.45 - timeSec * 10.5) *
      (mode === 'heading-spiral' ? 0.35 : 0.75) *
      envelope;

    follower.x =
      leader.x -
      Math.cos(segAngle) * segmentLength +
      normalX * muscleRipple;
    follower.y =
      leader.y -
      Math.sin(segAngle) * segmentLength +
      normalY * muscleRipple;

    follower.angle = segAngle;
    follower.curvature = Math.abs(relAngle);
  }

  return nextSpine;
}
