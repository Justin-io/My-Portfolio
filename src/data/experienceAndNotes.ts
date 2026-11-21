export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  timelineDisclosure: string;
  location: string;
  summary: string;
  focusAreas: string[];
  contributions: string[];
  artifactsAndOutcomes: string[];
}

export interface EngineeringNote {
  id: string;
  number: string;
  title: string;
  category: string;
  readTime: string;
  relatedProjectSlug: string;
  relatedProjectTitle: string;
  summary: string;
  problemContext: string;
  keyFindings: string[];
  codeOrSpecTitle: string;
  codeOrSpecBlock: string;
  takeaway: string;
}

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: 'independent-ai-systems-engineering',
    organization: 'Independent Applied AI & Data Systems Research',
    role: 'Applied AI, Retrieval Evaluation & Telemetry Systems Builder',
    timelineDisclosure: 'Ongoing Independent Engineering & Research',
    location: 'Kerala, India',
    summary:
      'Designing and documenting verifiable AI pipelines, retrieval evaluation workbenches, and industrial telemetry modeling systems that prioritize empirical measurement over black-box claims.',
    focusAreas: [
      'Agentic Analytical Pipelines',
      'RAG Evaluation & Groundedness',
      'Industrial Telemetry & Data Quality',
      'Local-First AI Orchestration'
    ],
    contributions: [
      'Architected V.O.I.D.E. to audit and model 25,003 industrial chiller telemetry records across 11 channels (CHILLER-01, CHILLER-02, CHILLER-03), achieving a documented 90.4/100 data quality score and 0.9896 Ridge Regression R².',
      'Built a 7-stage Autonomous AI Data Scientist prototype combining deterministic schema profiling with bounded 3-retry Python code synthesis and execution validation.',
      'Developed the Production RAG Evaluation Platform to separate vector retrieval bottlenecks from generator hallucination failures across technical documentation corpora.',
      'Designed the JARVIS local-first assistant routing architecture combining deterministic local handlers, quantized Ollama / llama.cpp inference, and sanitized cloud fallback.'
    ],
    artifactsAndOutcomes: [
      'V.O.I.D.E. 25,003-Record Telemetry Pipeline & Regularized Modeling Suite',
      'Decomposed RAG Triad Evaluation Harness & 7-Stage Analytical Workflow Prototype',
      'JARVIS Multi-Tier Local/Cloud Routing Architecture'
    ]
  },
  {
    id: 'hardware-pcb-architecture-study',
    organization: 'Digital Hardware & Multilayer PCB Design Lab',
    role: 'B.Tech Data Science Student & Hardware Systems Explorer',
    timelineDisclosure: 'Ongoing Academic & Hardware Design Study Work',
    location: 'Kerala, India',
    summary:
      'Self-directed exploration of high-density digital hardware architecture, multilayer PCB layout in KiCad, and the intersection of physical computing with intelligent software systems.',
    focusAreas: [
      'Multilayer PCB Architecture (KiCad)',
      'FPGA Accelerator Design Studies',
      'DDR3L & PCIe Gen2 Interfacing',
      'Verification & DRC Discipline'
    ],
    contributions: [
      'Executed the ORION-X R1 hardware design study exploring an AMD Kintex-7 XC7K160T FPGA, dual DDR3L memory devices (32-bit combined bus), and a PCIe Gen2 x4 target interface in KiCad.',
      'Built custom KiCad schematic symbols, BGA footprint libraries, hierarchical multi-sheet schematics, and multi-rail power delivery network layouts.',
      'Established transparent engineering verification ledgers separating CAD design targets from ongoing electrical DRC/ERC audits and unmanufactured physical hardware.'
    ],
    artifactsAndOutcomes: [
      'ORION-X R1 Hierarchical KiCad Schematics & Multilayer PCB Layout Study',
      'Custom BGA/High-Speed Component Libraries & Verification Matrices'
    ]
  }
];

export const ENGINEERING_NOTES: EngineeringNote[] = [
  {
    id: 'note-voide-collinearity',
    number: 'NOTE 01',
    title: 'Why Data Quality Auditing Precedes Regression on Multi-Chiller Telemetry',
    category: 'Data Engineering & Statistical Modeling',
    readTime: '4 min read',
    relatedProjectSlug: 'voide',
    relatedProjectTitle: 'V.O.I.D.E.',
    summary:
      'Lessons from processing 25,003 telemetry records across 11 sensor channels for CHILLER-01, CHILLER-02, and CHILLER-03—and why L2 regularization (Ridge Regression) is essential when physical thermal sensors covary.',
    problemContext:
      'In industrial HVAC and chiller telemetry, supply temperature, return temperature, compressor current, and condenser pressure are governed by the same thermodynamic cycle. Feeding raw, uncleaned sensor streams directly into ordinary least squares (OLS) produces high coefficient variance and conflates sensor dropout spikes with mechanical anomalies.',
    keyFindings: [
      'Gating the pipeline with an explicit Data Quality Score (90.4/100 across completeness, physical range bounds, and timestamp continuity) prevents corrupted intervals from skewing regression weights.',
      'Partitioning time-series windows strictly by entity ID (CHILLER-01, CHILLER-02, CHILLER-03) avoids cross-unit boundary artifacts during rolling delta calculation.',
      'Applying Ridge Regression (L2 penalty) stabilized collinear channel coefficients and achieved an evaluated R² of 0.9896 on the offline telemetry dataset while keeping feature weights interpretable.'
    ],
    codeOrSpecTitle: 'V.O.I.D.E. Quality Gate & Ridge Pipeline Structure',
    codeOrSpecBlock: `# Documented V.O.I.D.E. Pipeline Summary
Entities:       ["CHILLER-01", "CHILLER-02", "CHILLER-03"]
Records:        25,003 telemetry rows × 11 sensor channels
Quality Audit:  Completeness + Range Validity + Continuity -> 90.4 / 100

# L2-Regularized Modeling Stage
X_scaled = StandardScaler().fit_transform(engineered_thermal_features)
model = Ridge(alpha=1.0, solver="cholesky")
model.fit(X_train, y_train)
# Evaluated offline dataset R²: 0.9896`,
    takeaway:
      'High regression R² on physical telemetry is only meaningful when preceded by an explicit data quality gate and regularized against sensor collinearity.'
  },
  {
    id: 'note-orion-verification',
    number: 'NOTE 02',
    title: 'Documenting Hardware Design Studies Honestly: Lessons from ORION-X R1',
    category: 'Hardware Engineering & PCB CAD',
    readTime: '5 min read',
    relatedProjectSlug: 'orion-x-r1',
    relatedProjectTitle: 'ORION-X R1',
    summary:
      'Separating schematic targets, KiCad multilayer layout work, and ongoing electrical DRC/ERC verification when designing a Kintex-7 XC7K160T + DDR3L + PCIe Gen2 x4 board.',
    problemContext:
      'Complex digital hardware projects pass through distinct maturity phases: architectural specification, symbol/footprint creation, schematic capture, placement and escape routing, DRC/ERC verification, signal-integrity simulation, physical fabrication, and hardware bring-up. Treating a CAD layout study as a validated physical product obscures the actual engineering lessons.',
    keyFindings: [
      'Dual DDR3L devices forming a 32-bit bus require strict byte-lane grouping and DQS strobe pairing inside KiCad before committing to inner-layer routing.',
      'PCIe Gen2 x4 GTX transceiver routing demands AC coupling capacitors (100nF) placed near the edge connector and uninterrupted ground reference planes beneath differential pairs.',
      'When committed documentation or historical ERC/DRC logs contain discrepancies across revisions, the only rigorous engineering posture is to declare verification ongoing and separate design targets from physical test claims.'
    ],
    codeOrSpecTitle: 'ORION-X R1 Hardware Specification & Verification Ledger',
    codeOrSpecBlock: `Target Device:     AMD Kintex-7 XC7K160T FPGA (BGA)
Memory Topology:   2 × DDR3L SDRAM (32-bit combined bus @ 1.35V)
Host Interface:    PCI Express Gen2 x4 Target + QSPI Config Flash
CAD Workflow:      KiCad Hierarchical Schematics + Multilayer PCB
Maturity Status:   Hardware Design Study (Unmanufactured)
DRC / ERC Status:  Ongoing verification — no physical bring-up claimed`,
    takeaway:
      'Engineering credibility comes from clearly distinguishing what is designed in CAD from what has been physically fabricated and measured on an oscilloscope.'
  },
  {
    id: 'note-rag-triad',
    number: 'NOTE 03',
    title: 'Isolating Retrieval Failures from Generation Hallucinations in RAG',
    category: 'Applied AI & Evaluation Systems',
    readTime: '4 min read',
    relatedProjectSlug: 'rag-evaluation-platform',
    relatedProjectTitle: 'Production RAG Evaluation Platform',
    summary:
      'Why end-to-end answer grading fails to guide RAG engineering, and how decomposing evaluation into Context Relevance, Grounded Faithfulness, and Answer Relevance exposes the real bottleneck.',
    problemContext:
      'If a RAG pipeline gives a bad answer, changing the LLM prompt will not help if the vector retriever returned irrelevant chunks—and tuning chunk size will not help if the retriever found the exact paragraph but the prompt allowed the LLM to extrapolate beyond it.',
    keyFindings: [
      'Chunk window boundaries directly control the precision-context trade-off: overly narrow chunks fragment conditional tables and code blocks, while oversized chunks dilute dense embedding vectors.',
      'Evaluating Context Relevance (did top-k retrieval contain the answer?) separately from Faithfulness (did the generator stay strictly within top-k chunks?) turns RAG tuning into an empirical feedback loop.',
      'Every evaluation score must retain pointers to the exact retrieved chunk IDs and cosine similarity scores for human audit.'
    ],
    codeOrSpecTitle: 'RAG Failure Mode Attribution Matrix',
    codeOrSpecBlock: `Case A: Context Relevance LOW  | Faithfulness HIGH -> Vector / Chunking Miss
Case B: Context Relevance HIGH | Faithfulness LOW  -> Generator Hallucination
Case C: Context Relevance HIGH | Answer Rel. LOW   -> Prompt Instruction Drift`,
    takeaway:
      'You cannot systematically improve a retrieval system until your evaluation harness separates retriever recall from generator groundedness.'
  },
  {
    id: 'note-jarvis-local-routing',
    number: 'NOTE 04',
    title: 'Multi-Tier Local-First Model Routing & Payload Sanitization in JARVIS',
    category: 'Local-First AI & Systems Architecture',
    readTime: '4 min read',
    relatedProjectSlug: 'jarvis',
    relatedProjectTitle: 'JARVIS',
    summary:
      'Designing a three-tier intelligence hierarchy that keeps deterministic automation and private workspace queries on local hardware (Ollama / llama.cpp) while enforcing strict redaction before cloud escalation.',
    problemContext:
      'Sending every developer query to a frontier cloud LLM wastes latency on simple system commands and risks leaking local environment variables, file paths, or tokens. Conversely, forcing a small quantized local model to handle deep cross-domain synthesis hits reasoning ceilings.',
    keyFindings: [
      'Tier 1 deterministic handlers resolve structured system status, git inspection, and workspace automation commands in under 50ms without invoking neural weights.',
      'Tier 2 local quantized models (via Ollama and llama.cpp) handle private log summarization and code drafting completely offline with zero outbound token telemetry.',
      'Tier 3 cloud fallback operates behind an explicit sanitization boundary that strips environment secrets and requires opt-in authorization.'
    ],
    codeOrSpecTitle: 'JARVIS 3-Tier Compute & Privacy Routing Policy',
    codeOrSpecBlock: `Tier 1 (Deterministic):  Sub-50ms local Python handlers -> 100% On-Device
Tier 2 (Local LLM):      Quantized GGUF via Ollama/llama.cpp -> 100% On-Device
Tier 3 (Cloud Fallback): Sanitized payload (secrets redacted) -> Opt-In Frontier API`,
    takeaway:
      'Local-first AI is not about rejecting cloud models—it is about routing each task to the lightest, most private compute tier capable of solving it.'
  }
];

export const OWNER_CONTACT_INFO = {
  name: 'Hari Nandan K.',
  role: 'Applied AI & Systems Engineer',
  academicStatus: 'B.Tech — Data Science',
  location: 'Kerala, India',
  email: 'harinandhan972@gmail.com',
  githubUrl: 'https://github.com/Justin-io',
  linkedinUrl: 'https://www.linkedin.com/in/hari-nandan-k',
  resumeAvailable: true,
  resumeNote: 'Verified resume PDF is available.'
};
