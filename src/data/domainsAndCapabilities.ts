export interface ExplorationDomain {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
  relatedProjectSlugs: {
    slug: string;
    title: string;
    maturity: string;
  }[];
  architectureHighlight: string;
}

export interface CapabilityGroup {
  id: string;
  category: string;
  contextNote: string;
  items: {
    name: string;
    linkedEvidence: string;
  }[];
}

export const EXPLORATION_DOMAINS: ExplorationDomain[] = [
  {
    id: 'applied-ai',
    index: '01',
    title: 'Applied AI & Intelligent Systems',
    subtitle: 'Agentic workflows · Retrieval evaluation · Local inference',
    description:
      'Designing structured AI systems where language models act as bounded components inside deterministic pipelines rather than unconstrained black boxes.',
    topics: [
      'Agentic AI systems',
      'LLM applications',
      'Retrieval-Augmented Generation',
      'Model evaluation',
      'Local language models',
      'AI orchestration',
      'Intelligent automation'
    ],
    relatedProjectSlugs: [
      { slug: 'autonomous-ai-data-scientist', title: 'Autonomous AI Data Scientist', maturity: 'Prototype' },
      { slug: 'rag-evaluation-platform', title: 'Production RAG Evaluation Platform', maturity: 'Experimentally Validated' },
      { slug: 'jarvis', title: 'JARVIS Local-First Assistant', maturity: 'Research Project' }
    ],
    architectureHighlight: 'Deterministic schema digests + decomposed retrieval/groundedness metrics + multi-tier local/cloud model routing.'
  },
  {
    id: 'data-science',
    index: '02',
    title: 'Data Science & Data Engineering',
    subtitle: 'Telemetry pipelines · Quality scoring · Regularized modeling',
    description:
      'Turning raw operational and tabular datasets into audited feature matrices, transparent quality indices, and interpretable predictive models.',
    topics: [
      'Data analysis',
      'Statistical modelling',
      'Machine learning',
      'Data pipelines',
      'Data quality',
      'Predictive analytics',
      'Data visualization',
      'Industrial intelligence'
    ],
    relatedProjectSlugs: [
      { slug: 'voide', title: 'V.O.I.D.E. Industrial Telemetry', maturity: 'Experimentally Validated' },
      { slug: 'autonomous-ai-data-scientist', title: 'Autonomous AI Data Scientist', maturity: 'Prototype' }
    ],
    architectureHighlight: '25,003-record 11-channel chiller telemetry analysis · 90.4/100 data quality audit · L2-regularized Ridge Regression (R² = 0.9896).'
  },
  {
    id: 'hardware-systems',
    index: '03',
    title: 'Hardware & Systems Engineering',
    subtitle: 'Multilayer PCB design · High-speed digital · FPGA design studies',
    description:
      'Exploring high-density digital hardware architecture, controlled-impedance multilayer stack-ups, power delivery networks, and FPGA accelerator design studies in KiCad.',
    topics: [
      'PCB design',
      'KiCad',
      'Embedded systems',
      'High-speed digital interfaces',
      'Power delivery networks',
      'Digital electronics',
      'FPGA design studies',
      'Hardware-software integration'
    ],
    relatedProjectSlugs: [
      { slug: 'orion-x-r1', title: 'ORION-X R1 Kintex-7 FPGA Study', maturity: 'Design Study' }
    ],
    architectureHighlight: 'KiCad hierarchical schematics, custom BGA/SMD footprints, and AMD Kintex-7 XC7K160T + 32-bit DDR3L + PCIe Gen2 x4 layout studies.'
  },
  {
    id: 'security-research',
    index: '04',
    title: 'Security & Systems Research',
    subtitle: 'Linux internals · Network fundamentals · Sandboxed execution',
    description:
      'Understanding how operating systems, network protocols, and local execution boundaries behave under failure, automation, and debugging.',
    topics: [
      'Linux systems',
      'Network fundamentals',
      'Penetration-testing labs',
      'System security',
      'Automation',
      'Debugging',
      'Experimental tooling'
    ],
    relatedProjectSlugs: [
      { slug: 'jarvis', title: 'JARVIS Sanitized Local-First Router', maturity: 'Research Project' },
      { slug: 'autonomous-ai-data-scientist', title: 'Sandboxed Code Execution Loop', maturity: 'Prototype' }
    ],
    architectureHighlight: 'Payload sanitization prior to cloud escalation, bounded execution loops, and practical Linux system diagnostics.'
  }
];

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: 'prog-dev',
    category: 'Programming & Development',
    contextNote: 'Core languages used across analytical pipelines, systems automation, and web tooling.',
    items: [
      { name: 'Python', linkedEvidence: 'V.O.I.D.E., RAG Evaluation Platform, AI Data Scientist, JARVIS' },
      { name: 'JavaScript / TypeScript', linkedEvidence: 'Interactive telemetry interfaces & web applications' },
      { name: 'C / C++', linkedEvidence: 'Low-level systems & embedded microcontroller firmware' },
      { name: 'SQL', linkedEvidence: 'Structured analytical querying & tabular data pipelines' },
      { name: 'HTML / CSS', linkedEvidence: 'Responsive technical dashboards & visualization layouts' },
      { name: 'Kotlin', linkedEvidence: 'Android & mobile systems exploration' }
    ]
  },
  {
    id: 'ai-ml',
    category: 'AI & Machine Learning',
    contextNote: 'Focused on verifiable pipelines, retrieval diagnostics, and local-first model routing.',
    items: [
      { name: 'LLM Applications', linkedEvidence: 'Structured code synthesis & grounded analytical reporting' },
      { name: 'Agentic Workflows', linkedEvidence: '7-stage Autonomous AI Data Scientist state machine' },
      { name: 'RAG Systems', linkedEvidence: 'Configurable chunking, dense retrieval & context evaluation' },
      { name: 'Model Evaluation', linkedEvidence: 'Context relevance, faithfulness & retrieval hit-rate harness' },
      { name: 'Machine Learning', linkedEvidence: 'L2-regularized Ridge Regression on multi-channel telemetry' },
      { name: 'Local Model Deployment', linkedEvidence: 'Quantized local inference via Ollama & llama.cpp in JARVIS' }
    ]
  },
  {
    id: 'data-analytics',
    category: 'Data & Analytics',
    contextNote: 'Applied across industrial telemetry datasets and automated exploratory workflows.',
    items: [
      { name: 'Data Analysis', linkedEvidence: 'Schema profiling, quantile analysis & hypothesis testing' },
      { name: 'Data Processing', linkedEvidence: '25,003-record multi-entity telemetry normalization & cleaning' },
      { name: 'Statistical Modelling', linkedEvidence: 'Collinearity diagnostics & regularized linear modeling' },
      { name: 'Visualization', linkedEvidence: 'Telemetry time-series, residual diagnostics & distribution plots' },
      { name: 'Predictive Analytics', linkedEvidence: 'Chiller equipment health modeling (Reported R² = 0.9896)' },
      { name: 'Dashboard Development', linkedEvidence: 'V.O.I.D.E. operational intelligence interface' }
    ]
  },
  {
    id: 'infra-tools',
    category: 'Infrastructure & Tools',
    contextNote: 'Daily development environment, version control, and local inference runtimes.',
    items: [
      { name: 'Linux', linkedEvidence: 'Primary systems environment, shell automation & debugging' },
      { name: 'Git / GitHub', linkedEvidence: 'Source control across software and KiCad hardware repositories' },
      { name: 'Ollama & llama.cpp', linkedEvidence: 'Tier-2 local LLM runtime integration in JARVIS' },
      { name: 'VS Code', linkedEvidence: 'Integrated development, debugging & hardware workflows' },
      { name: 'Firebase & Vercel', linkedEvidence: 'Web application hosting & prototype deployment' }
    ]
  },
  {
    id: 'embedded-hardware',
    category: 'Hardware & Digital Systems',
    contextNote: 'High-density multilayer PCB design studies, FPGA architecture, and digital electronics.',
    items: [
      { name: 'KiCad', linkedEvidence: 'Hierarchical schematics, custom BGA footprints & multilayer PCB layouts' },
      { name: 'Multilayer PCB Design', linkedEvidence: 'ORION-X R1 stack-up, BGA escape routing & power plane partitioning' },
      { name: 'FPGA Design Studies', linkedEvidence: 'AMD Kintex-7 XC7K160T + DDR3L + PCIe Gen2 x4 architectural study' },
      { name: 'High-Speed Interfaces', linkedEvidence: 'PCIe Gen2 x4 differential GTX lanes & 32-bit DDR3L topology study' },
      { name: 'Power Delivery Networks', linkedEvidence: 'Multi-rail DC-DC buck regulation & BGA decoupling architecture' },
      { name: 'Embedded Systems (ESP32 / C++)', linkedEvidence: 'Microcontroller interfacing, I2C/SPI buses & sensor telemetry' }
    ]
  }
];
