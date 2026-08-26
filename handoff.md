# Deploy handoff

- Branch: `backup-v.2`.
- Latest checkpoint: homepage, products/archive, product detail, about, works, material selector, customer section, and responsive header/hero updates are staged for commit.
- Excluded from the commit: `revise-1/` source/reference media, PDFs, and previously tracked image assets. New runtime images required by the updated pages are included only where they are not already on the remote.
- Validation: local pages return HTTP 200; `node --check assets/js/main.js` and `git diff --check` pass.
- Project memory: [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) records the runtime, packaging, and verification conventions.
