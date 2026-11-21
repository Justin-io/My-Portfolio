import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECTS,
  parseRoute,
  filterProjects,
  getProjectBySlug,
  getAdjacentProjects,
  getVoideChillerTelemetry,
  simulateJarvisRouting,
  validateContactInquiry
} from './portfolioLogic';
import {
  computeAsciiMorphFrame,
  computeNavbarSlitherExitFrame,
  computeNavbarSeekTargetPoint,
  createSnakeSpine,
  computeHeadingTargetPoint,
  stepSnakePhysics
} from './asciiSnakePhysics';
import {
  computeNanoBotDissolveFrame,
  computeNanoBotFormationSlot,
  computeNanoBotNavbarExitFrame,
  computeNanoBotReassembleFrame,
  computeNavbarSwarmReturnFormation,
  computeNavbarSwarmSeekFormation,
  computeViewportEdgeCornerSlot,
  createNanoBotSwarm,
  sampleKeywordShapePerimeter,
  selectActiveKeywordTarget,
  stepNanoBotSwarmPhysics
} from './nanoBotSwarmPhysics';
import { EXPLORATION_DOMAINS, CAPABILITY_GROUPS } from '../data/domainsAndCapabilities';
import { EXPERIENCE_ENTRIES, ENGINEERING_NOTES } from '../data/experienceAndNotes';

test('parseRoute resolves all required portfolio routes accurately', () => {
  assert.deepEqual(parseRoute('/'), { page: 'home' });
  assert.deepEqual(parseRoute('/projects'), { page: 'projects' });
  assert.deepEqual(parseRoute('/projects/orion-x-r1'), {
    page: 'project-detail',
    slug: 'orion-x-r1'
  });
  assert.deepEqual(parseRoute('/projects/voide/'), {
    page: 'project-detail',
    slug: 'voide'
  });
  assert.deepEqual(parseRoute('/about'), { page: 'about' });
  assert.deepEqual(parseRoute('/contact'), { page: 'contact' });
});

test('all 5 flagship projects exist with honest maturity classifications and zero HOPE data', () => {
  assert.equal(PROJECTS.length, 5);
  const slugs = PROJECTS.map((p) => p.slug);
  assert.deepEqual(slugs, [
    'autonomous-ai-data-scientist',
    'rag-evaluation-platform',
    'voide',
    'orion-x-r1',
    'jarvis'
  ]);

  // Verify zero HOPE or H-MARK-01 references exist anywhere in data
  const allSerialized = JSON.stringify({
    PROJECTS,
    EXPLORATION_DOMAINS,
    CAPABILITY_GROUPS,
    EXPERIENCE_ENTRIES,
    ENGINEERING_NOTES
  }).toLowerCase();
  assert.equal(allSerialized.includes('h-mark-01'), false);
  assert.equal(allSerialized.includes('hope iot'), false);
  assert.equal(allSerialized.includes('hope int'), false);

  const orion = getProjectBySlug(PROJECTS, 'orion-x-r1');
  assert.ok(orion);
  assert.equal(orion.maturity, 'Design Study');
  assert.ok(orion.techStack.includes('AMD Kintex-7 XC7K160T'));
});

test('filterProjects filters by category group and search keyword', () => {
  const hardwareProjects = filterProjects(PROJECTS, 'hardware');
  assert.equal(hardwareProjects.length, 1);
  assert.deepEqual(
    hardwareProjects.map((p) => p.slug),
    ['orion-x-r1']
  );

  const kintexSearch = filterProjects(PROJECTS, 'all', 'XC7K160T');
  assert.equal(kintexSearch.length, 1);
  assert.equal(kintexSearch[0].slug, 'orion-x-r1');
});

test('getAdjacentProjects wraps cleanly around the 5 flagship case studies', () => {
  const firstAdj = getAdjacentProjects(PROJECTS, 'autonomous-ai-data-scientist');
  assert.equal(firstAdj.previous.slug, 'jarvis');
  assert.equal(firstAdj.next.slug, 'rag-evaluation-platform');
});

test('getVoideChillerTelemetry preserves verified V.O.I.D.E. dataset figures', () => {
  const c1 = getVoideChillerTelemetry('CHILLER-01');
  const c2 = getVoideChillerTelemetry('CHILLER-02');
  const c3 = getVoideChillerTelemetry('CHILLER-03');

  assert.equal(c1.totalDatasetRecords, 25003);
  assert.equal(c1.recordSliceCount + c2.recordSliceCount + c3.recordSliceCount, 25003);
  assert.equal(c1.channelCount, 11);
  assert.equal(c1.channels.length, 11);
  assert.equal(c1.datasetQualityScore, 90.4);
  assert.equal(c1.ridgeR2, 0.9896);
});

test('simulateJarvisRouting assigns deterministic, local LLM, and sanitized cloud tiers', () => {
  const t1 = simulateJarvisRouting('check git status and active port', true);
  assert.equal(t1.tier, 'Tier 1 — Deterministic Local');

  const t2 = simulateJarvisRouting('summarize this python log traceback', true);
  assert.equal(t2.tier, 'Tier 2 — Local LLM (Ollama / llama.cpp)');

  const t3Allowed = simulateJarvisRouting('compare distributed architecture trade-offs', true);
  assert.equal(t3Allowed.tier, 'Tier 3 — Sanitized Cloud Fallback');

  const t3Blocked = simulateJarvisRouting('compare distributed architecture trade-offs', false);
  assert.equal(t3Blocked.tier, 'Tier 2 — Local LLM (Ollama / llama.cpp)');
});

test('validateContactInquiry enforces required fields and builds mailto URI when valid', () => {
  const invalid = validateContactInquiry({
    name: '',
    email: 'not-an-email',
    subject: '',
    message: 'short'
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const valid = validateContactInquiry({
    name: 'Arjun Menon',
    email: 'arjun@example.com',
    subject: 'Systems & AI Collaboration',
    message: 'Would love to discuss your ORION-X R1 and V.O.I.D.E. engineering case studies.'
  });
  assert.equal(valid.valid, true);
  assert.ok(valid.mailtoHref?.startsWith('mailto:harinandhan972@gmail.com?subject='));
});

test('computeAsciiMorphFrame transitions Hari Nandan K. into a hyper-detailed ASCII snake and slithers out during navbar-seek', () => {
  const initial = computeAsciiMorphFrame('Hari Nandan K.', 0, 0);
  assert.equal(initial, 'Hari Nandan K.');

  const midMorph = computeAsciiMorphFrame('Hari Nandan K.', 0.5, 3);
  assert.notEqual(midMorph, 'Hari Nandan K.');
  assert.ok(midMorph.length >= 14);

  const fullSnake = computeAsciiMorphFrame('Hari Nandan K.', 1, 2);
  assert.ok(fullSnake.includes('⟪º◈º⟫'));
  assert.ok(fullSnake.includes('~'));

  const halfExited = computeNavbarSlitherExitFrame(0.5, 2);
  assert.ok(halfExited.length > 0 && halfExited.length < fullSnake.length);
  const fullyExited = computeNavbarSlitherExitFrame(1, 2);
  assert.equal(fullyExited, '');

  const navRect = { left: 100, top: 16, width: 1200, height: 56 };
  const seekStart = computeNavbarSeekTargetPoint(navRect, 0.1, 1.0);
  const seekMid = computeNavbarSeekTargetPoint(navRect, 0.5, 1.5);
  const seekExit = computeNavbarSeekTargetPoint(navRect, 0.98, 2.2);

  assert.equal(seekStart.mode, 'navbar-seek');
  assert.ok(seekMid.x > seekStart.x);
  assert.ok(seekExit.y > navRect.top + navRect.height);
});

test('createSnakeSpine, computeHeadingTargetPoint, and stepSnakePhysics simulate heading crawl and spiral coils', () => {
  const spine = createSnakeSpine(160, 32, 44, 9.2);
  assert.equal(spine.length, 44);
  assert.equal(spine[0].dorsalGlyph, '◈');

  const headings = [
    { id: 'h-0', text: 'Hari Nandan K.', top: 210, left: 80, width: 520, height: 110 },
    { id: 'h-1', text: 'Selected Work.', top: 760, left: 80, width: 420, height: 64 }
  ];

  // Crawl phase above main heading (cyclePhase < 0.58)
  const crawlTarget = computeHeadingTargetPoint(headings, 120, 1440, 900, 1.5, 2, { x: 140, y: 28 });
  assert.equal(crawlTarget.mode, 'heading-crawl');
  assert.equal(crawlTarget.activeHeadingText, 'Hari Nandan K.');
  assert.ok(crawlTarget.y < headings[0].top);

  // Spiral phase above main heading (cyclePhase >= 0.58)
  const spiralTarget = computeHeadingTargetPoint(headings, 120, 1440, 900, 6.2, 2, { x: 140, y: 28 });
  assert.equal(spiralTarget.mode, 'heading-spiral');
  assert.ok(spiralTarget.spiralPhase > 0);

  // Advance physics solver and verify head moves toward target while maintaining 44 vertebrae
  const stepped = stepSnakePhysics(spine, { x: crawlTarget.x, y: crawlTarget.y }, 0.016, 1.5, crawlTarget.mode, 9.2);
  assert.equal(stepped.length, 44);
  const initialDist = Math.hypot(crawlTarget.x - spine[0].x, crawlTarget.y - spine[0].y);
  const newDist = Math.hypot(crawlTarget.x - stepped[0].x, crawlTarget.y - stepped[0].y);
  assert.ok(newDist < initialDist);
});

test('nanoBotSwarmPhysics creates 220 hydro-droplet bots, hooks keywords with multiple shapes, and points from cursor or autonomous cluster', () => {
  assert.equal(computeNanoBotDissolveFrame('Hari Nandan K.', 0, 0), 'Hari Nandan K.');
  const dissolved = computeNanoBotDissolveFrame('Hari Nandan K.', 1, 2);
  assert.notEqual(dissolved, 'Hari Nandan K.');
  assert.equal(computeNanoBotNavbarExitFrame(1, 2), '');

  const swarm = createNanoBotSwarm(160, 30, 220);
  assert.equal(swarm.length, 220);
  assert.equal(swarm.filter((b) => b.role === 'droplet-core').length, 14);
  assert.ok(swarm.filter((b) => b.ring === 'pointer').length > 40);

  const navRect = { left: 100, top: 16, width: 1200, height: 54 };
  const navSeek = computeNavbarSwarmSeekFormation(navRect, 0.25, 1.0);
  assert.equal(navSeek.shapeMode, 'navbar-droplet-stream');

  const navBreach = computeNavbarSwarmSeekFormation(navRect, 0.72, 1.5);
  assert.equal(navBreach.shapeMode, 'navbar-escape-breach');
  assert.ok((navBreach.escapePressure ?? 0) > 0);
  assert.ok(navBreach.cy > navRect.top + navRect.height);

  // Verify all 5 geometric & hooking shape samplers
  const shapeModes = [
    'circle-orbit',
    'tactical-hook-brackets',
    'diamond-rhombus-cage',
    'helix-underline-cradle',
    'lemniscate-end-hooks'
  ] as const;
  for (const mode of shapeModes) {
    const pt = sampleKeywordShapePerimeter(300, 200, 110, 28, 180, 28, Math.PI * 0.25, mode, 1.0, 1.5);
    assert.ok(Number.isFinite(pt.x) && Number.isFinite(pt.y));
  }

  const keywords = [
    { id: 'kw-0', label: 'intelligent systems', priority: 3, left: 160, top: 380, width: 185, height: 28 },
    { id: 'kw-1', label: 'software, data, and hardware', priority: 3, left: 420, top: 380, width: 260, height: 28 }
  ];

  // Autonomous mode (no active cursor)
  const autoFormation = selectActiveKeywordTarget(keywords, 0, 1440, 900, 0.5, 0);
  assert.equal(autoFormation.targetLabel, 'intelligent systems');
  assert.equal(autoFormation.isCursorGuided, false);
  assert.ok(autoFormation.rx > 185 * 0.5);

  // Cursor-guided mode pointing from outside halo to nearest important keyword ('software, data, and hardware')
  const cursorFormation = selectActiveKeywordTarget(keywords, 0, 1440, 900, 0.5, 0, {
    x: 620,
    y: 310,
    active: true
  });
  assert.equal(cursorFormation.targetLabel, 'software, data, and hardware');
  assert.equal(cursorFormation.isCursorGuided, true);
  assert.equal(cursorFormation.pointerOriginX, 620);
  assert.equal(cursorFormation.pointerOriginY, 310);

  // When cursor is directly over the keyword text, pointerOrigin projects outside the keyword halo
  const insideCursorFormation = selectActiveKeywordTarget(keywords, 0, 1440, 900, 0.5, 0, {
    x: 550,
    y: 394,
    active: true
  });
  assert.equal(insideCursorFormation.targetLabel, 'software, data, and hardware');
  assert.ok(
    Math.hypot(
      insideCursorFormation.pointerOriginX - insideCursorFormation.cx,
      insideCursorFormation.pointerOriginY - insideCursorFormation.cy
    ) > insideCursorFormation.ry
  );

  const steppedBots = stepNanoBotSwarmPhysics(swarm, cursorFormation, 0.02, 0.5);
  assert.equal(steppedBots.length, 220);
  const prevDist = Math.hypot(cursorFormation.cx - swarm[0].x, cursorFormation.cy - swarm[0].y);
  const nextDist = Math.hypot(cursorFormation.cx - steppedBots[0].x, cursorFormation.cy - steppedBots[0].y);
  assert.ok(nextDist < prevDist);

  // Verify full-screen edge & corner split while scrolling (scrollSplitBlend = 1) and slow cinematic merge (scrollSplitBlend = 0.5 -> 0)
  const splitFormation = selectActiveKeywordTarget(keywords, 200, 1440, 900, 1.0, 120, undefined, 1.0);
  assert.equal(splitFormation.scrollSplitBlend, 1.0);
  assert.equal(splitFormation.shapeMode, 'scroll-stream');

  // Corner group 0 (Top-Left), Corner group 2 (Bottom-Right), Left Edge group 5, Right Edge group 8, Top Edge group 10, Bottom Edge group 12
  const tlBot = swarm.find((b) => b.dropletGroup === 0 && b.groupIndex === 0)!;
  const brBot = swarm.find((b) => b.dropletGroup === 2 && b.groupIndex === 0)!;
  const leftEdgeBot = swarm.find((b) => b.dropletGroup === 5)!;
  const rightEdgeBot = swarm.find((b) => b.dropletGroup === 8)!;
  const topEdgeBot = swarm.find((b) => b.dropletGroup === 10)!;
  const bottomEdgeBot = swarm.find((b) => b.dropletGroup === 12)!;

  const tlCornerSlot = computeViewportEdgeCornerSlot(tlBot, 1440, 900, 1.0, 1);
  const brCornerSlot = computeViewportEdgeCornerSlot(brBot, 1440, 900, 1.0, 1);
  const leftEdgeSlot = computeViewportEdgeCornerSlot(leftEdgeBot, 1440, 900, 1.0, 1);
  const rightEdgeSlot = computeViewportEdgeCornerSlot(rightEdgeBot, 1440, 900, 1.0, 1);
  const topEdgeSlot = computeViewportEdgeCornerSlot(topEdgeBot, 1440, 900, 1.0, 1);
  const bottomEdgeSlot = computeViewportEdgeCornerSlot(bottomEdgeBot, 1440, 900, 1.0, 1);

  assert.ok(tlCornerSlot.x < 60 && tlCornerSlot.y < 60);
  assert.ok(brCornerSlot.x > 1380 && brCornerSlot.y > 840);
  assert.ok(leftEdgeSlot.x < 60);
  assert.ok(rightEdgeSlot.x > 1380);
  assert.ok(topEdgeSlot.y < 60);
  assert.ok(bottomEdgeSlot.y > 840);

  // Mid-merge (scrollSplitBlend = 0.5) interpolates smoothly along a curved arc between the screen corner and the keyword
  const midMergeFormation = selectActiveKeywordTarget(keywords, 200, 1440, 900, 1.0, 0, undefined, 0.5);
  const fullSplitPos = computeNanoBotFormationSlot(tlBot, splitFormation, 1.0);
  const midMergePos = computeNanoBotFormationSlot(tlBot, midMergeFormation, 1.0);
  const mergedPos = computeNanoBotFormationSlot(tlBot, autoFormation, 1.0);

  assert.ok(midMergePos.x > fullSplitPos.x && midMergePos.x < mergedPos.x + 80);
  assert.ok(midMergePos.y > fullSplitPos.y && midMergePos.y < mergedPos.y + 80);

  // Verify uncovered-element prioritization in selectActiveKeywordTarget
  const coveredSet = new Set<string>(['intelligent systems']);
  const nextUncoveredFormation = selectActiveKeywordTarget(
    keywords,
    0,
    1440,
    900,
    0.5,
    0,
    undefined,
    0,
    coveredSet
  );
  assert.equal(nextUncoveredFormation.targetLabel, 'software, data, and hardware');

  // Verify letter-by-letter reassembly of "Hari Nandan K." as the 14 droplet packets return home
  const startReassembly = computeNanoBotReassembleFrame('Hari Nandan K.', 0.05, 0);
  assert.equal(startReassembly.lockedCharCount, 0);
  assert.equal(startReassembly.assembledText, '');
  assert.equal(startReassembly.isComplete, false);

  const firstLetterReassembly = computeNanoBotReassembleFrame('Hari Nandan K.', 0.25, 1);
  assert.equal(firstLetterReassembly.assembledText, 'H');
  assert.equal(firstLetterReassembly.lockedCharCount, 1);
  assert.equal(firstLetterReassembly.slots[0].status, 'locked');
  assert.equal(firstLetterReassembly.slots[1].status, 'condensing');

  const midReassembly = computeNanoBotReassembleFrame('Hari Nandan K.', 0.55, 2);
  assert.ok('Hari Nandan K.'.startsWith(midReassembly.assembledText));
  assert.ok(midReassembly.lockedCharCount >= 5 && midReassembly.lockedCharCount < 14);

  const completeReassembly = computeNanoBotReassembleFrame('Hari Nandan K.', 1.0, 3);
  assert.equal(completeReassembly.assembledText, 'Hari Nandan K.');
  assert.equal(completeReassembly.lockedCharCount, 14);
  assert.equal(completeReassembly.isComplete, true);

  // Verify 14 droplet packets dock left-to-right across the navbar wordmark during 'navbar-return-letter'
  const wordmarkRect = { left: 134, top: 20, width: 112, height: 22 };
  const returnDoneFormation = computeNavbarSwarmReturnFormation(wordmarkRect, 1.0, 2.0, 420, 360);
  assert.equal(returnDoneFormation.shapeMode, 'navbar-return-letter');

  const firstLetterBot = swarm.find((b) => b.dropletGroup === 0 && b.groupIndex === 0)!;
  const lastLetterBot = swarm.find((b) => b.dropletGroup === 13 && b.groupIndex === 0)!;
  const firstLetterSlot = computeNanoBotFormationSlot(firstLetterBot, returnDoneFormation, 2.0);
  const lastLetterSlot = computeNanoBotFormationSlot(lastLetterBot, returnDoneFormation, 2.0);

  assert.ok(firstLetterSlot.x > wordmarkRect.left && firstLetterSlot.x < wordmarkRect.left + 20);
  assert.ok(
    lastLetterSlot.x > wordmarkRect.left + wordmarkRect.width - 20 &&
      lastLetterSlot.x < wordmarkRect.left + wordmarkRect.width
  );
  assert.ok(Math.abs(firstLetterSlot.y - (wordmarkRect.top + wordmarkRect.height * 0.5)) < 2);
});



