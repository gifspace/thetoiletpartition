# Deploy handoff

- Branch: `backup-v.2`.
- Latest checkpoint: homepage, products/archive, product detail, about, works, material selector, customer section, responsive header/hero updates, Thai-context About/Contact imagery, and global scroll controls.
- Product filter is non-sticky on desktop; Back to Top is global, hidden while scrolling down, and shown while scrolling up after 30% page progress.
- Works Hero uses a mobile-only 50px left shift so the orange partition installation remains visible on narrow screens.
- PDFs, ZIP archives, staging folders, and source/reference-only folders are excluded from deployment and Git.
- Hosting package: [`export/thetoiletpartition-hosting-2026-09-03.zip`](export/thetoiletpartition-hosting-2026-09-03.zip) contains the prior latest package; regenerate it after this checkpoint if the new Works Hero adjustment is needed in hosting.
- Validation: `node --check assets/js/main.js` and `git diff --check` pass before commit.
- Project memory: [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) records the runtime, packaging, and verification conventions.
