# Hari Nandan K. — Applied AI & Systems Engineering Portfolio

Production-ready personal portfolio and technical case study platform engineered with React 19, TypeScript, Tailwind CSS v4, and Vite.

## Architecture & Technology Stack

- **Framework**: React 19 (`react`, `react-dom`)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom liquid-glass and obsidian astrometric tokens
- **Animations & Physics**: Motion v12 (`motion`), custom parametric snake trajectory physics, and hydro-droplet nanobot swarm engine
- **Icons**: Lucide React
- **Build Toolchain**: Vite 8 with ESModule bundling

## Flagship Case Studies

1. **Autonomous AI Data Scientist**: 7-stage deterministic reasoning pipeline with AST SQL validation and hypothesis testing.
2. **Production RAG Evaluation Platform**: Dual-layer retrieval vs. faithfulness verification harnesses.
3. **V.O.I.D.E. Industrial Intelligence**: Multichannel industrial chiller telemetry analysis with regularized predictive modeling.
4. **ORION-X R1 Accelerator**: AMD Kintex-7 XC7K160T PCIe Gen2 x4 hardware design study in KiCad.
5. **JARVIS Architecture**: 3-tier local-first personal assistant with privacy-preserving cloud routing.

## Development & Build Commands

```bash
# Install production-locked dependencies
npm install

# Run static type checking
npm run lint

# Execute automated logic and physics test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## Security & Production Hardening

- **Zero Data Leak**: No secret keys, credentials, or private API endpoints committed in code or bundles.
- **Sanitized Manifest**: Strict `.gitignore` preventing exposure of local credentials, `.env*` files, operating system caches, and debug logs.
- **Security Headers**: Enforced via `vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Permissions-Policy`).
- **Input Validation**: Client-side form constraints with strict mailto construction and AST validation.
