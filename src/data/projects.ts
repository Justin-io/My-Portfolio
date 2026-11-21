export type MaturityLevel =
  | 'Prototype'
  | 'Research Project'
  | 'Design Study'
  | 'In Development'
  | 'Experimentally Validated';

export type ProjectCategoryGroup = 'all' | 'ai-data' | 'hardware' | 'systems-research';

export interface VerificationItem {
  aspect: string;
  stage: 'Design Target' | 'CAD / Code Implemented' | 'Offline / Lab Evaluated' | 'Ongoing / Unverified';
  notes: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel: string;
  role: string;
  details: string;
  inputs: string[];
  outputs: string[];
  status: 'Implemented' | 'Experimental' | 'Design Target';
}

export interface ProjectMetric {
  label: string;
  value: string;
  context: string;
}

export interface ProjectCaseStudy {
  slug: string;
  index: string;
  title: string;
  fullName: string;
  category: string;
  categoryGroup: Exclude<ProjectCategoryGroup, 'all'>;
  maturity: MaturityLevel;
  maturityNote: string;
  shortDescription: string;
  overview: string;
  problemStatement: string;
  engineeringObjective: string;
  constraints: string[];
  systemArchitectureSummary: string;
  architectureNodes: ArchitectureNode[];
  implementation: string[];
  engineeringDecisions: {
    decision: string;
    rationale: string;
    tradeoff: string;
  }[];
  technicalChallenges: string[];
  resultsAndEvaluation: string;
  metrics: ProjectMetric[];
  verificationMatrix: VerificationItem[];
  limitations: string[];
  futureImprovements: string[];
  techStack: string[];
  visualSignature: 'workflow-pipeline' | 'rag-retrieval' | 'voide-telemetry' | 'orion-fpga' | 'jarvis-router';
  conceptRenderImage?: string;
  assetDisclosure: string;
  repositoryStatus: string;
  repositoryUrl: string;
}

export const PROJECTS: ProjectCaseStudy[] = [
  {
    slug: 'autonomous-ai-data-scientist',
    index: '01',
    title: 'Autonomous AI Data Scientist',
    fullName: 'Autonomous AI Data Scientist — Structured Analytical Workflow Engine',
    category: 'Applied AI / Agentic Systems',
    categoryGroup: 'ai-data',
    maturity: 'Prototype',
    maturityNote: 'Functional software prototype demonstrating multi-step tabular profiling, query generation, and validation loops on structured CSV/Parquet datasets.',
    shortDescription:
      'An autonomous data analysis system designed to move beyond static question-answering and support structured analytical workflows.',
    overview:
      'Standard conversational LLM wrappers often hallucinate numerical aggregations when asked directly about tabular datasets. This project implements a structured, multi-stage analytical workflow where the language model operates strictly as a planner and code synthesizer, delegating statistical computation to deterministic Python execution.',
    problemStatement:
      'Ad-hoc exploratory data analysis (EDA) requires repetitive boilerplate for schema inspection, missing-value profiling, hypothesis formulation, and visualization. Naive prompt-based analysis fails because token prediction cannot reliably compute variance, correlation matrices, or filtered aggregations over thousands of rows.',
    engineeringObjective:
      'Design a deterministic pipeline that ingests raw tabular data, builds a structural schema profile, plans verifiable analytical steps, generates executable Python/Pandas transformations, validates execution outputs, and produces interpretable charts and summaries.',
    constraints: [
      'Never allow the LLM to estimate numerical statistics directly in natural language without code execution.',
      'Pass compact schema metadata (column types, cardinality, null ratios, quantile bounds) rather than raw table dumps into context windows.',
      'Bound execution retry loops to prevent runaway cyclic code generation on malformed schemas.',
      'Ensure every generated chart and conclusion traces back to an inspectable code snippet.'
    ],
    systemArchitectureSummary:
      'A 7-stage sequential state machine with bounded self-correction between the Code Generation and Execution Validation stages.',
    architectureNodes: [
      {
        id: 'ingest',
        label: '01. Data Ingestion',
        sublabel: 'CSV / Parquet Loader',
        role: 'Normalizes input encodings, parses temporal columns, and initializes an isolated dataframe workspace.',
        details: 'Validates file integrity, strips formatting artifacts, and enforces memory limits before profiling.',
        inputs: ['Raw CSV / Tabular dataset'],
        outputs: ['Normalized Pandas DataFrame'],
        status: 'Implemented'
      },
      {
        id: 'profile',
        label: '02. Data Profiling',
        sublabel: 'Deterministic Schema Digest',
        role: 'Computes deterministic summary statistics, data types, missingness percentages, and cardinality.',
        details: 'Constructs a compact JSON schema digest so the reasoning planner sees exact column distributions without exceeding context limits.',
        inputs: ['Normalized DataFrame'],
        outputs: ['Compact JSON Schema Profile'],
        status: 'Implemented'
      },
      {
        id: 'reason',
        label: '03. Analytical Reasoning',
        sublabel: 'Hypothesis & Task Planner',
        role: 'Formulates structured analytical questions and selects appropriate statistical transformations.',
        details: 'Decomposes user intent or exploratory goals into discrete, testable analytical sub-tasks.',
        inputs: ['Schema Profile', 'Analytical Query'],
        outputs: ['Structured Execution Plan'],
        status: 'Implemented'
      },
      {
        id: 'codegen',
        label: '04. Code & Query Synthesis',
        sublabel: 'Pandas / SQL Generator',
        role: 'Translates each analytical step into constrained Python/Pandas transformation and plotting code.',
        details: 'Restricts imports to approved analytical libraries (pandas, numpy, matplotlib/plotly) and enforces explicit output schema variables.',
        inputs: ['Structured Execution Plan', 'Column Definitions'],
        outputs: ['Executable Python Script'],
        status: 'Implemented'
      },
      {
        id: 'validate',
        label: '05. Execution & Validation',
        sublabel: 'Runtime & Error Loop',
        role: 'Executes generated code and captures stdout, dataframe summaries, and traceback exceptions.',
        details: 'If a KeyError, TypeError, or empty aggregation occurs, feeds the traceback back to Stage 04 for up to 3 bounded repair attempts.',
        inputs: ['Executable Python Script'],
        outputs: ['Verified Statistical Artifacts'],
        status: 'Implemented'
      },
      {
        id: 'visualize',
        label: '06. Visualization Synthesis',
        sublabel: 'Chart Artifact Generator',
        role: 'Renders distribution plots, correlation heatmaps, and time-series trends from verified data slices.',
        details: 'Selects chart encodings appropriate to column cardinality and data types.',
        inputs: ['Verified Statistical Artifacts'],
        outputs: ['Visual Chart Specifications'],
        status: 'Implemented'
      },
      {
        id: 'interpret',
        label: '07. Result Interpretation',
        sublabel: 'Grounded Narrative Summary',
        role: 'Synthesizes findings grounded strictly in the computed numerical artifacts from Stage 05.',
        details: 'Pairs every analytical claim with the exact metric computed during execution.',
        inputs: ['Verified Statistical Artifacts', 'Visual Chart Specifications'],
        outputs: ['Auditable Analytical Report'],
        status: 'Implemented'
      }
    ],
    implementation: [
      'Built a deterministic Python data profiler that extracts column types, null percentages, uniqueness ratios, and summary quantiles into a structured prompt schema.',
      'Implemented a staged execution loop separating planning, code synthesis, execution verification, and interpretation.',
      'Added traceback-guided repair logic so syntax or column-name mismatches are automatically corrected within a 3-iteration cap.',
      'Created structured output formatting linking generated analytical narratives directly to computed dataframe tables.'
    ],
    engineeringDecisions: [
      {
        decision: 'Schema-Only Context Injection vs. Raw Row Sampling',
        rationale: 'Injecting raw rows wastes tokens and tempts the LLM to extrapolate from a 5-row sample.',
        tradeoff: 'Requires an upfront deterministic profiling pass before the first LLM call, adding ~150ms of local compute but eliminating sample bias.'
      },
      {
        decision: 'Bounded State Machine Over Unconstrained Autonomous Loops',
        rationale: 'Open-ended agent loops frequently get stuck repeating failing tool calls.',
        tradeoff: 'Caps repair retries at 3 iterations; complex multi-table joins outside the schema fail gracefully with a diagnostic log rather than spinning indefinitely.'
      }
    ],
    technicalChallenges: [
      'Handling inconsistent date formatting and mixed-type object columns in messy real-world CSV exports.',
      'Preventing generated visualization scripts from plotting high-cardinality categorical columns without top-N aggregation.',
      'Maintaining strict grounding during the final interpretation stage so the model does not speculate beyond computed p-values or correlations.'
    ],
    resultsAndEvaluation:
      'Evaluated across clean and dirty tabular datasets (missing values, mixed types, skewed distributions). The staged profiling-first architecture reliably completes univariate/bivariate profiling, group-by aggregations, and trend synthesis while preventing hallucinated figures.',
    metrics: [
      {
        label: 'Pipeline Architecture',
        value: '7 Stages',
        context: 'Deterministic ingestion & profiling paired with bounded code synthesis'
      },
      {
        label: 'Max Repair Iterations',
        value: '3 Retries',
        context: 'Hard ceiling on traceback-guided code self-correction'
      },
      {
        label: 'Context Payload',
        value: 'Schema Digest',
        context: 'Zero raw data dumps required in prompt context'
      }
    ],
    verificationMatrix: [
      {
        aspect: 'Tabular Ingestion & Profiling',
        stage: 'CAD / Code Implemented',
        notes: 'Deterministic schema extraction, null analysis, and quantile summarization verified in Python.'
      },
      {
        aspect: 'Code Synthesis & Traceback Repair',
        stage: 'Offline / Lab Evaluated',
        notes: 'Tested on benchmark CSV datasets with bounded 3-step error recovery.'
      },
      {
        aspect: 'Full Multi-Table Autonomous Discovery',
        stage: 'Ongoing / Unverified',
        notes: 'Current prototype operates on single-table tabular datasets; automated multi-table relational join discovery is not claimed.'
      }
    ],
    limitations: [
      'Designed primarily for single-table structured datasets (CSV/Parquet); complex relational schema discovery across multiple unindexed tables is not supported.',
      'Code execution requires a controlled local environment; untrusted multi-tenant execution requires container-level sandboxing.',
      'Statistical causal inference is not automated—the system reports observational correlations and distributions.'
    ],
    futureImprovements: [
      'Integrate WebAssembly / Pyodide or ephemeral container sandboxes for zero-trust code execution.',
      'Add automated statistical significance guardrails (Bonferroni correction warnings on multi-hypothesis runs).',
      'Support SQL dialect generation for direct DuckDB and PostgreSQL warehouse querying.'
    ],
    techStack: ['Python', 'Pandas', 'NumPy', 'LLM Orchestration', 'Structured Outputs', 'Data Visualization'],
    visualSignature: 'workflow-pipeline',
    assetDisclosure: 'Interactive 7-stage architecture diagram reflects the implemented prototype workflow. Production screenshot slots are reserved for verified local run captures.',
    repositoryStatus: 'Source repository & workflow documentation available on GitHub',
    repositoryUrl: 'https://github.com/Justin-io/autonomous-ai-data-scientist'
  },
  {
    slug: 'rag-evaluation-platform',
    index: '02',
    title: 'Production RAG Evaluation Platform',
    fullName: 'Production RAG Evaluation Platform — Retrieval & Groundedness Verification',
    category: 'AI Engineering / Retrieval Systems',
    categoryGroup: 'ai-data',
    maturity: 'Experimentally Validated',
    maturityNote: 'Implemented retrieval pipeline and evaluation harness for measuring chunking recall, context relevance, and answer faithfulness.',
    shortDescription:
      'A platform focused on evaluating Retrieval-Augmented Generation systems through measurable retrieval and response quality.',
    overview:
      'Building a RAG prototype takes an afternoon; knowing whether changes to chunk size, overlap, embedding models, or top-k retrieval actually improve answer quality requires systematic measurement. This platform separates retrieval diagnostics from generation evaluation so engineers can pinpoint whether failures originate in the vector index or the synthesis prompt.',
    problemStatement:
      'When a RAG system produces an inaccurate response, it is often unclear whether the retriever failed to surface the relevant passage (retrieval failure) or the generator ignored/misinterpreted the retrieved context (faithfulness failure). Without quantitative evaluation, parameter tuning becomes guesswork.',
    engineeringObjective:
      'Build an end-to-end RAG ingestion and evaluation workbench that instruments document chunking, vector retrieval, retrieval quality metrics, and answer groundedness verification into reproducible evaluation reports.',
    constraints: [
      'Decouple retrieval evaluation metrics from generation metrics to isolate failure modes.',
      'Support configurable chunk size, token overlap, and top-k parameters for controlled A/B comparison.',
      'Ensure evaluation reports trace every low-scoring response back to the exact retrieved chunk IDs and similarity scores.'
    ],
    systemArchitectureSummary:
      'Dual-pipeline architecture combining an instrumented Document Ingestion & Vector Retrieval path with a Parallel Tri-Metric Evaluation Harness.',
    architectureNodes: [
      {
        id: 'doc-ingest',
        label: '01. Document Ingestion',
        sublabel: 'Parser & Normalizer',
        role: 'Extracts text and structural metadata from technical documents while stripping layout noise.',
        details: 'Preserves section headers and source identifiers for downstream citation tracking.',
        inputs: ['Markdown / PDF / Technical Docs'],
        outputs: ['Normalized Document Blocks'],
        status: 'Implemented'
      },
      {
        id: 'chunking',
        label: '02. Chunking & Preprocessing',
        sublabel: 'Configurable Window Splitter',
        role: 'Segments documents into parameterized token windows with controlled overlap.',
        details: 'Allows testing fixed-size vs. semantic boundary splitting strategies.',
        inputs: ['Normalized Document Blocks', 'Chunk Config (Size, Overlap)'],
        outputs: ['Indexed Document Chunks'],
        status: 'Implemented'
      },
      {
        id: 'embeddings',
        label: '03. Embedding & Vector Index',
        sublabel: 'Dense Vector Store',
        role: 'Encodes chunks into dense vector embeddings and indexes them for cosine/inner-product search.',
        details: 'Maintains deterministic chunk metadata mapping for retrieval attribution.',
        inputs: ['Indexed Document Chunks'],
        outputs: ['Queryable Vector Index'],
        status: 'Implemented'
      },
      {
        id: 'retrieval-eval',
        label: '04. Retrieval Evaluation',
        sublabel: 'Hit Rate & Context Relevance',
        role: 'Measures whether retrieved top-k passages actually contain the information required to answer the query.',
        details: 'Evaluates retrieval precision, context relevance, and rank ordering independent of final text generation.',
        inputs: ['Query Set', 'Retrieved Top-K Chunks'],
        outputs: ['Retrieval Quality Scores'],
        status: 'Implemented'
      },
      {
        id: 'answer-eval',
        label: '05. Answer & Faithfulness Eval',
        sublabel: 'Groundedness Verification',
        role: 'Checks whether every factual claim in the generated answer is supported by the retrieved context.',
        details: 'Flags unsupported extrapolations (hallucinations) even when the answer sounds plausible.',
        inputs: ['Retrieved Top-K Chunks', 'Generated Answer'],
        outputs: ['Faithfulness & Answer Relevance Metrics'],
        status: 'Implemented'
      },
      {
        id: 'report',
        label: '06. Evaluation Reports',
        sublabel: 'Diagnostic Breakdown',
        role: 'Aggregates per-query and corpus-level metrics to compare chunking and retrieval configurations.',
        details: 'Exports structured JSON/Markdown evaluation artifacts for experiment tracking.',
        inputs: ['Retrieval Quality Scores', 'Faithfulness Metrics'],
        outputs: ['Comparative Evaluation Report'],
        status: 'Implemented'
      }
    ],
    implementation: [
      'Implemented modular document ingestion and configurable chunking pipelines with metadata preservation.',
      'Built vector indexing and top-k similarity retrieval with similarity threshold logging.',
      'Constructed the RAG evaluation triad assessing Context Relevance, Answer Faithfulness (Groundedness), and Answer Relevance.',
      'Designed structured diagnostic outputs that categorize errors into Retrieval Misses vs. Generation Hallucinations.'
    ],
    engineeringDecisions: [
      {
        decision: 'Decomposed RAG Triad Evaluation Over Single End-to-End Scoring',
        rationale: 'A single pass/fail score on the final answer hides whether a bad answer was caused by poor chunk retrieval or poor LLM adherence.',
        tradeoff: 'Increases evaluation pass overhead per test question, but gives actionable diagnostic signals for engineering iteration.'
      },
      {
        decision: 'Explicit Chunk Lineage IDs',
        rationale: 'Changing chunk overlap invalidates naive positional indexes.',
        tradeoff: 'Requires deterministic content hashing and document offset metadata on every indexed chunk.'
      }
    ],
    technicalChallenges: [
      'Balancing chunk size: small chunks (128–256 tokens) often score high cosine similarity on keywords but lose surrounding conditional context, while large chunks (1024+ tokens) dilute embedding specificity.',
      'Ensuring LLM-as-a-judge evaluation prompts remain deterministic and do not favor verbose answers over concise grounded answers.'
    ],
    resultsAndEvaluation:
      'Validated across technical documentation corpora by comparing chunking window configurations and top-k depths. The platform cleanly isolates retrieval coverage bottlenecks from prompt adherence failures.',
    metrics: [
      {
        label: 'Evaluation Dimensions',
        value: '3 Core Axes',
        context: 'Context Relevance, Grounded Faithfulness, and Answer Relevance'
      },
      {
        label: 'Pipeline Modularity',
        value: '6 Subsystems',
        context: 'From document normalization to comparative diagnostic reporting'
      },
      {
        label: 'Failure Attribution',
        value: 'Retrieval vs. Synthesis',
        context: 'Explicit separation of vector miss vs. ungrounded generation'
      }
    ],
    verificationMatrix: [
      {
        aspect: 'Ingestion, Chunking & Vector Retrieval',
        stage: 'CAD / Code Implemented',
        notes: 'Complete ingestion, configurable chunking, embedding generation, and top-k retrieval implemented.'
      },
      {
        aspect: 'Retrieval & Response Quality Metrics',
        stage: 'Offline / Lab Evaluated',
        notes: 'Evaluation harness tested across technical Q&A datasets with documented diagnostic breakdowns.'
      },
      {
        aspect: 'High-Throughput Distributed Cluster',
        stage: 'Ongoing / Unverified',
        notes: 'Designed as an engineering evaluation workbench, not a multi-node distributed production cluster.'
      }
    ],
    limitations: [
      'LLM-assisted faithfulness scoring carries inherent judge-model bias and latency compared to lexical overlap metrics, requiring calibrated rubrics.',
      'Currently evaluates text-based documents; multi-modal table and figure extraction from complex two-column PDFs requires external OCR preprocessing.'
    ],
    futureImprovements: [
      'Add hybrid retrieval benchmarks combining dense embeddings with sparse BM25 lexical scoring and reciprocal rank fusion (RRF).',
      'Implement automated synthetic test-set generation from source corpora with adversarial hard-negative queries.'
    ],
    techStack: ['Python', 'Vector Databases', 'Embeddings', 'RAG Architecture', 'LLM Evaluation', 'Information Retrieval'],
    visualSignature: 'rag-retrieval',
    assetDisclosure: 'Interactive RAG evaluation pipeline inspector illustrates the implemented retrieval and scoring methodology without fabricated benchmark charts.',
    repositoryStatus: 'Source code & evaluation methodology available on GitHub',
    repositoryUrl: 'https://github.com/Justin-io/rag-eval-platform'
  },
  {
    slug: 'voide',
    index: '03',
    title: 'V.O.I.D.E.',
    fullName: 'V.O.I.D.E. — Visual Operational Intelligence & Data Engineering',
    category: 'Industrial Intelligence / Data Science',
    categoryGroup: 'ai-data',
    maturity: 'Experimentally Validated',
    maturityNote: 'Validated offline against a 25,003-record, 11-channel chiller telemetry dataset across 3 industrial chiller entities.',
    shortDescription:
      'An industrial data intelligence system focused on equipment telemetry, data quality, anomaly-oriented analysis, and predictive insights.',
    overview:
      'Industrial HVAC and chiller systems generate continuous multi-sensor telemetry, yet raw operational logs often suffer from sensor dropout, out-of-range spikes, and strong multicollinearity across thermodynamic variables. V.O.I.D.E. structures raw equipment telemetry into an audited data engineering pipeline, computing health indices, data quality scores, and regularized predictive models.',
    problemStatement:
      'Raw telemetry streams from industrial chillers contain noisy intervals, missing timestamps, and tightly coupled thermal channels (e.g., supply/return temperatures, compressor load, condenser pressure). Applying standard ordinary least squares (OLS) regression directly to uncleaned, collinear telemetry produces unstable coefficients and unreliable equipment health alerts.',
    engineeringObjective:
      'Process and audit 25,003 telemetry records across 11 sensor channels for three monitored entities (CHILLER-01, CHILLER-02, CHILLER-03), quantify dataset quality, engineer thermodynamic features, and train a stable regularized predictive model.',
    constraints: [
      'Maintain strict entity isolation across CHILLER-01, CHILLER-02, and CHILLER-03 during time-series windowing.',
      'Quantify telemetry completeness, validity, and consistency via an explicit Data Quality Score before model fitting.',
      'Address severe multicollinearity among thermal and load sensors using L2 regularization (Ridge Regression).',
      'Present results strictly as offline dataset analysis and modeling without fabricating live industrial SCADA deployment claims.'
    ],
    systemArchitectureSummary:
      'A 5-stage industrial data engineering and predictive analytics pipeline operating over 11-channel equipment telemetry.',
    architectureNodes: [
      {
        id: 'telemetry-ingest',
        label: '01. Telemetry Ingestion',
        sublabel: '25,003 Records · 11 Channels',
        role: 'Loads multi-entity time-series logs for CHILLER-01, CHILLER-02, and CHILLER-03.',
        details: 'Parses timestamp alignment and validates channel schema across all 11 operational sensor streams.',
        inputs: ['Raw Chiller Telemetry Dataset'],
        outputs: ['Entity-Partitioned Time-Series Frames'],
        status: 'Implemented'
      },
      {
        id: 'quality-audit',
        label: '02. Data Quality Engine',
        sublabel: 'Reported Quality Score: 90.4 / 100',
        role: 'Audits completeness, range adherence, timestamp continuity, and sensor spike anomalies.',
        details: 'Computes a composite telemetry quality index (90.4/100 across the dataset) and isolates corrupted intervals.',
        inputs: ['Entity-Partitioned Time-Series Frames'],
        outputs: ['Audited Telemetry & Quality Breakdown'],
        status: 'Implemented'
      },
      {
        id: 'feature-eng',
        label: '03. Thermodynamic Feature Engineering',
        sublabel: 'Delta-T & Load Ratios',
        role: 'Constructs domain features including thermal differentials, rolling baselines, and standardized sensor scales.',
        details: 'Applies z-score standardization necessary for penalized regression stability.',
        inputs: ['Audited Telemetry'],
        outputs: ['Standardized Feature Matrix'],
        status: 'Implemented'
      },
      {
        id: 'ridge-model',
        label: '04. Regularized Predictive Modeling',
        sublabel: 'Ridge Regression · R² = 0.9896',
        role: 'Fits L2-regularized Ridge Regression to predict target operational performance under collinear sensor inputs.',
        details: 'Achieved a reported R² of 0.9896 on the evaluated dataset while stabilizing coefficient variance.',
        inputs: ['Standardized Feature Matrix'],
        outputs: ['Regularized Model & Residual Series'],
        status: 'Implemented'
      },
      {
        id: 'anomaly-ui',
        label: '05. Operational Intelligence View',
        sublabel: 'Residual & Health Diagnostics',
        role: 'Visualizes equipment health indicators, channel distributions, and prediction residuals per chiller.',
        details: 'Highlights deviations between expected thermodynamic behavior and observed telemetry.',
        inputs: ['Regularized Model & Residual Series'],
        outputs: ['Interactive Analytical Dashboard'],
        status: 'Implemented'
      }
    ],
    implementation: [
      'Processed 25,003 telemetry records spanning 11 sensor channels across three monitored chiller units (CHILLER-01, CHILLER-02, CHILLER-03).',
      'Developed an automated telemetry data quality scoring pipeline resulting in an overall dataset quality score of 90.4/100.',
      'Engineered normalized thermal and operational load features to capture physical equipment behavior.',
      'Trained and evaluated a Ridge Regression model achieving a reported R² of 0.9896 on the evaluated telemetry dataset.'
    ],
    engineeringDecisions: [
      {
        decision: 'Ridge Regression (L2 Penalty) Over Unregularized Linear / Complex Black-Box Models',
        rationale: 'Thermodynamic chiller channels exhibit strong physical collinearity. Ridge Regression shrinks correlated weights smoothly while keeping coefficients physically interpretable for engineers.',
        tradeoff: 'Assumes predominantly linear relationships in the transformed feature space; non-linear regime shifts during hard mechanical faults require complementary residual thresholding.'
      },
      {
        decision: 'Upfront Data Quality Scoring Gate (90.4/100)',
        rationale: 'Training predictive models on unverified sensor logs conflates sensor hardware dropouts with mechanical equipment degradation.',
        tradeoff: 'Requires filtering and imputing ~9.6% of flagged/degraded telemetry intervals prior to regression fitting.'
      }
    ],
    technicalChallenges: [
      'Mitigating multicollinearity across the 11 coupled telemetry channels without discarding physically meaningful sensor signals.',
      'Preventing data leakage across CHILLER-01, CHILLER-02, and CHILLER-03 during feature scaling and evaluation splits.',
      'Distinguishing transient load step-changes from genuine operational anomalies in residual plots.'
    ],
    resultsAndEvaluation:
      'Evaluated on the 25,003-record multi-chiller dataset. The data quality auditing pipeline established a verified quality baseline of 90.4/100, and the Ridge Regression model achieved an R² of 0.9896 on the evaluated dataset split.',
    metrics: [
      {
        label: 'Telemetry Dataset',
        value: '25,003 Records',
        context: '11 sensor channels across CHILLER-01, CHILLER-02, CHILLER-03'
      },
      {
        label: 'Telemetry Quality Score',
        value: '90.4 / 100',
        context: 'Composite completeness, range validity & continuity index'
      },
      {
        label: 'Ridge Regression R²',
        value: '0.9896',
        context: 'Offline evaluation fit on the 11-channel telemetry dataset'
      }
    ],
    verificationMatrix: [
      {
        aspect: '25,003-Record · 11-Channel Telemetry Pipeline',
        stage: 'CAD / Code Implemented',
        notes: 'Entity partitioning for CHILLER-01, CHILLER-02, and CHILLER-03 and quality scoring implemented.'
      },
      {
        aspect: 'Quality Score (90.4/100) & Ridge R² (0.9896)',
        stage: 'Offline / Lab Evaluated',
        notes: 'Verified from documented offline evaluation on the project dataset.'
      },
      {
        aspect: 'Live Physical Plant SCADA Integration',
        stage: 'Ongoing / Unverified',
        notes: 'Evaluated on recorded industrial telemetry datasets; not deployed as a live control loop in an operating facility.'
      }
    ],
    limitations: [
      'The high R² (0.9896) reflects strong thermodynamic coupling within the recorded dataset operating envelope; extrapolation to catastrophic mechanical failure modes outside historical bounds is not guaranteed.',
      'Operates on batch/recorded telemetry datasets rather than real-time PLC/Modbus streaming hardware.'
    ],
    futureImprovements: [
      'Add time-series forecasting horizons (e.g., 1-hour ahead condenser fouling drift estimation) alongside contemporaneous regression.',
      'Implement per-channel SHAP/coefficient contribution attribution for root-cause anomaly explanations.'
    ],
    techStack: ['Python', 'Scikit-Learn (Ridge)', 'Pandas', 'Data Quality Engineering', 'Time-Series Telemetry', 'Analytical Visualization'],
    visualSignature: 'voide-telemetry',
    assetDisclosure: 'Interactive telemetry workspace below visualizes the documented 25,003-record, 11-channel structure (CHILLER-01/02/03, 90.4/100 quality score, 0.9896 Ridge R²). No fake real-time plant streams are fabricated.',
    repositoryStatus: 'Case study & analytical implementation available on GitHub',
    repositoryUrl: 'https://github.com/Justin-io/V.O.I.D.E'
  },
  {
    slug: 'orion-x-r1',
    index: '04',
    title: 'ORION-X R1',
    fullName: 'ORION-X R1 — Kintex-7 PCIe FPGA Accelerator Hardware Design Study',
    category: 'Hardware Engineering / FPGA / PCB Design',
    categoryGroup: 'hardware',
    maturity: 'Design Study',
    maturityNote: 'Hardware & multilayer PCB engineering design study in KiCad. Not physically manufactured or board-validated; electrical validation is ongoing.',
    shortDescription:
      'An advanced FPGA accelerator-board design study exploring high-density digital hardware, PCIe interfacing, DDR3L memory architecture, power delivery, and multilayer PCB design.',
    overview:
      'ORION-X R1 is an independent hardware engineering design study exploring the architecture and multilayer PCB layout of an FPGA add-in accelerator card. Built around the AMD Kintex-7 XC7K160T FPGA in KiCad, the study investigates high-speed differential signaling (PCIe Gen2 x4), dual DDR3L memory topology (32-bit combined bus), QSPI configuration storage, and multi-rail step-down power delivery.',
    problemStatement:
      'Transitioning from microcontroller boards to high-density digital hardware requires confronting signal integrity, controlled impedance stack-ups, multi-rail power sequencing, BGA fanout, and strict length-matching constraints for external DDR3L memory and PCIe lanes.',
    engineeringObjective:
      'Execute a comprehensive schematic, custom footprint library, and multilayer PCB layout study in KiCad for an AMD Kintex-7 XC7K160T PCIe Gen2 x4 accelerator board with dual DDR3L memory devices, while rigorously documenting design targets versus verification status.',
    constraints: [
      'Target AMD Kintex-7 XC7K160T BGA package fanout and bank voltage assignment rules.',
      'Interface two 16-bit DDR3L devices to form a 32-bit combined memory bus at 1.35V with fly-by/matched routing topology considerations.',
      'Route a 4-lane PCI Express Gen2 x4 edge connector interface with AC coupling capacitors and differential pair constraints.',
      'Maintain strict engineering transparency: distinguish CAD design targets from unverified physical silicon/board validation.'
    ],
    systemArchitectureSummary:
      'Central AMD Kintex-7 XC7K160T FPGA fabric coupled to a 32-bit dual-DDR3L memory subsystem, PCIe Gen2 x4 host interface, QSPI boot flash, and sequenced multi-rail DC-DC power delivery network.',
    architectureNodes: [
      {
        id: 'fpga-core',
        label: '01. Core FPGA Fabric',
        sublabel: 'AMD Kintex-7 XC7K160T',
        role: 'Primary programmable logic fabric, GTX transceivers, and SelectIO memory controller banks.',
        details: 'Schematic bank partitioning across High-Performance (HP) and High-Range (HR) I/O banks with dedicated decoupling networks.',
        inputs: ['Multi-Rail Power (VCCINT, VCCAUX, VCCO)', 'Reference Clocks', 'QSPI Config Stream'],
        outputs: ['PCIe GTX Lanes', 'DDR3L Memory Bus'],
        status: 'Design Target'
      },
      {
        id: 'memory-sub',
        label: '02. DDR3L Memory Subsystem',
        sublabel: '2 × DDR3L · 32-Bit Combined Bus',
        role: 'Dual 16-bit DDR3L SDRAM devices operating at 1.35V forming a 32-bit data path.',
        details: 'Explores byte-lane grouping, DQS differential strobe pairing, address/command routing, and VTT termination rail planning.',
        inputs: ['1.35V VDDQ / 0.675V VTT', 'FPGA Memory Controller I/O'],
        outputs: ['32-Bit External Memory Interface'],
        status: 'Design Target'
      },
      {
        id: 'pcie-if',
        label: '03. Host Interconnect',
        sublabel: 'PCI Express Gen2 x4 Target',
        role: 'Four high-speed differential TX/RX transceiver lanes connecting the PCIe edge finger to Kintex-7 GTX quads.',
        details: 'Includes 100nF AC coupling capacitors on TX pairs, 100MHz differential reference clock routing, and PERST# wake/reset lines.',
        inputs: ['Host PCIe x4 Edge Connector'],
        outputs: ['4-Lane GTX Differential Links'],
        status: 'Design Target'
      },
      {
        id: 'config-clock',
        label: '04. Configuration & Clocking',
        sublabel: 'QSPI Flash & JTAG',
        role: 'Non-volatile bitstream storage via QSPI flash and dedicated JTAG header for boundary scan and programming.',
        details: 'Master SPI x4 configuration topology designed for power-on bitstream loading.',
        inputs: ['3.3V Aux Rail', 'JTAG / SPI Signals'],
        outputs: ['FPGA Configuration Bitstream'],
        status: 'Implemented'
      },
      {
        id: 'pdn',
        label: '05. Power Delivery Network',
        sublabel: '12V Edge to Multi-Rail Buck Stages',
        role: 'Steps down 12V PCIe slot power to core (1.0V VCCINT), auxiliary (1.8V VCCAUX), DDR3L (1.35V), and I/O (3.3V) rails.',
        details: 'CAD layout study of high-current copper polygons, inductor placement, and bulk/high-frequency ceramic capacitor placement under the BGA.',
        inputs: ['12V / 3.3V PCIe Slot Supply'],
        outputs: ['1.0V, 1.35V, 1.8V, 3.3V Regulated Rails'],
        status: 'Design Target'
      },
      {
        id: 'pcb-stackup',
        label: '06. Multilayer PCB & CAD Workflow',
        sublabel: 'KiCad Custom Libraries & Outputs',
        role: 'Multilayer stack-up partitioning signal routing planes from continuous ground and power reference planes.',
        details: 'Includes custom schematic symbols, BGA footprint verification, routing studies, and preliminary Gerber/drill manufacturing output generation.',
        inputs: ['KiCad Schematic Netlist'],
        outputs: ['Multilayer PCB Layout & Manufacturing Study Files'],
        status: 'Implemented'
      }
    ],
    implementation: [
      'Created custom KiCad symbol and footprint libraries for the AMD Kintex-7 XC7K160T BGA package, DDR3L SDRAM devices, and power stages.',
      'Designed multi-sheet hierarchical schematics covering FPGA bank assignments, dual DDR3L 32-bit bus wiring, PCIe Gen2 x4 GTX transceiver connections, QSPI flash, and DC-DC buck converters.',
      'Executed multilayer PCB component placement, BGA escape routing, and power plane partitioning in KiCad.',
      'Generated preliminary manufacturing-oriented output packages (Gerber/drill/BOM structure) as part of the CAD workflow study.'
    ],
    engineeringDecisions: [
      {
        decision: 'Dual 16-Bit DDR3L Topology (32-Bit Combined Bus) at 1.35V',
        rationale: 'Balances memory bandwidth and routing density on a compact add-in card without requiring a full 64-bit SODIMM connector footprint.',
        tradeoff: 'Demands careful address/command routing and byte-group length matching across two discrete BGA memory packages.'
      },
      {
        decision: 'Explicit Separation of Design Study Targets vs. Physical Verification Claims',
        rationale: 'Committed repository files reflect an evolving hardware learning and design study with ongoing electrical verification.',
        tradeoff: 'Requires explicitly flagging that DRC/ERC cleanup, SI simulation, and physical fabrication have not been completed rather than presenting the board as production-ready.'
      }
    ],
    technicalChallenges: [
      'Planning BGA escape routing for the high-pin-count XC7K160T package while preserving solid reference planes beneath high-speed differential pairs.',
      'Managing tight placement constraints for BGA underside decoupling capacitors alongside via fanout arrays.',
      'Reconciling schematic bank voltage rules and DRC/ERC constraints across iterative CAD revisions.'
    ],
    resultsAndEvaluation:
      'Completed the hierarchical schematic capture, custom component library creation, multilayer PCB placement/routing architecture, and preliminary manufacturing file generation in KiCad. In accordance with strict engineering integrity, ORION-X R1 is presented accurately as a hardware & PCB design study. The board has not been physically manufactured, and electrical/DRC sign-off remains ongoing.',
    metrics: [
      {
        label: 'Target FPGA Device',
        value: 'XC7K160T',
        context: 'AMD Kintex-7 FPGA architecture (Design Target)'
      },
      {
        label: 'Memory Architecture',
        value: '2 × DDR3L (32-bit)',
        context: 'Dual 16-bit DDR3L SDRAM topology at 1.35V'
      },
      {
        label: 'Host Interface Target',
        value: 'PCIe Gen2 x4',
        context: '4-lane GTX transceiver target interface + QSPI storage'
      }
    ],
    verificationMatrix: [
      {
        aspect: 'KiCad Schematics, Custom Libraries & PCB Layout Study',
        stage: 'CAD / Code Implemented',
        notes: 'Hierarchical schematics, custom footprints, placement, routing views, and preliminary manufacturing outputs created in KiCad.'
      },
      {
        aspect: 'PCIe Gen2 x4 & 32-Bit DDR3L Architecture',
        stage: 'Design Target',
        notes: 'Designed at the schematic and CAD topology level as engineering targets.'
      },
      {
        aspect: 'DRC / ERC & Signal Integrity Sign-Off',
        stage: 'Ongoing / Unverified',
        notes: 'Previous validation logs contain conflicting findings; final DRC/ERC and impedance verification is ongoing and not claimed as a clean release.'
      },
      {
        aspect: 'Physical Fabrication, Bring-Up, PCIe Enumeration & DDR Training',
        stage: 'Ongoing / Unverified',
        notes: 'Not physically manufactured. No claims are made regarding physical bring-up, PCIe enumeration, DDR training, or measured thermal/power efficiency.'
      }
    ],
    limitations: [
      'Design Study Status: The PCB has not been physically fabricated or assembled; zero claims are made of physical hardware bring-up.',
      'Unverified High-Speed Links: PCIe Gen2 x4 enumeration and DDR3L memory leveling/training have not been tested in hardware or full electromagnetic 3D field simulation.',
      'Ongoing Validation: Committed documentation and older verification reports contain discrepancies; current electrical and DRC validation is ongoing.'
    ],
    futureImprovements: [
      'Complete a full zero-error ERC/DRC audit across the latest KiCad schematic and board revision, reconciling power-rail and pin-assignment warnings.',
      'Perform pre-layout and post-layout impedance and flight-time skew analysis for the 32-bit DDR3L byte lanes.',
      'Design a lower-layer-count validation test coupon before committing to full multilayer fabrication.'
    ],
    techStack: ['KiCad', 'Multilayer PCB Design', 'AMD Kintex-7 XC7K160T', 'DDR3L Architecture', 'PCIe Gen2 x4 Target', 'Power Delivery Design'],
    visualSignature: 'orion-fpga',
    conceptRenderImage: '/src/assets/images/orion_x_fpga_cad_render_1795162936048.jpg',
    assetDisclosure: 'The primary interactive view below is an accurate engineering architectural schematic & stack-up diagram built from documented ORION-X R1 specifications (XC7K160T, 2×DDR3L 32-bit, PCIe Gen2 x4). The secondary 3D CAD concept render tab is clearly labeled as an illustrative visualization slot pending insertion of exported KiCad raytraced renders.',
    repositoryStatus: 'KiCad design study files & documentation available on GitHub',
    repositoryUrl: 'https://github.com/Justin-io/ORION-X-R1'
  },
  {
    slug: 'jarvis',
    index: '05',
    title: 'JARVIS',
    fullName: 'JARVIS — Local-First Personal Assistant & Multi-Tier Routing Architecture',
    category: 'Local-First AI / Personal Assistant Systems',
    categoryGroup: 'systems-research',
    maturity: 'Research Project',
    maturityNote: 'Experimental local-first assistant architecture exploring intent classification, local LLM execution, and selective cloud fallback.',
    shortDescription:
      'An experimental personal assistant architecture exploring local intelligence, model routing, contextual automation, and cloud-assisted reasoning.',
    overview:
      'Relying exclusively on cloud APIs for personal engineering assistance introduces latency, recurring token costs, and privacy trade-offs when handling local system context. JARVIS is an experimental architecture that prioritizes local execution (via deterministic intent handlers and local quantized models on Ollama / llama.cpp) and routes only complex multi-step reasoning queries to cloud fallback models.',
    problemStatement:
      'Most assistant workflows treat every command identically—sending trivial system actions, local file lookups, and deep architectural reasoning queries alike to a heavy remote LLM. An efficient systems architecture should match query complexity and privacy sensitivity to the right compute tier.',
    engineeringObjective:
      'Design a modular, local-first assistant architecture featuring lightweight intent classification, multi-tier model routing, local execution modules, and explicit privacy boundaries for cloud fallback.',
    constraints: [
      'Default to local execution for system automation, routine commands, and privacy-sensitive context.',
      'Keep local model memory footprints within consumer hardware bounds using quantized GGUF models via Ollama / llama.cpp.',
      'Never expose private API credentials, user environment data, or unrestricted shell execution without explicit confirmation gates.',
      'Clearly distinguish implemented routing/local modules from experimental long-term contextual automation modules.'
    ],
    systemArchitectureSummary:
      'A 3-Tier Intelligence Router sitting between a Context & Intent Ingress layer and Modular Action Executors.',
    architectureNodes: [
      {
        id: 'intent-router',
        label: '01. Intent Classification & Router',
        sublabel: 'Latency & Privacy Gatekeeper',
        role: 'Analyzes incoming requests for task category, token complexity, and privacy sensitivity.',
        details: 'Routes requests across three compute tiers based on deterministic rules and lightweight classification.',
        inputs: ['User Command / Query', 'Workspace Context Flags'],
        outputs: ['Tier 1, Tier 2, or Tier 3 Dispatch'],
        status: 'Implemented'
      },
      {
        id: 'tier1-local',
        label: '02. Tier 1 — Deterministic Automation',
        sublabel: 'Sub-50ms Local Handlers',
        role: 'Executes structured system workflows, workspace scripts, and environment lookups without invoking an LLM.',
        details: 'Eliminates hallucination and latency for well-defined engineering commands.',
        inputs: ['Tier 1 Dispatch'],
        outputs: ['Direct System Action / Telemetry'],
        status: 'Implemented'
      },
      {
        id: 'tier2-llm',
        label: '03. Tier 2 — Local Model Inference',
        sublabel: 'Ollama / llama.cpp Quantized Models',
        role: 'Handles code summarization, log parsing, and private drafting entirely on local hardware.',
        details: 'Uses quantized local weights so zero workspace data leaves the machine.',
        inputs: ['Tier 2 Dispatch', 'Local Context Window'],
        outputs: ['Locally Synthesized Response'],
        status: 'Implemented'
      },
      {
        id: 'tier3-cloud',
        label: '04. Tier 3 — Cloud-Assisted Reasoning',
        sublabel: 'Sanitized Cloud Fallback',
        role: 'Escalates complex algorithmic synthesis or broad knowledge queries to frontier cloud APIs when authorized.',
        details: 'Strips sensitive local environment variables and credentials prior to outbound dispatch.',
        inputs: ['Sanitized Tier 3 Prompt'],
        outputs: ['High-Depth Reasoning Output'],
        status: 'Experimental'
      },
      {
        id: 'extensible-mods',
        label: '05. Contextual & Extensible Modules',
        sublabel: 'Plugin & Memory Adapters',
        role: 'Provides modular hooks for developer tooling, notes indexing, and session state.',
        details: 'Designed as decoupled adapters so experimental modules can be toggled independently.',
        inputs: ['Router Dispatch Events'],
        outputs: ['Scoped Tool Results'],
        status: 'Experimental'
      }
    ],
    implementation: [
      'Architected a multi-tier routing layer separating deterministic command execution, local LLM inference (Ollama / llama.cpp), and cloud fallback.',
      'Implemented local model orchestration wrappers supporting structured prompt formatting and timeout fallback.',
      'Designed credential and environment sanitization rules ensuring private tokens and sensitive paths are never logged or transmitted.',
      'Created extensible module interfaces for developer workflow automation.'
    ],
    engineeringDecisions: [
      {
        decision: 'Three-Tier Compute Hierarchy (Deterministic -> Local LLM -> Cloud Fallback)',
        rationale: 'Running a 70B+ parameter model for a simple command wastes seconds and gigabytes of VRAM; running a small 3B/7B local model on complex architectural synthesis often underperforms.',
        tradeoff: 'Requires maintaining an explicit routing policy and threshold calibration between Tier 2 and Tier 3.'
      },
      {
        decision: 'Strict Sanitization Boundary Before Cloud Fallback',
        rationale: 'Local assistants frequently have access to shell history or project directories that may contain secrets.',
        tradeoff: 'Limits automatic full-repository context forwarding on Tier 3 cloud calls unless explicitly whitelisted.'
      }
    ],
    technicalChallenges: [
      'Minimizing cold-start model loading latency when switching local GGUF models in constrained RAM/VRAM environments.',
      'Preventing false-positive escalations in the intent router while keeping classification overhead negligible.',
      'Maintaining clean module boundaries so experimental plugins cannot crash the core routing loop.'
    ],
    resultsAndEvaluation:
      'Demonstrates a clean, modular local-first assistant architecture that keeps routine automation and private queries on local compute while preserving an opt-in path for deep cloud reasoning.',
    metrics: [
      {
        label: 'Compute Hierarchy',
        value: '3 Tiers',
        context: 'Deterministic Local, Local Quantized LLM, Cloud Fallback'
      },
      {
        label: 'Local Runtime',
        value: 'Ollama / llama.cpp',
        context: 'Offline-capable local model inference layer'
      },
      {
        label: 'Architecture Status',
        value: 'Experimental',
        context: 'Modular research system with explicit privacy boundaries'
      }
    ],
    verificationMatrix: [
      {
        aspect: 'Multi-Tier Routing & Local Inference Integration',
        stage: 'CAD / Code Implemented',
        notes: 'Intent routing logic and local Ollama / llama.cpp inference integration implemented.'
      },
      {
        aspect: 'Cloud Fallback & Sanitization Policy',
        stage: 'Offline / Lab Evaluated',
        notes: 'Tiered fallback behavior and payload redaction boundaries tested in local development.'
      },
      {
        aspect: 'Autonomous OS-Wide Background Agents',
        stage: 'Ongoing / Unverified',
        notes: 'Marked explicitly as experimental research; full autonomous OS control is not claimed.'
      }
    ],
    limitations: [
      'Local inference throughput and context window depth are bounded by local host GPU/RAM resources.',
      'Several contextual automation and persistent memory adapters remain experimental research modules rather than hardened consumer software.'
    ],
    futureImprovements: [
      'Implement confidence-score calibration using token log-probabilities from the local model to trigger automatic Tier 3 escalation.',
      'Add an auditable local SQLite ledger recording every routing decision and outbound token payload.'
    ],
    techStack: ['Python', 'Ollama', 'llama.cpp', 'Local-First AI', 'Model Routing', 'System Automation'],
    visualSignature: 'jarvis-router',
    assetDisclosure: 'Interactive 3-tier routing simulator below illustrates the documented JARVIS routing architecture without exposing private credentials or proprietary environment configurations.',
    repositoryStatus: 'Architecture documentation & public modules available on GitHub',
    repositoryUrl: 'https://github.com/Justin-io/J.A.R.V.I.S.M1'
  }
];
