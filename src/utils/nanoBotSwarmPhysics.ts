export interface NanoBotAgent {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  angle: number;
  radius: number;
  dropletGroup: number;
  groupIndex: number;
  groupTotal: number;
  role: 'command' | 'droplet-core' | 'worker';
  ring: 'inner' | 'outer' | 'pointer';
  ringIndex: number;
  ringTotal: number;
  phase: number;
  glyph: string;
}

export interface KeywordTargetRect {
  id: string;
  label: string;
  priority: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface NavBarContainerRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CursorState {
  x: number;
  y: number;
  active: boolean;
}

export type NanoBotShapeMode =
  | 'navbar-droplet-stream'
  | 'navbar-escape-breach'
  | 'navbar-return-letter'
  | 'circle-orbit'
  | 'tactical-hook-brackets'
  | 'diamond-rhombus-cage'
  | 'helix-underline-cradle'
  | 'lemniscate-end-hooks'
  | 'scroll-stream';

export interface ActiveSwarmFormation {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rawWidth: number;
  rawHeight: number;
  prevCx: number;
  prevCy: number;
  prevRx: number;
  prevRy: number;
  pointerOriginX: number;
  pointerOriginY: number;
  isCursorGuided: boolean;
  shapeMode: NanoBotShapeMode;
  targetLabel: string;
  transitionProgress: number;
  escapeBreachX?: number;
  escapeBreachY?: number;
  escapePressure?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  scrollSplitBlend?: number;
  scrollDirection?: number;
  returnWordmarkLeft?: number;
  returnWordmarkTop?: number;
  returnWordmarkWidth?: number;
  returnWordmarkHeight?: number;
}

export interface NanoBotLetterReassemblyState {
  /** Array of 14 per-character slots for rendering letter-by-letter reassembly */
  slots: Array<{
    char: string;
    status: 'locked' | 'condensing' | 'pending';
    displayChar: string;
  }>;
  /** Prefix string of letters that have fully locked back into place */
  assembledText: string;
  /** Number of letters (0..14) fully restored */
  lockedCharCount: number;
  /** Index of the letter currently condensing from returning nano-bots (-1 if none) */
  activeFrontierIndex: number;
  /** True when all characters of "Hari Nandan K." are restored */
  isComplete: boolean;
}

const NANOBOT_GLYPHS = ['◈', '⊹', '❖', '∷', '+', '∙', '▫', '▪', '×', '·'];
const TOTAL_DROPLET_GROUPS = 14;

export function signedPow(val: number, exp: number): number {
  return Math.sign(val) * Math.pow(Math.abs(val), exp);
}

/**
 * Computes a dedicated screen-edge or screen-corner anchor slot for each of the 14 droplet
 * groups when the visitor scrolls:
 * - Groups 0, 1, 2, 3 -> Lock into the 4 Viewport Corners (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
 *   forming articulated L-shaped cinematic framing brackets and rotating corner droplets.
 * - Groups 4, 5, 6 -> Glide along the Left Viewport Edge rail.
 * - Groups 7, 8, 9 -> Glide along the Right Viewport Edge rail.
 * - Groups 10, 11 -> Glide along the Top Viewport Edge rail.
 * - Groups 12, 13 -> Glide along the Bottom Viewport Edge rail.
 */
export function computeViewportEdgeCornerSlot(
  bot: NanoBotAgent,
  viewportWidth: number,
  viewportHeight: number,
  timeSec: number,
  scrollDirection = 1
): { x: number; y: number; tangentAngle: number } {
  const vw = Math.max(320, viewportWidth || 1440);
  const vh = Math.max(320, viewportHeight || 900);
  const marginX = 24;
  const marginY = 24;
  const cornerArm = Math.min(76, Math.max(42, Math.min(vw, vh) * 0.075));
  const localFrac = bot.groupIndex / Math.max(1, bot.groupTotal); // 0..1 within this droplet group
  const dirSign = scrollDirection >= 0 ? 1 : -1;

  // 1. FOUR VIEWPORT CORNERS (dropletGroup 0..3): Cinematic L-shaped corner brackets
  if (bot.dropletGroup < 4) {
    const cornerIdx = bot.dropletGroup; // 0: TL, 1: TR, 2: BR, 3: BL
    const cornerDefs = [
      { cx: marginX, cy: marginY, sx: 1, sy: 1 },          // Top-Left
      { cx: vw - marginX, cy: marginY, sx: -1, sy: 1 },    // Top-Right
      { cx: vw - marginX, cy: vh - marginY, sx: -1, sy: -1 }, // Bottom-Right
      { cx: marginX, cy: vh - marginY, sx: 1, sy: -1 }     // Bottom-Left
    ];
    const c = cornerDefs[cornerIdx];
    const breathe = Math.sin(timeSec * 1.6 + cornerIdx * 1.2) * 2.5;

    if (bot.groupIndex === 0) {
      // Corner apex droplet-core node
      return {
        x: c.cx + c.sx * 2,
        y: c.cy + c.sy * 2,
        tangentAngle: Math.atan2(c.sy, c.sx)
      };
    }

    if (localFrac < 0.52) {
      // Horizontal arm of the screen-corner bracket
      const armT = localFrac / 0.52;
      const dist = 6 + armT * (cornerArm + breathe);
      const wave = Math.sin(armT * Math.PI * 2 - timeSec * 2.4) * 1.4;
      return {
        x: c.cx + c.sx * dist,
        y: c.cy + c.sy * (2 + wave),
        tangentAngle: c.sx > 0 ? 0 : Math.PI
      };
    } else {
      // Vertical arm of the screen-corner bracket
      const armT = (localFrac - 0.52) / 0.48;
      const dist = 6 + armT * (cornerArm + breathe);
      const wave = Math.sin(armT * Math.PI * 2 - timeSec * 2.4) * 1.4;
      return {
        x: c.cx + c.sx * (2 + wave),
        y: c.cy + c.sy * dist,
        tangentAngle: c.sy > 0 ? Math.PI * 0.5 : -Math.PI * 0.5
      };
    }
  }

  // 2. LEFT VIEWPORT EDGE RAIL (dropletGroup 4, 5, 6)
  if (bot.dropletGroup >= 4 && bot.dropletGroup <= 6) {
    const laneIdx = bot.dropletGroup - 4; // 0, 1, 2
    const usableH = Math.max(120, vh - (marginY + cornerArm + 28) * 2);
    const baseSegmentY = marginY + cornerArm + 28 + ((laneIdx + 0.15 + localFrac * 0.7) / 3) * usableH;
    const flowDrift = Math.sin(timeSec * 1.8 * dirSign + laneIdx * 1.7 + localFrac * Math.PI) * 18;
    const y = Math.max(marginY + cornerArm + 12, Math.min(vh - marginY - cornerArm - 12, baseSegmentY + flowDrift));
    const x = marginX + 2 + Math.sin(localFrac * Math.PI * 2 + timeSec * 2.2) * 2.2 + (bot.ring === 'outer' ? 5.5 : 0);
    return {
      x,
      y,
      tangentAngle: dirSign > 0 ? -Math.PI * 0.5 : Math.PI * 0.5
    };
  }

  // 3. RIGHT VIEWPORT EDGE RAIL (dropletGroup 7, 8, 9)
  if (bot.dropletGroup >= 7 && bot.dropletGroup <= 9) {
    const laneIdx = bot.dropletGroup - 7; // 0, 1, 2
    const usableH = Math.max(120, vh - (marginY + cornerArm + 28) * 2);
    const baseSegmentY = marginY + cornerArm + 28 + ((laneIdx + 0.15 + localFrac * 0.7) / 3) * usableH;
    const flowDrift = Math.cos(timeSec * 1.8 * dirSign + laneIdx * 1.7 + localFrac * Math.PI) * 18;
    const y = Math.max(marginY + cornerArm + 12, Math.min(vh - marginY - cornerArm - 12, baseSegmentY + flowDrift));
    const x = vw - marginX - 2 - Math.sin(localFrac * Math.PI * 2 + timeSec * 2.2) * 2.2 - (bot.ring === 'outer' ? 5.5 : 0);
    return {
      x,
      y,
      tangentAngle: dirSign > 0 ? -Math.PI * 0.5 : Math.PI * 0.5
    };
  }

  // 4. TOP VIEWPORT EDGE RAIL (dropletGroup 10, 11)
  if (bot.dropletGroup === 10 || bot.dropletGroup === 11) {
    const laneIdx = bot.dropletGroup - 10; // 0 (left-top edge), 1 (right-top edge)
    const usableW = Math.max(160, vw - (marginX + cornerArm + 36) * 2);
    const baseSegmentX = marginX + cornerArm + 36 + ((laneIdx + 0.12 + localFrac * 0.76) / 2) * usableW;
    const flowDrift = Math.sin(timeSec * 1.5 + laneIdx * 2.1 + localFrac * Math.PI) * 22;
    const x = Math.max(marginX + cornerArm + 14, Math.min(vw - marginX - cornerArm - 14, baseSegmentX + flowDrift));
    const y = marginY + 2 + Math.cos(localFrac * Math.PI * 2 + timeSec * 2.0) * 1.8 + (bot.ring === 'outer' ? 5.0 : 0);
    return {
      x,
      y,
      tangentAngle: laneIdx === 0 ? Math.PI : 0
    };
  }

  // 5. BOTTOM VIEWPORT EDGE RAIL (dropletGroup 12, 13)
  const laneIdx = bot.dropletGroup - 12; // 0 (left-bottom edge), 1 (right-bottom edge)
  const usableW = Math.max(160, vw - (marginX + cornerArm + 36) * 2);
  const baseSegmentX = marginX + cornerArm + 36 + ((laneIdx + 0.12 + localFrac * 0.76) / 2) * usableW;
  const flowDrift = Math.cos(timeSec * 1.5 + laneIdx * 2.1 + localFrac * Math.PI) * 22;
  const x = Math.max(marginX + cornerArm + 14, Math.min(vw - marginX - cornerArm - 14, baseSegmentX + flowDrift));
  const y = vh - marginY - 2 - Math.sin(localFrac * Math.PI * 2 + timeSec * 2.0) * 1.8 - (bot.ring === 'outer' ? 5.0 : 0);
  return {
    x,
    y,
    tangentAngle: laneIdx === 0 ? Math.PI : 0
  };
}

/**
 * Samples a point along a smooth non-overlapping outer perimeter shape around a keyword:
 * - 'circle-orbit': Smooth super-circle / stadium halo
 * - 'tactical-hook-brackets': 4 articulated corner hooks [ ] that physically hook onto the 4 corners of the keyword
 * - 'diamond-rhombus-cage': Faceted 8-node diamond / octagonal crystal frame around the keyword
 * - 'helix-underline-cradle': Double-helix sinusoidal liquid cradle beneath the keyword with left/right vertical hooks
 * - 'lemniscate-end-hooks': Dual counter-flowing crescent C-hooks wrapping the left and right ends of the keyword
 */
export function sampleKeywordShapePerimeter(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rawWidth: number,
  rawHeight: number,
  theta: number,
  shapeMode: NanoBotShapeMode,
  ringMultiplier = 1.0,
  timeSec = 0
): { x: number; y: number; tangentAngle: number } {
  const normAngle = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const u = normAngle / (Math.PI * 2); // 0..1

  const halfW = rawWidth * 0.5 + 16 * ringMultiplier;
  const halfH = rawHeight * 0.5 + 14 * ringMultiplier;

  // SHAPE 1: TACTICAL CORNER HOOK BRACKETS (4 Corner Hooks [ ] around the keyword)
  if (shapeMode === 'tactical-hook-brackets') {
    const cornerIndex = Math.floor(u * 4) % 4;
    const localU = (u * 4) % 1; // 0..1 along each corner hook
    const hookArmX = Math.min(36, Math.max(18, halfW * 0.42)) * ringMultiplier;
    const hookArmY = Math.min(22, Math.max(12, halfH * 0.72)) * ringMultiplier;
    const breathe = 1 + 0.025 * Math.sin(timeSec * 1.05 + cornerIndex);

    const signs = [
      { sx: -1, sy: -1 }, // Top-Left hook
      { sx: 1, sy: -1 },  // Top-Right hook
      { sx: 1, sy: 1 },   // Bottom-Right hook
      { sx: -1, sy: 1 }   // Bottom-Left hook
    ][cornerIndex];

    const cornerX = cx + signs.sx * halfW * breathe;
    const cornerY = cy + signs.sy * halfH * breathe;

    if (localU < 0.5) {
      // Vertical arm of the corner hook
      const armT = (0.5 - localU) / 0.5; // 1 at tip -> 0 at corner vertex
      const x = cornerX;
      const y = cornerY - signs.sy * hookArmY * armT;
      return { x, y, tangentAngle: signs.sy * Math.PI * 0.5 };
    } else {
      // Horizontal arm of the corner hook
      const armT = (localU - 0.5) / 0.5; // 0 at corner vertex -> 1 at horizontal tip
      const x = cornerX - signs.sx * hookArmX * armT;
      const y = cornerY;
      return { x, y, tangentAngle: -signs.sx * Math.PI * 0.5 };
    }
  }

  // SHAPE 2: DIAMOND RHOMBUS / OCTAGONAL CAGE AROUND KEYWORD (Guaranteed outside all 4 corners)
  if (shapeMode === 'diamond-rhombus-cage') {
    const exp = 0.85; // <= 1 guarantees the diamond/octagonal contour encloses all 4 corners of the keyword
    const cosT = Math.cos(normAngle);
    const sinT = Math.sin(normAngle);
    const diamondRx = (halfW + 14) * ringMultiplier;
    const diamondRy = (halfH + 11) * ringMultiplier;
    const x = cx + diamondRx * signedPow(cosT, exp);
    const y = cy + diamondRy * signedPow(sinT, exp);
    const tangentAngle = Math.atan2(diamondRy * cosT, -diamondRx * sinT);
    return { x, y, tangentAngle };
  }

  // SHAPE 3: DOUBLE-HELIX UNDERLINE CRADLE + SIDE HOOK CLAWS (Completely outside the text box)
  if (shapeMode === 'helix-underline-cradle') {
    if (u < 0.68) {
      // Intertwined double-helix wave cradle right underneath the keyword
      const cradleT = u / 0.68; // 0..1 from left to right
      const strand = Math.floor(cradleT * 24) % 2 === 0 ? 1 : -1;
      const x = cx - halfW + cradleT * (halfW * 2);
      const helixWave =
        Math.sin(cradleT * Math.PI * 3 - timeSec * 1.25) *
        3.2 *
        strand *
        ringMultiplier;
      const y = cy + halfH + 5 + helixWave;
      return { x, y, tangentAngle: 0 };
    } else if (u < 0.84) {
      // Left outward C-hook claw wrapping OUTSIDE the left edge of the keyword (x <= cx - halfW)
      const hookT = (u - 0.68) / 0.16; // 0..1
      const hookAngle = Math.PI * 0.5 + hookT * Math.PI; // PI/2 (bottom) -> 3*PI/2 (top), so cos <= 0
      const hookR = halfH + 4;
      const x = cx - halfW + Math.cos(hookAngle) * (hookR * 0.72);
      const y = cy + Math.sin(hookAngle) * hookR;
      return { x, y, tangentAngle: hookAngle + Math.PI * 0.5 };
    } else {
      // Right outward C-hook claw wrapping OUTSIDE the right edge of the keyword (x >= cx + halfW)
      const hookT = (u - 0.84) / 0.16; // 0..1
      const hookAngle = Math.PI * 0.5 - hookT * Math.PI; // PI/2 (bottom) -> -PI/2 (top), so cos >= 0
      const hookR = halfH + 4;
      const x = cx + halfW + Math.cos(hookAngle) * (hookR * 0.72);
      const y = cy + Math.sin(hookAngle) * hookR;
      return { x, y, tangentAngle: hookAngle - Math.PI * 0.5 };
    }
  }

  // SHAPE 4: LEMNISCATE / DUAL VORTEX END-HOOKS (Outward C-Hooks on Left & Right Ends of Keyword)
  if (shapeMode === 'lemniscate-end-hooks') {
    const isLeftHook = u < 0.5;
    const localU = isLeftHook ? u * 2 : (u - 0.5) * 2; // 0..1
    const loopRadiusY = (halfH + 6) * ringMultiplier;
    const loopRadiusX = Math.min(28, halfH * 0.95) * ringMultiplier;
    const anchorX = isLeftHook ? cx - halfW - 2 : cx + halfW + 2;
    // Outward-opening C-hook arc on each end so 100% of bots stay outside the keyword text
    const baseAngle = isLeftHook
      ? Math.PI * 0.42 + localU * Math.PI * 1.16 // Sweeps outer left (cos <= 0.25)
      : -Math.PI * 0.58 + localU * Math.PI * 1.16; // Sweeps outer right (cos >= -0.25)
    const x = anchorX + Math.cos(baseAngle) * loopRadiusX;
    const y = cy + Math.sin(baseAngle) * loopRadiusY;
    return { x, y, tangentAngle: baseAngle + Math.PI * 0.5 };
  }

  // DEFAULT ('circle-orbit'): Smooth super-circle / capillary stadium halo (Guaranteed outside all 4 corners)
  const cosT = Math.cos(normAngle);
  const sinT = Math.sin(normAngle);
  // exp = 0.76 makes a superellipse (|x/rx|^2.63 + |y/ry|^2.63 = 1) that hugs the rectangular text cleanly outside all 4 corners
  const exp = 0.76;
  const capillaryRipple = 1 + 0.018 * Math.sin(normAngle * 4 - timeSec * 1.35);

  const x = cx + halfW * 1.06 * capillaryRipple * signedPow(cosT, exp);
  const y = cy + halfH * 1.08 * capillaryRipple * signedPow(sinT, exp);
  const tangentAngle = Math.atan2(halfH * cosT, -halfW * sinT);

  return { x, y, tangentAngle };
}

/**
 * Legacy helper alias preserved for tests and perimeter guide rendering.
 */
export function sampleKeywordCirclePerimeter(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  theta: number,
  ringMultiplier = 1.0
): { x: number; y: number; tangentAngle: number } {
  return sampleKeywordShapePerimeter(
    cx,
    cy,
    rx,
    ry,
    Math.max(40, (rx - 18) * 1.75),
    Math.max(20, (ry - 14) * 1.65),
    theta,
    'circle-orbit',
    ringMultiplier,
    0
  );
}

/**
 * Computes the inline navbar text transformation as "Hari Nandan K."
 * atomizes into a collective swarm of micro-fluid nano-bots right after
 * the Hero "K." finishes its drift.
 */
export function computeNanoBotDissolveFrame(
  sourceText: string,
  progress: number,
  tick: number
): string {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped <= 0) {
    return sourceText;
  }

  const chars: string[] = [];
  for (let i = 0; i < sourceText.length; i++) {
    const threshold = (i / Math.max(1, sourceText.length - 1)) * 0.68;
    if (clamped < threshold) {
      chars.push(sourceText[i]);
    } else {
      const glyphIndex = (i * 3 + tick) % NANOBOT_GLYPHS.length;
      chars.push(NANOBOT_GLYPHS[glyphIndex]);
    }
  }
  return chars.join('');
}

/**
 * As the nano-bot collective fractures out of "Hari Nandan K." and surges rightward
 * to escape the navbar enclosure, the inline wordmark violently unzips from left to right
 * with trailing spark glyphs until only "HK" remains in the navbar corner.
 */
export function computeNanoBotNavbarExitFrame(
  exitProgress: number,
  tick: number
): string {
  const clamped = Math.max(0, Math.min(1, exitProgress));
  if (clamped >= 1) {
    return '';
  }
  const fullCluster = computeNanoBotDissolveFrame('Hari Nandan K.', 1, tick);
  const remaining = Math.max(0, Math.round(fullCluster.length * (1 - clamped)));
  const slice = fullCluster.slice(fullCluster.length - remaining);
  if (clamped > 0.12 && slice.length > 1) {
    const leadSpark = tick % 2 === 0 ? '◈' : '❖';
    return `${leadSpark}${slice.slice(1)}`;
  }
  return slice;
}

/**
 * Computes the letter-by-letter reassembly of "Hari Nandan K." as the 14 droplet packets
 * (dropletGroup 0..13) return to the navbar one by one from left to right.
 * Each droplet group g corresponds to character index g of "Hari Nandan K." (length = 14):
 * - Packet g launches at launchT = (g / 14) * 0.56 and docks at landT = 0.22 + (g / 13) * 0.74
 * - Once returnProgress >= landT, character g is locked in as its final crisp letter
 * - Just before locking (landT - 0.10 <= returnProgress < landT), slot g shimmers with
 *   a condensing nano-bot glyph ('◈', '⊹', '❖') right as the canvas droplet fuses into the letter!
 */
export function computeNanoBotReassembleFrame(
  sourceText: string,
  returnProgress: number,
  tick: number
): NanoBotLetterReassemblyState {
  const clamped = Math.max(0, Math.min(1, returnProgress));
  const totalChars = sourceText.length;

  if (clamped >= 1) {
    return {
      slots: sourceText.split('').map((ch) => ({
        char: ch,
        status: 'locked',
        displayChar: ch
      })),
      assembledText: sourceText,
      lockedCharCount: totalChars,
      activeFrontierIndex: -1,
      isComplete: true
    };
  }

  const slots: NanoBotLetterReassemblyState['slots'] = [];
  let lockedCharCount = 0;
  let activeFrontierIndex = -1;
  const assembledChars: string[] = [];

  for (let i = 0; i < totalChars; i++) {
    const normIdx = i / Math.max(1, totalChars - 1);
    const landThreshold = 0.22 + normIdx * 0.74;
    const condenseThreshold = Math.max(0.04, landThreshold - 0.11);

    if (clamped >= landThreshold) {
      slots.push({
        char: sourceText[i],
        status: 'locked',
        displayChar: sourceText[i]
      });
      assembledChars.push(sourceText[i]);
      lockedCharCount += 1;
    } else if (clamped >= condenseThreshold) {
      if (activeFrontierIndex === -1) {
        activeFrontierIndex = i;
      }
      const condenseGlyphs = ['◈', '⊹', '❖', '∷'];
      const glyph =
        sourceText[i] === ' '
          ? '·'
          : condenseGlyphs[(i * 3 + tick) % condenseGlyphs.length];
      slots.push({
        char: sourceText[i],
        status: 'condensing',
        displayChar: glyph
      });
    } else {
      slots.push({
        char: sourceText[i],
        status: 'pending',
        displayChar: sourceText[i]
      });
    }
  }

  return {
    slots,
    assembledText: assembledChars.join(''),
    lockedCharCount,
    activeFrontierIndex,
    isComplete: lockedCharCount >= totalChars
  };
}

/**
 * Initializes the collective swarm of 220 hydro-nano-bot elements partitioned into:
 * - 14 distinct cohesive droplet packets (dropletGroup = 0..13) for authentic drop-by-drop release & surface tension
 * - Three functional rings:
 *   1. 'inner' (56% of bots): Primary shape & hooking contour around the active keyword
 *   2. 'outer' (22% of bots): Secondary capillary halo & corner hook anchors
 *   3. 'pointer' (22% of bots): Cursor follower droplet cluster + single-file drop-by-drop pointer stream & arrowhead pointing to the nearest keyword
 */
export function createNanoBotSwarm(
  originX: number,
  originY: number,
  botCount = 220
): NanoBotAgent[] {
  const innerTotal = Math.round(botCount * 0.56);
  const outerTotal = Math.round(botCount * 0.22);
  const pointerTotal = Math.max(1, botCount - innerTotal - outerTotal);

  const bots: NanoBotAgent[] = [];
  const groupCounts = new Array<number>(TOTAL_DROPLET_GROUPS).fill(0);

  for (let i = 0; i < botCount; i++) {
    const dropletGroup = i % TOTAL_DROPLET_GROUPS;
    groupCounts[dropletGroup] += 1;
  }

  const groupIndices = new Array<number>(TOTAL_DROPLET_GROUPS).fill(0);

  for (let i = 0; i < botCount; i++) {
    const dropletGroup = i % TOTAL_DROPLET_GROUPS;
    const groupIndex = groupIndices[dropletGroup];
    groupIndices[dropletGroup] += 1;
    const groupTotal = groupCounts[dropletGroup];

    let ring: 'inner' | 'outer' | 'pointer' = 'inner';
    let ringIndex = i;
    let ringTotal = innerTotal;

    if (i >= innerTotal && i < innerTotal + outerTotal) {
      ring = 'outer';
      ringIndex = i - innerTotal;
      ringTotal = outerTotal;
    } else if (i >= innerTotal + outerTotal) {
      ring = 'pointer';
      ringIndex = i - innerTotal - outerTotal;
      ringTotal = pointerTotal;
    }

    const role: 'command' | 'droplet-core' | 'worker' =
      groupIndex === 0
        ? 'droplet-core'
        : i % 14 === 0
          ? 'command'
          : 'worker';

    const spreadX = originX - 58 + (i / Math.max(1, botCount - 1)) * 116;
    const spreadY = originY + Math.sin(i * 1.9) * 5;
    const radius =
      role === 'droplet-core'
        ? 2.8
        : role === 'command'
          ? 2.4
          : 1.55 + (i % 3) * 0.32;

    bots.push({
      id: i,
      x: spreadX,
      y: spreadY,
      vx: Math.cos(i) * 8,
      vy: Math.sin(i) * 8,
      tx: spreadX,
      ty: spreadY,
      angle: 0,
      radius,
      dropletGroup,
      groupIndex,
      groupTotal,
      role,
      ring,
      ringIndex,
      ringTotal,
      phase: (i / botCount) * Math.PI * 2,
      glyph: role === 'command' || role === 'droplet-core' ? '◈' : NANOBOT_GLYPHS[i % NANOBOT_GLYPHS.length]
    });
  }

  return bots;
}

/**
 * Computes the dramatic 3-phase breakout escape choreography while the nano-bots
 * tear loose from the "Hari Nandan K." navbar wordmark, surge across the glass navbar
 * interior with top/bottom boundary ricochets, pressurize & fracture the bottom glass
 * meniscus, and cascade out in 14 gravity-accelerated parabolic droplet arcs onto the screen!
 */
export function computeNavbarSwarmSeekFormation(
  navBarRect: NavBarContainerRect,
  seekProgress: number,
  timeSec: number
): ActiveSwarmFormation {
  const p = Math.max(0, Math.min(1, seekProgress));
  const startX = navBarRect.left + 98;
  const breachX = navBarRect.left + navBarRect.width * 0.74;
  const centerY = navBarRect.top + navBarRect.height * 0.52;
  const bottomBorderY = navBarRect.top + navBarRect.height;

  // PHASE 1 (p: 0.00 -> 0.42): High-Energy Dual-Vortex Corridor Surge & Glass-Rail Ricochet
  if (p < 0.42) {
    const t = p / 0.42;
    // Fast explosive launch from the wordmark that decelerates as it slams into the right breach zone
    const easeOut = 1 - Math.pow(1 - t, 2.4);
    const cx = startX + (breachX - startX) * easeOut;
    // Ricochet wave bouncing off top & bottom navbar glass borders
    const ricochetY = Math.sin(t * Math.PI * 3.5) * (navBarRect.height * 0.32);
    const cy = centerY + ricochetY;

    return {
      cx,
      cy,
      rx: 56 + Math.sin(t * Math.PI) * 28,
      ry: Math.max(12, navBarRect.height * 0.38),
      rawWidth: navBarRect.width,
      rawHeight: navBarRect.height,
      prevCx: startX,
      prevCy: centerY,
      prevRx: 46,
      prevRy: 12,
      pointerOriginX: startX,
      pointerOriginY: centerY,
      isCursorGuided: false,
      shapeMode: 'navbar-droplet-stream',
      targetLabel: 'NAVBAR · CONTAINMENT SURGE',
      transitionProgress: t,
      escapeBreachX: breachX,
      escapeBreachY: bottomBorderY,
      escapePressure: t * 0.45
    };
  }

  // PHASE 2 & 3 (p: 0.42 -> 1.00): Meniscus Breach Pressurization & 14-Droplet Waterfall Breakout Cascade
  const breachT = (p - 0.42) / 0.58; // 0..1 across the breach and waterfall escape
  const landingX = navBarRect.left + navBarRect.width * 0.46;
  const landingY = bottomBorderY + 135;

  // As breachT progresses from 0 -> 1, the collective center plunges from the navbar bottom border
  // down into the main Hero viewport with gravity acceleration
  const plungeEase = breachT * breachT;
  const cx = breachX + (landingX - breachX) * breachT;
  const cy = bottomBorderY + (landingY - bottomBorderY) * plungeEase + Math.sin(timeSec * 4.0) * 2.5;
  const rx = 28 + breachT * 46;
  const ry = 18 + breachT * 26;

  // Pressure peaks right at breach rupture (breachT ~ 0.22) and then vents as droplets cascade out
  const escapePressure =
    breachT < 0.25
      ? 0.45 + (breachT / 0.25) * 0.55
      : Math.max(0, 1 - (breachT - 0.25) / 0.75);

  return {
    cx,
    cy,
    rx,
    ry,
    rawWidth: navBarRect.width,
    rawHeight: navBarRect.height,
    prevCx: breachX,
    prevCy: bottomBorderY,
    prevRx: 26,
    prevRy: 14,
    pointerOriginX: breachX,
    pointerOriginY: bottomBorderY,
    isCursorGuided: false,
    shapeMode: 'navbar-escape-breach',
    targetLabel: 'BREACH · HYDRO ESCAPE',
    transitionProgress: breachT,
    escapeBreachX: breachX,
    escapeBreachY: bottomBorderY,
    escapePressure
  };
}

/**
 * Computes the smooth homing & letter-by-letter reassembly formation when the nano-bot
 * collective has finished covering the visible elements on screen and returns to the navbar
 * wordmark ("Hari Nandan K.") so each of the 14 droplet packets docks into its exact letter slot.
 */
export function computeNavbarSwarmReturnFormation(
  wordmarkRect: NavBarContainerRect,
  returnProgress: number,
  timeSec: number,
  fromCx: number,
  fromCy: number
): ActiveSwarmFormation {
  const p = Math.max(0, Math.min(1, returnProgress));
  const destCx = wordmarkRect.left + wordmarkRect.width * 0.5;
  const destCy = wordmarkRect.top + wordmarkRect.height * 0.5;
  const ease = p * p * (3 - 2 * p);

  return {
    cx: fromCx + (destCx - fromCx) * ease,
    cy: fromCy + (destCy - fromCy) * ease + Math.sin(timeSec * 2.4) * 1.2 * (1 - p),
    rx: Math.max(24, wordmarkRect.width * 0.5),
    ry: Math.max(12, wordmarkRect.height * 0.5),
    rawWidth: wordmarkRect.width,
    rawHeight: wordmarkRect.height,
    prevCx: fromCx,
    prevCy: fromCy,
    prevRx: 52,
    prevRy: 28,
    pointerOriginX: fromCx,
    pointerOriginY: fromCy,
    isCursorGuided: false,
    shapeMode: 'navbar-return-letter',
    targetLabel: 'HARI NANDAN K. · REASSEMBLY',
    transitionProgress: p,
    returnWordmarkLeft: wordmarkRect.left,
    returnWordmarkTop: wordmarkRect.top,
    returnWordmarkWidth: wordmarkRect.width,
    returnWordmarkHeight: wordmarkRect.height
  };
}

function computeSafeHaloRadii(width: number, height: number): { rx: number; ry: number } {
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  const rx = Math.max(36, halfW * 1.12 + 18);
  const ry = Math.max(22, halfH * 1.16 + 14);
  return { rx, ry };
}

/**
 * Selects the active must-see keyword in the viewport:
 * - When the visitor's cursor is active on screen (cursor.active === true), it finds the
 *   NEAREST important keyword to the cursor, anchors the pointer stream at the cursor,
 *   and directs the nano-bots to point at and hook/circle that nearest keyword.
 * - When the cursor is idle ("and by its own as well"), it sweeps through all visible
 *   must-see keywords in reading order (prioritizing uncovered elements first when
 *   coveredLabels is provided) so every visible element gets covered before returning home!
 */
export function selectActiveKeywordTarget(
  targets: KeywordTargetRect[],
  scrollY: number,
  viewportWidth: number,
  viewportHeight: number,
  timeSec: number,
  scrollVelocity: number,
  cursor?: CursorState,
  scrollSplitBlend = 0,
  coveredLabels?: ReadonlySet<string>,
  dwellDurationOverrideSec?: number
): ActiveSwarmFormation {
  const clampedSplit = Math.max(0, Math.min(1, scrollSplitBlend));
  const scrollDirection = scrollVelocity >= 0 ? 1 : -1;

  const visible = targets.filter(
    (t) =>
      t.top >= 68 &&
      t.top + t.height <= viewportHeight - 28 &&
      t.left >= 12 &&
      t.left + t.width <= viewportWidth - 12
  );

  if (visible.length === 0) {
    const fallbackX = cursor?.active ? cursor.x : viewportWidth * 0.38;
    const fallbackY = cursor?.active ? cursor.y : Math.min(viewportHeight * 0.36, 260);
    return {
      cx: fallbackX,
      cy: fallbackY,
      rx: 64,
      ry: 34,
      rawWidth: 110,
      rawHeight: 26,
      prevCx: fallbackX,
      prevCy: fallbackY,
      prevRx: 64,
      prevRy: 34,
      pointerOriginX: fallbackX - 90,
      pointerOriginY: fallbackY - 50,
      isCursorGuided: Boolean(cursor?.active),
      shapeMode: clampedSplit > 0.55 ? 'scroll-stream' : 'circle-orbit',
      targetLabel: 'INTELLIGENT SYSTEMS',
      transitionProgress: 1,
      viewportWidth,
      viewportHeight,
      scrollSplitBlend: clampedSplit,
      scrollDirection
    };
  }

  const shapeModes: NanoBotShapeMode[] = [
    'circle-orbit',
    'tactical-hook-brackets',
    'diamond-rhombus-cage',
    'helix-underline-cradle',
    'lemniscate-end-hooks'
  ];

  // Slow, unhurried 4.2-second dwell cycle per element so the nano-bots calmly form shapes around each element before gliding drop-by-drop to the next
  const dwellDurationSec = Math.max(0.35, dwellDurationOverrideSec ?? 4.2);
  const totalCycles = Math.floor(timeSec / dwellDurationSec);
  const cyclePhase = (timeSec % dwellDurationSec) / dwellDurationSec;

  // MODE A: CURSOR-GUIDED NEAREST KEYWORD SELECTION & POINTER (when not split to edges by active scrolling)
  if (cursor && cursor.active && clampedSplit < 0.75) {
    let nearest = visible[0];
    let bestScore = Number.POSITIVE_INFINITY;

    for (const t of visible) {
      const tcx = t.left + t.width * 0.5;
      const tcy = t.top + t.height * 0.5;
      const dist = Math.hypot(tcx - cursor.x, tcy - cursor.y);
      const weightedDist = dist - t.priority * 16;
      if (weightedDist < bestScore) {
        bestScore = weightedDist;
        nearest = t;
      }
    }

    const cx = nearest.left + nearest.width * 0.5;
    const cy = nearest.top + nearest.height * 0.5;
    const { rx, ry } = computeSafeHaloRadii(nearest.width, nearest.height);
    const shapeMode = shapeModes[Math.floor(timeSec / 5.4) % shapeModes.length];

    let rawDx = cursor.x - cx;
    let rawDy = cursor.y - cy;
    if (Math.hypot(rawDx, rawDy) < 6) {
      rawDx = -0.8;
      rawDy = -0.6;
    }
    const rayAngle = Math.atan2(rawDy, rawDx);
    const minSafeDistX = (rx + 46) * Math.cos(rayAngle);
    const minSafeDistY = (ry + 34) * Math.sin(rayAngle);
    const isInsideHalo =
      Math.pow(rawDx / (rx + 40), 2) + Math.pow(rawDy / (ry + 30), 2) < 1;

    const pointerOriginX = isInsideHalo ? cx + minSafeDistX : cursor.x;
    const pointerOriginY = isInsideHalo ? cy + minSafeDistY : cursor.y;

    return {
      cx,
      cy,
      rx,
      ry,
      rawWidth: nearest.width,
      rawHeight: nearest.height,
      prevCx: pointerOriginX,
      prevCy: pointerOriginY,
      prevRx: 30,
      prevRy: 30,
      pointerOriginX,
      pointerOriginY,
      isCursorGuided: true,
      shapeMode,
      targetLabel: nearest.label,
      transitionProgress: 1,
      viewportWidth,
      viewportHeight,
      scrollSplitBlend: clampedSplit,
      scrollDirection
    };
  }

  // MODE B: AUTONOMOUS FULL-COVERAGE KEYWORD SPOTLIGHTING & SLOW DROP-BY-DROP SHAPE MORPHING
  const focusZoneY = scrollY < 60 ? viewportHeight * 0.42 : viewportHeight * 0.46;
  const ranked = [...visible].sort((a, b) => {
    const scoreA = Math.abs(a.top + a.height * 0.5 - focusZoneY) - a.priority * 55;
    const scoreB = Math.abs(b.top + b.height * 0.5 - focusZoneY) - b.priority * 55;
    return scoreA - scoreB;
  });

  const candidatePool = ranked.slice(0, Math.min(10, ranked.length));
  let currIndex = totalCycles % candidatePool.length;

  // If coveredLabels is passed and the current cycle index is already covered while uncovered elements remain,
  // advance deterministically to the next uncovered element in candidatePool
  if (coveredLabels && coveredLabels.size > 0 && coveredLabels.has(candidatePool[currIndex].label)) {
    const nextUncoveredIdx = candidatePool.findIndex((t) => !coveredLabels.has(t.label));
    if (nextUncoveredIdx !== -1) {
      currIndex = nextUncoveredIdx;
    }
  }

  const prevIndex = (currIndex - 1 + candidatePool.length) % candidatePool.length;
  const chosen = candidatePool[currIndex];
  const prevChosen = candidatePool[prevIndex];

  const cx = chosen.left + chosen.width * 0.5;
  const cy = chosen.top + chosen.height * 0.5;
  const { rx, ry } = computeSafeHaloRadii(chosen.width, chosen.height);

  const prevCx = prevChosen.left + prevChosen.width * 0.5;
  const prevCy = prevChosen.top + prevChosen.height * 0.5;
  const { rx: prevRx, ry: prevRy } = computeSafeHaloRadii(
    prevChosen.width,
    prevChosen.height
  );

  const autoAngle = -Math.PI * 0.28 + Math.sin(timeSec * 0.24) * 0.35;
  const candidateOriginX = cx + (rx + 56) * Math.cos(autoAngle);
  const candidateOriginY = cy + (ry + 36) * Math.sin(autoAngle);
  const pointerOriginX =
    candidateOriginX > viewportWidth - 44
      ? cx - (rx + 56) * Math.abs(Math.cos(autoAngle))
      : Math.max(44, candidateOriginX);
  const pointerOriginY =
    candidateOriginY < 74
      ? cy + (ry + 36) * Math.abs(Math.sin(autoAngle))
      : Math.min(viewportHeight - 44, candidateOriginY);

  const subShapeOffset = cyclePhase > 0.62 ? 1 : 0;
  const baseShapeMode = shapeModes[(totalCycles * 2 + subShapeOffset) % shapeModes.length];
  const effectiveShapeMode =
    clampedSplit > 0.62 || Math.abs(scrollVelocity) > 42 ? 'scroll-stream' : baseShapeMode;

  return {
    cx,
    cy,
    rx,
    ry,
    rawWidth: chosen.width,
    rawHeight: chosen.height,
    prevCx,
    prevCy,
    prevRx,
    prevRy,
    pointerOriginX,
    pointerOriginY,
    isCursorGuided: false,
    shapeMode: effectiveShapeMode,
    targetLabel: chosen.label,
    transitionProgress: cyclePhase,
    viewportWidth,
    viewportHeight,
    scrollSplitBlend: clampedSplit,
    scrollDirection
  };
}

/**
 * Helper that computes the keyword-focused slot (pointer stream or perimeter shape/hook)
 * before blending with the full-viewport edge & corner split during scrolling.
 */
function computeKeywordFocusedSlot(
  bot: NanoBotAgent,
  formation: ActiveSwarmFormation,
  timeSec: number
): { x: number; y: number; tangentAngle: number } {
  const baseFrac = bot.ringIndex / Math.max(1, bot.ringTotal);

  // CURSOR FOLLOWER & DIRECTIONAL KEYWORD POINTER STREAM ('pointer' ring)
  if (bot.ring === 'pointer') {
    const originX = formation.pointerOriginX;
    const originY = formation.pointerOriginY;

    const toCenterDx = formation.cx - originX;
    const toCenterDy = formation.cy - originY;
    const toCenterAngle = Math.atan2(toCenterDy, toCenterDx);

    const boundaryTip = sampleKeywordShapePerimeter(
      formation.cx,
      formation.cy,
      formation.rx,
      formation.ry,
      formation.rawWidth,
      formation.rawHeight,
      toCenterAngle + Math.PI,
      'circle-orbit',
      1.12,
      timeSec
    );

    const tipX = boundaryTip.x;
    const tipY = boundaryTip.y;
    const vecX = tipX - originX;
    const vecY = tipY - originY;
    const vecLen = Math.hypot(vecX, vecY) || 1;
    const dirX = vecX / vecLen;
    const dirY = vecY / vecLen;
    const perpX = -dirY;
    const perpY = dirX;

    if (baseFrac < 0.34) {
      const localFrac = baseFrac / 0.34;
      const orbitTheta = localFrac * Math.PI * 2 + timeSec * 0.65;
      const orbitR = 8.5 + 1.4 * Math.sin(localFrac * Math.PI * 3 - timeSec * 1.2);
      return {
        x: originX + Math.cos(orbitTheta) * orbitR,
        y: originY + Math.sin(orbitTheta) * orbitR,
        tangentAngle: orbitTheta + Math.PI * 0.5
      };
    }

    if (baseFrac < 0.76) {
      const streamFrac = (baseFrac - 0.34) / 0.42;
      const rawFlowT = (streamFrac + timeSec * 0.14) % 1;
      const flowT = 0.12 + rawFlowT * 0.78;
      const lateralWave =
        Math.sin(rawFlowT * Math.PI * 2 - timeSec * 1.4) * 1.8 * Math.sin(rawFlowT * Math.PI);

      const x = originX + vecX * flowT + perpX * lateralWave;
      const y = originY + vecY * flowT + perpY * lateralWave;
      return { x, y, tangentAngle: toCenterAngle };
    }

    const arrowFrac = (baseFrac - 0.76) / 0.24;
    const wingSign = bot.ringIndex % 2 === 0 ? 1 : -1;
    const wingDepth = arrowFrac * 13;
    const wingSpread = arrowFrac * 7.5 * wingSign;
    const x = tipX - dirX * wingDepth + perpX * wingSpread;
    const y = tipY - dirY * wingDepth + perpY * wingSpread;
    return { x, y, tangentAngle: toCenterAngle };
  }

  // COLLECTIVE SHAPE & HOOKS AROUND THE KEYWORD ('inner' & 'outer' rings)
  const effectiveKeywordMode =
    formation.shapeMode === 'scroll-stream' ? 'circle-orbit' : formation.shapeMode;
  const isContinuousOrbit =
    effectiveKeywordMode === 'circle-orbit' || effectiveKeywordMode === 'diamond-rhombus-cage';
  const angularOffset = isContinuousOrbit
    ? timeSec * (bot.ring === 'inner' ? 0.22 : -0.15)
    : Math.sin(timeSec * 0.65 + bot.dropletGroup * 0.5) * 0.04;

  const theta = baseFrac * Math.PI * 2 + angularOffset;
  const ringMultiplier = bot.ring === 'inner' ? 1.0 : 1.12;

  const destSlot = sampleKeywordShapePerimeter(
    formation.cx,
    formation.cy,
    formation.rx,
    formation.ry,
    formation.rawWidth,
    formation.rawHeight,
    theta,
    effectiveKeywordMode,
    ringMultiplier,
    timeSec
  );

  const hasMovedKeyword =
    !formation.isCursorGuided &&
    Math.hypot(formation.cx - formation.prevCx, formation.cy - formation.prevCy) > 14;

  // Slow, deliberate drop-by-drop travel across the first 52% of the 4.2s dwell cycle
  if (hasMovedKeyword && formation.transitionProgress < 0.52) {
    const dropletDelay = (bot.dropletGroup / TOTAL_DROPLET_GROUPS) * 0.28;
    const dropletTravelSpan = 0.24;
    const localT = Math.max(
      0,
      Math.min(1, (formation.transitionProgress - dropletDelay) / dropletTravelSpan)
    );

    if (localT < 1) {
      const prevSlot = sampleKeywordShapePerimeter(
        formation.prevCx,
        formation.prevCy,
        formation.prevRx,
        formation.prevRy,
        formation.rawWidth,
        formation.rawHeight,
        theta,
        'circle-orbit',
        ringMultiplier,
        timeSec
      );

      const dropletTheta = (bot.dropletGroup / TOTAL_DROPLET_GROUPS) * Math.PI * 2;
      const dropletStart = sampleKeywordShapePerimeter(
        formation.prevCx,
        formation.prevCy,
        formation.prevRx,
        formation.prevRy,
        formation.rawWidth,
        formation.rawHeight,
        dropletTheta,
        'circle-orbit',
        1.0,
        timeSec
      );
      const dropletEnd = sampleKeywordShapePerimeter(
        formation.cx,
        formation.cy,
        formation.rx,
        formation.ry,
        formation.rawWidth,
        formation.rawHeight,
        dropletTheta,
        effectiveKeywordMode,
        1.0,
        timeSec
      );

      const ease = localT * localT * (3 - 2 * localT);
      const midX = (dropletStart.x + dropletEnd.x) * 0.5;
      const midY = (dropletStart.y + dropletEnd.y) * 0.5;
      const dx = dropletEnd.x - dropletStart.x;
      const dy = dropletEnd.y - dropletStart.y;
      const dist = Math.hypot(dx, dy) || 1;
      const normalX = -dy / dist;
      const normalY = dx / dist;

      const arcBow = Math.min(44, dist * 0.18) * (bot.dropletGroup % 2 === 0 ? 1 : -0.6);
      const ctrlX = midX + normalX * arcBow;
      const ctrlY = midY + normalY * arcBow;

      const oneMinus = 1 - ease;
      const dropCenterX =
        oneMinus * oneMinus * dropletStart.x +
        2 * oneMinus * ease * ctrlX +
        ease * ease * dropletEnd.x;
      const dropCenterY =
        oneMinus * oneMinus * dropletStart.y +
        2 * oneMinus * ease * ctrlY +
        ease * ease * dropletEnd.y;

      const pinch = Math.sin(localT * Math.PI);
      const subAngle = (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2 + timeSec * 1.4;
      const subR = bot.groupIndex === 0 ? 0 : 4.2;
      const beadX = dropCenterX + Math.cos(subAngle) * subR;
      const beadY = dropCenterY + Math.sin(subAngle) * subR;

      const unpinchedX = oneMinus * prevSlot.x + ease * destSlot.x;
      const unpinchedY = oneMinus * prevSlot.y + ease * destSlot.y;

      const x = unpinchedX * (1 - pinch * 0.85) + beadX * (pinch * 0.85);
      const y = unpinchedY * (1 - pinch * 0.85) + beadY * (pinch * 0.85);

      const tangentX = 2 * oneMinus * (ctrlX - dropletStart.x) + 2 * ease * (dropletEnd.x - ctrlX);
      const tangentY = 2 * oneMinus * (ctrlY - dropletStart.y) + 2 * ease * (dropletEnd.y - ctrlY);
      return { x, y, tangentAngle: Math.atan2(tangentY, tangentX) };
    }
  }

  return destSlot;
}

/**
 * Computes the target coordinate (tx, ty) for each of the 220 hydro-nano-bots:
 * - While scrolling (scrollSplitBlend > 0 or shapeMode === 'scroll-stream'), the 14 droplet packets
 *   split radially across the entire screen's 4 corners and 4 edges (top, bottom, left, right),
 *   creating a full-screen peripheral liquid frame.
 * - When scrolling stops, scrollSplitBlend decays slowly to 0 along a staggered cinematic
 *   S-curve with curved inward arcs and mid-flight droplet bead cohesion until all 14 packets
 *   softly merge back around the active keyword!
 */
export function computeNanoBotFormationSlot(
  bot: NanoBotAgent,
  formation: ActiveSwarmFormation,
  timeSec: number
): { x: number; y: number; tangentAngle: number } {
  const baseFrac = bot.ringIndex / Math.max(1, bot.ringTotal);

  // 1A. Dramatic Navbar Corridor Surge & Dual-Rail Ricochet ('navbar-droplet-stream')
  if (formation.shapeMode === 'navbar-droplet-stream') {
    const dropletFrac = bot.dropletGroup / TOTAL_DROPLET_GROUPS;
    const t = formation.transitionProgress;
    const streamLag = (1 - dropletFrac) * formation.rx * 1.85 * (1 - t * 0.45);
    const railParity = bot.dropletGroup % 2 === 0 ? 1 : -1;
    const bounceWave =
      Math.sin(dropletFrac * Math.PI * 4.0 - timeSec * 9.5) *
      formation.ry *
      0.88 *
      railParity;
    const clusterAngle =
      (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2 + timeSec * 4.2;
    const clusterR = bot.groupIndex === 0 ? 0 : 2.8 + (bot.groupIndex % 2) * 1.6;

    const x = formation.cx - streamLag + Math.cos(clusterAngle) * clusterR;
    const y = formation.cy + bounceWave + Math.sin(clusterAngle) * clusterR;
    const tangentAngle = Math.atan2(bounceWave * 0.35, 28);
    return { x, y, tangentAngle };
  }

  // 1B. Dramatic Navbar Breach Rupture & 14-Droplet Parabolic Gravity Escape ('navbar-escape-breach')
  if (formation.shapeMode === 'navbar-escape-breach') {
    const breachX = formation.escapeBreachX ?? formation.prevCx;
    const breachY = formation.escapeBreachY ?? formation.prevCy;
    const breachT = formation.transitionProgress;

    const dropletOrder = bot.dropletGroup / TOTAL_DROPLET_GROUPS;
    const releaseStart = 0.08 + dropletOrder * 0.44;
    const flightDuration = 0.46;
    const localDropT = (breachT - releaseStart) / flightDuration;

    if (localDropT <= 0) {
      const compressionRatio = Math.max(0, Math.min(1, breachT / Math.max(0.08, releaseStart)));
      const vortexAngle =
        dropletOrder * Math.PI * 2 +
        timeSec * (8.5 + compressionRatio * 6.0) +
        (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2;
      const vortexRx = (26 - compressionRatio * 14) * (0.45 + 0.55 * (bot.groupIndex / Math.max(1, bot.groupTotal)));
      const vortexRy = (10 - compressionRatio * 5.5) * (0.45 + 0.55 * (bot.groupIndex / Math.max(1, bot.groupTotal)));
      const meniscusBulgeY = compressionRatio * compressionRatio * 7.5;

      const x = breachX + Math.cos(vortexAngle) * vortexRx;
      const y = breachY - 4 + meniscusBulgeY + Math.sin(vortexAngle) * vortexRy;
      return { x, y, tangentAngle: vortexAngle + Math.PI * 0.5 };
    }

    const clampedFlight = Math.min(1, localDropT);
    const fanSpread = (dropletOrder - 0.5) * 2.0;
    const targetHeroSlot = sampleKeywordShapePerimeter(
      formation.cx,
      formation.cy,
      formation.rx,
      formation.ry,
      Math.max(90, formation.rx * 1.45),
      Math.max(36, formation.ry * 1.35),
      baseFrac * Math.PI * 2 + timeSec * 0.45,
      'circle-orbit',
      bot.ring === 'outer' ? 1.12 : 1.0,
      timeSec
    );

    const ease = clampedFlight * clampedFlight * (3 - 2 * clampedFlight);
    const gravityCurve = clampedFlight * clampedFlight;
    const fountainArcX = fanSpread * 68 * Math.sin(clampedFlight * Math.PI);
    const snapWhipY = -14 * Math.sin(clampedFlight * Math.PI) * (1 - clampedFlight);

    const dropCenterX = breachX + (targetHeroSlot.x - breachX) * ease + fountainArcX;
    const dropCenterY = breachY + (targetHeroSlot.y - breachY) * gravityCurve + snapWhipY;

    const pinch = Math.sin(clampedFlight * Math.PI);
    const subAngle = (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2 + timeSec * 3.5;
    const subR = bot.groupIndex === 0 ? 0 : 3.4 * (1 - 0.35 * pinch);
    const x = dropCenterX + Math.cos(subAngle) * subR * pinch;
    const y = dropCenterY + Math.sin(subAngle) * subR * pinch;

    const vxEst = (targetHeroSlot.x - breachX) + fanSpread * 68 * Math.cos(clampedFlight * Math.PI);
    const vyEst = 2 * clampedFlight * (targetHeroSlot.y - breachY);
    return { x, y, tangentAngle: Math.atan2(vyEst, vxEst) };
  }

  // 1B-2. Smooth Letter-by-Letter Homing & Reassembly into Navbar ("Hari Nandan K.")
  if (formation.shapeMode === 'navbar-return-letter') {
    const returnT = Math.max(0, Math.min(1, formation.transitionProgress));
    const wmLeft = formation.returnWordmarkLeft ?? formation.cx - 56;
    const wmTop = formation.returnWordmarkTop ?? formation.cy - 10;
    const wmWidth = Math.max(84, formation.returnWordmarkWidth ?? 112);
    const wmHeight = Math.max(16, formation.returnWordmarkHeight ?? 20);

    // Droplet group g (0..13) maps 1-to-1 to character index g of "Hari Nandan K." (14 chars)
    const charIndex = bot.dropletGroup;
    const normIdx = charIndex / Math.max(1, TOTAL_DROPLET_GROUPS - 1);
    const letterX = wmLeft + ((charIndex + 0.5) / TOTAL_DROPLET_GROUPS) * wmWidth;
    const letterY = wmTop + wmHeight * 0.5;

    // Synchronized with computeNanoBotReassembleFrame:
    // Each droplet packet g launches sequentially and docks at landThreshold = 0.22 + normIdx * 0.74
    const landThreshold = 0.22 + normIdx * 0.74;
    const flightSpan = 0.34;
    const launchStart = Math.max(0, landThreshold - flightSpan);
    const localFlightT = Math.max(
      0,
      Math.min(1, (returnT - launchStart) / Math.max(0.08, landThreshold - launchStart))
    );

    // Starting halo point around the last covered keyword before this droplet packet launches home
    const startAngle =
      (charIndex / TOTAL_DROPLET_GROUPS) * Math.PI * 2 +
      (bot.groupIndex / Math.max(1, bot.groupTotal)) * 0.45 +
      timeSec * 1.4;
    const startRx = formation.prevRx || 52;
    const startRy = formation.prevRy || 28;
    const startX = formation.prevCx + Math.cos(startAngle) * startRx;
    const startY = formation.prevCy + Math.sin(startAngle) * startRy;

    if (localFlightT <= 0) {
      return { x: startX, y: startY, tangentAngle: startAngle + Math.PI * 0.5 };
    }

    // Quintic S-curve (6t^5 - 15t^4 + 10t^3) for silky-smooth homing acceleration and soft letter docking
    const s =
      localFlightT *
      localFlightT *
      localFlightT *
      (localFlightT * (localFlightT * 6 - 15) + 10);

    const dx = letterX - startX;
    const dy = letterY - startY;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;

    // Sweeping upward Bezier arc into the navbar letter slot
    const arcSign = charIndex % 2 === 0 ? 1 : -0.75;
    const arcBow = Math.min(64, dist * 0.2) * arcSign;
    const ctrlX = (startX + letterX) * 0.5 + perpX * arcBow;
    const ctrlY = (startY + letterY) * 0.5 + perpY * arcBow - 18;

    const oneMinus = 1 - s;
    const curveX =
      oneMinus * oneMinus * startX + 2 * oneMinus * s * ctrlX + s * s * letterX;
    const curveY =
      oneMinus * oneMinus * startY + 2 * oneMinus * s * ctrlY + s * s * letterY;

    // As the droplet approaches its letter slot (s -> 1), micro-droplets spiral tightly into the letter center
    const subAngle =
      (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2 + timeSec * 4.5;
    const envelope = Math.sin(s * Math.PI) * 3.6 + (1 - s) * 1.8;
    const subR = bot.groupIndex === 0 ? 0 : envelope * (1 - s * 0.92);

    const x = curveX + Math.cos(subAngle) * subR;
    const y = curveY + Math.sin(subAngle) * subR;
    const tx = 2 * oneMinus * (ctrlX - startX) + 2 * s * (letterX - ctrlX);
    const ty = 2 * oneMinus * (ctrlY - startY) + 2 * s * (letterY - ctrlY);

    return { x, y, tangentAngle: Math.atan2(ty, tx) };
  }

  // Compute the normal keyword-focused destination slot
  const keywordSlot = computeKeywordFocusedSlot(bot, formation, timeSec);

  // 1C. Full-Screen Edge & Corner Split during Scrolling + Slow Cinematic Merge when Stopped
  const rawSplit =
    formation.scrollSplitBlend !== undefined
      ? formation.scrollSplitBlend
      : formation.shapeMode === 'scroll-stream'
        ? 1
        : 0;

  if (rawSplit > 0.004) {
    const vw = formation.viewportWidth || 1440;
    const vh = formation.viewportHeight || 900;
    const edgeSlot = computeViewportEdgeCornerSlot(
      bot,
      vw,
      vh,
      timeSec,
      formation.scrollDirection ?? 1
    );

    // Stagger each of the 14 droplet packets slightly during the slow cinematic merge
    // so droplets peel off the screen edges & corners wave-by-wave like liquid mercury!
    const groupStagger = (bot.dropletGroup / TOTAL_DROPLET_GROUPS) * 0.22;
    const localSplit = Math.max(
      0,
      Math.min(1, (rawSplit - groupStagger * (1 - rawSplit)) / (1 - groupStagger * 0.45))
    );

    // Quintic smoothstep S-curve (6t^5 - 15t^4 + 10t^3) for ultra-cinematic slow acceleration & deceleration
    const s =
      localSplit *
      localSplit *
      localSplit *
      (localSplit * (localSplit * 6 - 15) + 10);

    // Curved inward/outward quadratic Bezier trajectory between the keyword and the screen edge/corner
    const dx = edgeSlot.x - keywordSlot.x;
    const dy = edgeSlot.y - keywordSlot.y;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;

    // Sweeping cinematic arc bow during split/merge transition
    const arcSign = bot.dropletGroup % 2 === 0 ? 1 : -1;
    const arcMagnitude = Math.min(72, dist * 0.22) * arcSign;
    const midX = (keywordSlot.x + edgeSlot.x) * 0.5 + perpX * arcMagnitude;
    const midY = (keywordSlot.y + edgeSlot.y) * 0.5 + perpY * arcMagnitude;

    const oneMinus = 1 - s;
    const curveX =
      oneMinus * oneMinus * keywordSlot.x +
      2 * oneMinus * s * midX +
      s * s * edgeSlot.x;
    const curveY =
      oneMinus * oneMinus * keywordSlot.y +
      2 * oneMinus * s * midY +
      s * s * edgeSlot.y;

    // Cohesive water-droplet surface-tension pinch at mid-merge (s ~ 0.5)
    const midFlightPinch = Math.sin(s * Math.PI);
    const subAngle = (bot.groupIndex / Math.max(1, bot.groupTotal)) * Math.PI * 2 + timeSec * 2.1;
    const subR = bot.groupIndex === 0 ? 0 : 3.2 * midFlightPinch;

    const x = curveX + Math.cos(subAngle) * subR;
    const y = curveY + Math.sin(subAngle) * subR;
    const tangentAngle =
      s > 0.85
        ? edgeSlot.tangentAngle
        : s < 0.15
          ? keywordSlot.tangentAngle
          : Math.atan2(dy, dx);

    return { x, y, tangentAngle };
  }

  return keywordSlot;
}

/**
 * Advances all 220 hydro-nano-bots with slow, viscous, water-like SPH surface-tension
 * cohesion, subtle incompressible curl-wave shimmer when still, and cinematic slow-merge
 * physics when converging from the screen edges and corners after scrolling stops.
 */
export function stepNanoBotSwarmPhysics(
  prevBots: NanoBotAgent[],
  formation: ActiveSwarmFormation,
  dt: number,
  timeSec: number
): NanoBotAgent[] {
  if (prevBots.length === 0) return [];
  const clampedDt = Math.max(0.004, Math.min(0.045, dt));
  const nextBots: NanoBotAgent[] = prevBots.map((b) => ({ ...b }));
  const splitBlend = formation.scrollSplitBlend ?? 0;
  const isCinematicMergeActive = splitBlend > 0.01 && splitBlend < 0.88;

  // 1. Compute droplet group centroids for SPH water surface-tension cohesion during transit
  const groupCentroids = Array.from({ length: TOTAL_DROPLET_GROUPS }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    count: 0
  }));

  for (let i = 0; i < nextBots.length; i++) {
    const b = nextBots[i];
    const g = groupCentroids[b.dropletGroup];
    g.x += b.x;
    g.y += b.y;
    g.vx += b.vx;
    g.vy += b.vy;
    g.count += 1;
  }

  for (let gIdx = 0; gIdx < TOTAL_DROPLET_GROUPS; gIdx++) {
    const g = groupCentroids[gIdx];
    if (g.count > 0) {
      g.x /= g.count;
      g.y /= g.count;
      g.vx /= g.count;
      g.vy /= g.count;
    }
  }

  // 2. Step each hydro-nano-bot with slow, viscous water dynamics
  for (let i = 0; i < nextBots.length; i++) {
    const bot = nextBots[i];
    const slot = computeNanoBotFormationSlot(bot, formation, timeSec);

    // Subtle 0.85px incompressible capillary shimmer so bots feel alive when still without breaking shape geometry
    const curlAngle =
      Math.sin(bot.x * 0.016 + timeSec * 1.1) * Math.cos(bot.y * 0.016 - timeSec * 0.85) * Math.PI * 2;
    const microRippleX = Math.cos(curlAngle + bot.phase) * 0.85;
    const microRippleY = Math.sin(curlAngle + bot.phase) * 0.85;

    const targetX = slot.x + microRippleX;
    const targetY = slot.y + microRippleY;
    bot.tx = targetX;
    bot.ty = targetY;

    const dx = targetX - bot.x;
    const dy = targetY - bot.y;
    const dist = Math.hypot(dx, dy);

    const isHighEnergyNavbarStage =
      formation.shapeMode === 'navbar-droplet-stream' ||
      formation.shapeMode === 'navbar-escape-breach';
    const isReturningHomeStage = formation.shapeMode === 'navbar-return-letter';

    // Calm, slow, unhurried spring attraction when covering elements on screen
    const springStiffness = isHighEnergyNavbarStage
      ? dist < 50
        ? 28.0
        : 15.5
      : isReturningHomeStage
        ? 14.0
        : isCinematicMergeActive
          ? 10.0
          : dist < 50
            ? 13.5
            : 8.2;
    let ax = dx * springStiffness;
    let ay = dy * springStiffness;

    // Intra-droplet surface-tension cohesion + viscous velocity blending while a droplet is in flight
    const g = groupCentroids[bot.dropletGroup];
    if ((dist > 20 || isCinematicMergeActive || isReturningHomeStage) && g.count > 0) {
      const cohStrength =
        isCinematicMergeActive || isReturningHomeStage
          ? 7.4
          : Math.min(1, (dist - 20) / 85) * 6.4;
      ax += (g.x - bot.x) * cohStrength + (g.vx - bot.vx) * 2.6;
      ay += (g.y - bot.y) * cohStrength + (g.vy - bot.vy) * 2.6;
    }

    // Apply gentle liquid pressure separation ONLY when in transit (dist > 14px)
    if (dist > 14) {
      const minSep = 3.8;
      const windowSpan = 18;
      const startJ = Math.max(0, i - windowSpan);
      const endJ = Math.min(nextBots.length - 1, i + windowSpan);
      for (let j = startJ; j <= endJ; j++) {
        if (i === j) continue;
        const other = nextBots[j];
        const sdx = bot.x - other.x;
        const sdy = bot.y - other.y;
        const sDistSq = sdx * sdx + sdy * sdy;
        if (sDistSq > 0.01 && sDistSq < minSep * minSep) {
          const sDist = Math.sqrt(sDistSq);
          const push = ((minSep - sDist) / minSep) * 52;
          ax += (sdx / sDist) * push;
          ay += (sdy / sDist) * push;
        }
      }
    }

    // High viscous damping for calm, slow liquid motion
    const damping = Math.exp(
      (isHighEnergyNavbarStage ? -6.2 : isCinematicMergeActive ? -6.0 : -7.2) * clampedDt
    );
    bot.vx = (bot.vx + ax * clampedDt) * damping;
    bot.vy = (bot.vy + ay * clampedDt) * damping;

    const speed = Math.hypot(bot.vx, bot.vy);
    const maxSpeed = isHighEnergyNavbarStage
      ? 420
      : isReturningHomeStage
        ? 290
        : isCinematicMergeActive
          ? 260
          : 210;
    if (speed > maxSpeed) {
      bot.vx = (bot.vx / speed) * maxSpeed;
      bot.vy = (bot.vy / speed) * maxSpeed;
    }

    bot.x += bot.vx * clampedDt;
    bot.y += bot.vy * clampedDt;

    // Smooth, slow viscous positional convergence
    const lockBlend = isHighEnergyNavbarStage
      ? Math.min(1, 6.8 * clampedDt)
      : isReturningHomeStage
        ? Math.min(1, 4.4 * clampedDt)
        : isCinematicMergeActive
          ? Math.min(1, 2.8 * clampedDt)
          : dist < 70
            ? Math.min(1, 3.8 * clampedDt)
            : Math.min(1, 2.2 * clampedDt);
    bot.x += (targetX - bot.x) * lockBlend;
    bot.y += (targetY - bot.y) * lockBlend;

    if (dist > 16 && speed > 18) {
      bot.angle = Math.atan2(bot.vy, bot.vx);
    } else {
      bot.angle = slot.tangentAngle;
    }
  }

  return nextBots;
}
