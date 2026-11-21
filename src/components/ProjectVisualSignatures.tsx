import React, { useState } from 'react';
import { ProjectCaseStudy } from '../data/projects';
import {
  ChillerEntityId,
  getVoideChillerTelemetry,
  simulateJarvisRouting
} from '../utils/portfolioLogic';

interface VisualSignatureProps {
  project: ProjectCaseStudy;
  compact?: boolean;
}

export const ProjectVisualSignature: React.FC<VisualSignatureProps> = ({
  project,
  compact = false
}) => {
  switch (project.visualSignature) {
    case 'workflow-pipeline':
      return <AutonomousWorkflowVisual project={project} compact={compact} />;
    case 'rag-retrieval':
      return <RagEvaluationVisual project={project} compact={compact} />;
    case 'voide-telemetry':
      return <VoideTelemetryVisual compact={compact} />;
    case 'orion-fpga':
      return <OrionFpgaVisual project={project} compact={compact} />;
    case 'jarvis-router':
      return <JarvisRouterVisual compact={compact} />;
    default:
      return null;
  }
};

/* 01. AUTONOMOUS AI DATA SCIENTIST — 7-STAGE DETERMINISTIC WORKFLOW */
const AutonomousWorkflowVisual: React.FC<{
  project: ProjectCaseStudy;
  compact: boolean;
}> = ({ project, compact }) => {
  const [activeIdx, setActiveIdx] = useState(1); // Default to Stage 02: Data Profiling
  const activeNode = project.architectureNodes[activeIdx] || project.architectureNodes[0];

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
        <span className="font-mono text-xs text-[#E4E4E7]">
          7-STAGE ANALYTICAL WORKFLOW ARCHITECTURE
        </span>
        <span className="font-mono text-xs text-[#71717A]">
          BOUNDED RETRY CAP: 3 ITERATIONS
        </span>
      </div>

      {/* Interactive Stage Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {project.architectureNodes.map((node, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`text-left p-2.5 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-[#FFFFFF] ${
                isSelected
                  ? 'bg-white/15 border-[#FFFFFF] text-[#FFFFFF]'
                  : 'bg-[#000000] border-white/15 text-[#A1A1AA] hover:border-white/35'
              }`}
            >
              <p className="font-mono text-[11px] text-[#E4E4E7]">STAGE 0{idx + 1}</p>
              <p className="text-xs font-medium text-[#FFFFFF] mt-0.5 truncate">
                {node.label.replace(/^0\d\.\s*/, '')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Inspection Panel */}
      <div className="bg-[#000000] border border-white/15 rounded-lg p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h4 className="font-display text-sm font-semibold text-[#FFFFFF]">
            {activeNode.label} · <span className="text-[#E4E4E7] font-mono text-xs">{activeNode.sublabel}</span>
          </h4>
          <span className="font-mono text-xs text-[#A1A1AA]">
            Status: {activeNode.status}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          {activeNode.role}
        </p>
        {!compact && (
          <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-[#71717A]">STAGE INPUT: </span>
              <span className="text-[#FFFFFF]">{activeNode.inputs.join(' + ')}</span>
            </div>
            <div>
              <span className="text-[#71717A]">VERIFIED ARTIFACT: </span>
              <span className="text-[#E4E4E7]">{activeNode.outputs.join(' + ')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* 02. PRODUCTION RAG EVALUATION PLATFORM — RETRIEVAL VS. FAITHFULNESS DIAGNOSTIC */
const RagEvaluationVisual: React.FC<{
  project: ProjectCaseStudy;
  compact: boolean;
}> = ({ compact }) => {
  const [diagnosticCase, setDiagnosticCase] = useState<'grounded' | 'retrieval-miss' | 'hallucination'>('grounded');

  const cases = {
    grounded: {
      label: 'Scenario A: Grounded Retrieval & Synthesis',
      chunkConfig: '512 tokens · 64 token overlap · Top-K = 4',
      diagnostic: 'Retriever surfaced matching specification chunks; generator strictly adhered to retrieved context.',
      failureOrigin: 'No Failure Detected — Pass',
      axes: [
        { name: 'Context Relevance (Retriever)', note: 'Top-K chunks directly address query entities', status: 'Verified High' },
        { name: 'Answer Faithfulness (Generator)', note: '100% of factual claims traced to retrieved chunk IDs', status: 'Verified Grounded' },
        { name: 'Answer Relevance (Alignment)', note: 'Response directly resolves query intent without drift', status: 'Aligned' }
      ]
    },
    'retrieval-miss': {
      label: 'Scenario B: Retriever Coverage Miss',
      chunkConfig: '128 tokens · 0 overlap · Top-K = 2',
      diagnostic: 'Overly narrow chunk boundary split a multi-row specification table; relevant rows fell outside Top-2.',
      failureOrigin: 'Isolated to Vector Ingestion / Chunking Layer',
      axes: [
        { name: 'Context Relevance (Retriever)', note: 'Required table context missing from Top-2 chunks', status: 'Retrieval Bottleneck' },
        { name: 'Answer Faithfulness (Generator)', note: 'Generator correctly abstained rather than inventing facts', status: 'Faithful Abstention' },
        { name: 'Answer Relevance (Alignment)', note: 'Incomplete answer caused by upstream retrieval miss', status: 'Blocked by Retriever' }
      ]
    },
    hallucination: {
      label: 'Scenario C: Generator Extrapolation (Hallucination)',
      chunkConfig: '512 tokens · 64 token overlap · Top-K = 4',
      diagnostic: 'Retriever found the exact passage, but an unconstrained synthesis prompt extrapolated unverified numbers.',
      failureOrigin: 'Isolated to Synthesis Prompt / LLM Adherence Layer',
      axes: [
        { name: 'Context Relevance (Retriever)', note: 'Exact target passage present in Rank #1 chunk', status: 'Verified High' },
        { name: 'Answer Faithfulness (Generator)', note: 'Contains claims unsupported by retrieved chunk text', status: 'Ungrounded Claim Flagged' },
        { name: 'Answer Relevance (Alignment)', note: 'Plausible-sounding prose that violates context grounding', status: 'Failed Faithfulness Gate' }
      ]
    }
  };

  const current = cases[diagnosticCase];

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
        <span className="font-mono text-xs text-[#E4E4E7]">
          DECOMPOSED RAG TRIAD FAILURE ATTRIBUTION HARNESS
        </span>
        <span className="font-mono text-xs text-[#71717A]">{current.chunkConfig}</span>
      </div>

      {/* Interactive Scenario Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            { id: 'grounded', label: 'Verified Grounded Run' },
            { id: 'retrieval-miss', label: 'Diagnose Retriever Miss' },
            { id: 'hallucination', label: 'Diagnose Generator Extrapolation' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDiagnosticCase(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFFFFF] ${
              diagnosticCase === tab.id
                ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {current.axes.map((axis) => (
          <div key={axis.name} className="bg-[#000000] border border-white/15 rounded-lg p-3">
            <p className="font-mono text-[11px] text-[#71717A]">{axis.name}</p>
            <p className="text-xs font-semibold text-[#FFFFFF] mt-1">{axis.status}</p>
            {!compact && <p className="text-xs text-[#A1A1AA] mt-1">{axis.note}</p>}
          </div>
        ))}
      </div>

      <div className="bg-[#000000] border border-white/15 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-[#A1A1AA]">{current.diagnostic}</span>
        <span className="font-mono text-[#E4E4E7] shrink-0">
          Attribution: {current.failureOrigin}
        </span>
      </div>
    </div>
  );
};

/* 03. V.O.I.D.E. — 25,003-RECORD, 11-CHANNEL INDUSTRIAL TELEMETRY & RIDGE REGRESSION */
const VoideTelemetryVisual: React.FC<{ compact: boolean }> = ({ compact }) => {
  const [selectedEntity, setSelectedEntity] = useState<ChillerEntityId>('CHILLER-01');
  const profile = getVoideChillerTelemetry(selectedEntity);

  const visibleChannels = compact ? profile.channels.slice(0, 6) : profile.channels;

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
        <span className="font-mono text-xs text-[#E4E4E7]">
          V.O.I.D.E. TELEMETRY DATASET AUDIT · 25,003 RECORDS · 11 CHANNELS
        </span>
        <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
          Quality Score: 90.4/100 · Ridge R²: 0.9896
        </span>
      </div>

      {/* Monitored Entity Selector: CHILLER-01, CHILLER-02, CHILLER-03 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {(['CHILLER-01', 'CHILLER-02', 'CHILLER-03'] as ChillerEntityId[]).map((entity) => (
            <button
              key={entity}
              type="button"
              onClick={() => setSelectedEntity(entity)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFFFFF] ${
                selectedEntity === entity
                  ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                  : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
              }`}
            >
              {entity}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-[#71717A] tabular-nums">
          Entity Partition: {profile.recordSliceCount.toLocaleString()} / {profile.totalDatasetRecords.toLocaleString()} records
        </span>
      </div>

      {/* Standardized Residual Series SVG Plot */}
      <div className="bg-[#000000] border border-white/15 rounded-lg p-3.5 mb-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#71717A] mb-2">
          <span>L2 RIDGE REGRESSION STANDARDIZED RESIDUAL TRACE ({selectedEntity})</span>
          <span>OFFLINE DATASET EVALUATION</span>
        </div>
        <svg
          viewBox="0 0 360 72"
          className="w-full h-16 overflow-visible"
          role="img"
          aria-label={`Standardized residual chart for ${selectedEntity}`}
        >
          {/* Zero reference line */}
          <line x1="0" y1="36" x2="360" y2="36" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          {/* Residual polyline */}
          <polyline
            fill="none"
            stroke="#E4E4E7"
            strokeWidth="1.75"
            points={profile.sampleResiduals
              .map((val, idx) => {
                const x = (idx / (profile.sampleResiduals.length - 1)) * 340 + 10;
                const y = 36 - val * 65;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          {profile.sampleResiduals.map((val, idx) => {
            const x = (idx / (profile.sampleResiduals.length - 1)) * 340 + 10;
            const y = 36 - val * 65;
            return <circle key={idx} cx={x} cy={y} r="2.5" fill="#FFFFFF" />;
          })}
        </svg>
        <p className="text-xs text-[#A1A1AA] mt-2">{profile.operatingProfile}</p>
      </div>

      {/* 11-Channel Telemetry Structure Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {visibleChannels.map((ch) => (
          <div
            key={ch.code}
            className="bg-[#000000] border border-white/15 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-[#E4E4E7]">{ch.code}</p>
              <p className="text-xs text-[#FFFFFF] truncate">{ch.name}</p>
            </div>
            <div className="text-right font-mono text-[11px] text-[#A1A1AA] tabular-nums shrink-0">
              <div>{ch.nominalRange} {ch.unit}</div>
              <div className="text-[#71717A]">L2: {ch.ridgeWeightSign}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* 04. ORION-X R1 — KINTEX-7 XC7K160T + 2×DDR3L + PCIE GEN2 X4 HARDWARE DESIGN STUDY */
const OrionFpgaVisual: React.FC<{
  project: ProjectCaseStudy;
  compact: boolean;
}> = ({ project, compact }) => {
  const [viewMode, setViewMode] = useState<'topology' | 'stackup' | 'cad-slot'>('topology');
  const [selectedBlock, setSelectedBlock] = useState<string>('xc7k160t');

  const hardwareBlocks: Record<
    string,
    { title: string; spec: string; verification: string; details: string }
  > = {
    xc7k160t: {
      title: 'AMD Kintex-7 XC7K160T FPGA (Central BGA Fabric)',
      spec: 'HP/HR SelectIO Banks · GTX Transceivers · Multi-Rail Decoupling',
      verification: 'Design Target & KiCad Schematic/Footprint Study',
      details:
        'Central programmable logic device in the ORION-X R1 design study. Configured for 32-bit DDR3L memory interfacing and 4-lane PCIe Gen2 GTX transceiver escape routing.'
    },
    ddr3l: {
      title: 'Dual DDR3L Memory Devices (32-Bit Combined Bus)',
      spec: '2 × 16-Bit DDR3L SDRAM @ 1.35V VDDQ · 0.675V VTT Termination',
      verification: 'CAD Topology Study (Physical Memory Training Unverified)',
      details:
        'Two 16-bit DDR3L packages arranged in a 32-bit combined data bus topology exploring byte-lane grouping, differential DQS strobes, and impedance-controlled routing targets.'
    },
    pcie: {
      title: 'PCI Express Gen2 x4 Host Edge Interface',
      spec: '4 × Differential GTX TX/RX Lanes · 100nF AC Coupling · 100MHz RefClk',
      verification: 'Design Target (Physical PCIe Enumeration Unverified)',
      details:
        '4-lane PCIe edge finger routed to Kintex-7 GTX transceiver quads with inline AC coupling capacitors and PERST# sideband signals.'
    },
    pdn: {
      title: 'Multi-Rail Power Delivery & QSPI Configuration',
      spec: '12V Slot Input -> 1.0V VCCINT · 1.35V DDR3L · 1.8V VCCAUX · 3.3V I/O + QSPI',
      verification: 'KiCad Schematic & Copper Polygon Layout Study',
      details:
        'Dedicated buck regulation stages supplying FPGA core, transceiver, auxiliary, and memory rails alongside Master SPI x4 non-volatile flash storage.'
    }
  };

  const activeBlock = hardwareBlocks[selectedBlock];

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
        <span className="font-mono text-xs text-[#E4E4E7]">
          ORION-X R1 HARDWARE DESIGN STUDY · KICAD ARCHITECTURAL EXPLORER
        </span>
        <span className="font-mono text-xs text-[#A1A1AA]">
          Status: Design Study (Not Physically Manufactured)
        </span>
      </div>

      {/* View Mode Switcher */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setViewMode('topology')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
            viewMode === 'topology'
              ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
              : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
          }`}
        >
          Board Topology &amp; Interconnect
        </button>
        <button
          type="button"
          onClick={() => setViewMode('stackup')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
            viewMode === 'stackup'
              ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
              : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
          }`}
        >
          Multilayer PCB Stack-Up Study
        </button>
        {!compact && (
          <button
            type="button"
            onClick={() => setViewMode('cad-slot')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'cad-slot'
                ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
            }`}
          >
            3D CAD Visualization &amp; Asset Slot
          </button>
        )}
      </div>

      {viewMode === 'topology' && (
        <div>
          {/* Interactive PCB Block Schematic SVG */}
          <div className="bg-[#000000] border border-white/15 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedBlock('pdn')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedBlock === 'pdn'
                    ? 'border-[#FFFFFF] bg-white/15'
                    : 'border-white/15 bg-[#0A0A0A] hover:border-white/35'
                }`}
              >
                <p className="font-mono text-[11px] text-[#E4E4E7]">PDN + QSPI</p>
                <p className="text-xs font-semibold text-[#FFFFFF] mt-1">Multi-Rail Power &amp; Config</p>
                <p className="font-mono text-[11px] text-[#71717A] mt-1">1.0V / 1.35V / 1.8V / 3.3V</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBlock('xc7k160t')}
                className={`p-3 rounded-lg border text-left transition-colors sm:col-span-2 ${
                  selectedBlock === 'xc7k160t'
                    ? 'border-[#FFFFFF] bg-white/15'
                    : 'border-white/15 bg-[#0A0A0A] hover:border-white/35'
                }`}
              >
                <p className="font-mono text-[11px] text-[#E4E4E7]">CENTRAL FPGA FABRIC (U1)</p>
                <p className="text-sm font-semibold text-[#FFFFFF] mt-1">AMD Kintex-7 XC7K160T</p>
                <p className="font-mono text-[11px] text-[#A1A1AA] mt-1">
                  BGA Fanout Study · SelectIO Memory Controller · GTX Quad Transceivers
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBlock('ddr3l')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedBlock === 'ddr3l'
                    ? 'border-[#FFFFFF] bg-white/15'
                    : 'border-white/15 bg-[#0A0A0A] hover:border-white/35'
                }`}
              >
                <p className="font-mono text-[11px] text-[#E4E4E7]">MEMORY SUBSYSTEM</p>
                <p className="text-xs font-semibold text-[#FFFFFF] mt-1">2 × DDR3L SDRAM</p>
                <p className="font-mono text-[11px] text-[#71717A] mt-1">32-Bit Combined Bus</p>
              </button>
            </div>

            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setSelectedBlock('pcie')}
                className={`w-full p-2.5 rounded-lg border text-left transition-colors flex flex-wrap items-center justify-between gap-2 ${
                  selectedBlock === 'pcie'
                    ? 'border-[#FFFFFF] bg-white/15'
                    : 'border-white/15 bg-[#0A0A0A] hover:border-white/35'
                }`}
              >
                <span className="font-mono text-xs text-[#FFFFFF]">
                  EDGE INTERCONNECT: PCI Express Gen2 x4 Target Interface (4 × Differential TX/RX Pairs)
                </span>
                <span className="font-mono text-[11px] text-[#E4E4E7]">Inspect Lane Topology →</span>
              </button>
            </div>
          </div>

          <div className="bg-[#000000] border border-white/15 rounded-lg p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 className="text-xs sm:text-sm font-semibold text-[#FFFFFF]">{activeBlock.title}</h4>
              <span className="font-mono text-[11px] text-[#E4E4E7]">{activeBlock.verification}</span>
            </div>
            <p className="font-mono text-xs text-[#A1A1AA] mb-1.5">{activeBlock.spec}</p>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">{activeBlock.details}</p>
          </div>
        </div>
      )}

      {viewMode === 'stackup' && (
        <div className="bg-[#000000] border border-white/15 rounded-lg p-4 space-y-2">
          <p className="text-xs text-[#A1A1AA] mb-3">
            Multilayer PCB partition strategy in KiCad separating high-speed differential striplines/microstrips from continuous reference planes (DRC/impedance sign-off ongoing):
          </p>
          {[
            { layer: 'TOP (L1)', role: 'High-Speed Signals · Component Pads · PCIe & BGA Outer Escape' },
            { layer: 'GND (L2)', role: 'Continuous Solid Ground Reference Plane (Return Path Control)' },
            { layer: 'IN1 (L3)', role: 'DDR3L Byte-Group Data / Strobe Routing Study' },
            { layer: 'PWR (L4)', role: 'Split Power Polygons (1.0V VCCINT · 1.35V VDDQ · 1.8V · 3.3V)' },
            { layer: 'IN2 (L5)', role: 'DDR3L Address / Command / Control Routing Study' },
            { layer: 'GND / BOT', role: 'Ground Reference & Underside BGA Decoupling Capacitor Array' }
          ].map((l) => (
            <div
              key={l.layer}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 px-3 rounded bg-[#0A0A0A] border border-white/15 font-mono text-xs"
            >
              <span className="text-[#E4E4E7] font-semibold">{l.layer}</span>
              <span className="text-[#A1A1AA]">{l.role}</span>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'cad-slot' && project.conceptRenderImage && (
        <div className="bg-[#000000] border border-white/15 rounded-lg p-4">
          <div className="aspect-16/9 rounded-lg overflow-hidden border border-white/15 mb-3 bg-[#0A0A0A]">
            <img
              src={project.conceptRenderImage}
              alt="Illustrative 3D CAD concept render slot for ORION-X R1"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80 grayscale"
            />
          </div>
          <p className="font-mono text-xs text-[#E4E4E7] mb-1">
            ASSET DISCLOSURE · ILLUSTRATIVE CONCEPT VISUALIZATION SLOT
          </p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {project.assetDisclosure}
          </p>
        </div>
      )}
    </div>
  );
};

/* 05. JARVIS — LOCAL-FIRST MULTI-TIER INTELLIGENCE ROUTER */
const JarvisRouterVisual: React.FC<{ compact: boolean }> = ({ compact }) => {
  const [sampleQuery, setSampleQuery] = useState('summarize this python log traceback');
  const [allowCloud, setAllowCloud] = useState(true);

  const routing = simulateJarvisRouting(sampleQuery, allowCloud);

  const presetQueries = [
    { label: 'Tier 1: Check git status & port', query: 'check git status and active port' },
    { label: 'Tier 2: Summarize local Python log', query: 'summarize this python log traceback' },
    { label: 'Tier 3: Compare distributed architectures', query: 'compare distributed architecture trade-offs' }
  ];

  return (
    <div className="glass-surface rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15">
        <span className="font-mono text-xs text-[#E4E4E7]">
          JARVIS MULTI-TIER INTENT &amp; PRIVACY ROUTER SIMULATOR
        </span>
        <label className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] cursor-pointer">
          <input
            type="checkbox"
            checked={allowCloud}
            onChange={(e) => setAllowCloud(e.target.checked)}
            className="rounded border-white/25 bg-[#000000] text-[#FFFFFF] focus:ring-[#FFFFFF]"
          />
          <span>Authorize Sanitized Tier-3 Cloud Fallback</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {presetQueries.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setSampleQuery(preset.query)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              sampleQuery === preset.query
                ? 'bg-[#FFFFFF] text-[#000000] font-semibold'
                : 'bg-[#000000] text-[#A1A1AA] border border-white/15 hover:text-[#FFFFFF]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="mb-3">
          <label htmlFor="jarvis-query-input" className="sr-only">
            Test a command for JARVIS routing classification
          </label>
          <input
            id="jarvis-query-input"
            type="text"
            value={sampleQuery}
            onChange={(e) => setSampleQuery(e.target.value)}
            placeholder="Enter a sample command (e.g., check service status, summarize code, design architecture)..."
            className="w-full px-3.5 py-2 rounded-lg bg-[#000000] border border-white/15 text-xs font-mono text-[#FFFFFF] focus:outline-2 focus:outline-[#FFFFFF]"
          />
        </div>
      )}

      <div className="bg-[#000000] border border-white/15 rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <p className="font-mono text-[11px] text-[#71717A]">ASSIGNED COMPUTE TIER</p>
          <p className="font-semibold text-[#FFFFFF] mt-1">{routing.tier}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] text-[#71717A]">PRIVACY BOUNDARY</p>
          <p className="font-mono text-[#E4E4E7] mt-1">{routing.privacyBoundary}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] text-[#71717A]">MODULE MATURITY</p>
          <p className="text-[#A1A1AA] mt-1">
            {routing.isExperimentalModule ? 'Experimental Fallback Adapter' : 'Implemented Local Module'}
          </p>
        </div>
      </div>
    </div>
  );
};
