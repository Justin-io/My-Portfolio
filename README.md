# Hari Nandan K — Engineering Portfolio

Source for [justinalexia.vercel.app](https://justinalexia.vercel.app/), a static portfolio covering selected work in applied AI, data systems, retrieval evaluation, defensive security, environmental intelligence, digital signal processing and embedded engineering.

## What the site contains

- **Selected engineering work** — three case studies with architecture, repository test evidence and explicit scope limits.
- **R&D archive** — a searchable selection of projects from the public GitHub repositories.
- **Technical capabilities** — tools and methods observed in the selected project code and documentation.
- **Engineering evidence** — a distinction between automated tests, synthetic benchmarks, simulations, prototypes and physical validation.
- **Contact and resume links** — direct project inquiry and CV access.

## Implementation

The deployed site is a static HTML/CSS/JavaScript application. It uses:

- Three.js (WebGPU import map) for the interactive background scene.
- GSAP and ScrollTrigger for motion.
- Bootstrap and local/vendor CSS for layout and components.
- Vanilla JavaScript for navigation, project filtering, contact form handling and progressive enhancement.
- A service worker for basic same-origin caching.

There is no application build step required for the static portfolio itself. Preview locally with any static HTTP server from the repository root, for example:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Content and evidence policy

Project descriptions are based on the linked repository documentation and checked project artifacts. Metrics are scoped to the project that reports them. Synthetic data, benchmark harnesses, emulated telemetry, simulation outputs and code-level tests are not presented as real-world production validation.

The public project list is curated. Older experiments, forks, empty repositories, inaccessible repositories and unrelated templates are not automatically represented as completed work. Some repositories are deliberately omitted because their current source or documentation does not support a reliable project description.

## License

The repository includes a **BSD 2-Clause License** in `LICENSE`. That license applies according to its terms to covered source code. Third-party libraries, fonts, images and other assets may have separate licenses or usage conditions; review their respective notices before reuse.

## Links

- Portfolio: https://justinalexia.vercel.app/
- GitHub profile: https://github.com/Justin-io
- Selected projects: https://github.com/Justin-io
