# Deploy handoff

- Branch: `backup-v.2`.
- Latest checkpoint: homepage, products/archive, product detail, about, works, material selector, customer section, responsive header/hero updates, and all currently referenced local runtime images are committed.
- PDFs are excluded. The currently present `revise-1/` images are committed because the updated pages reference them; previously tracked image assets remain unchanged.
- Validation: `node --check assets/js/main.js` and `git diff --cached --check` pass before commit.
- Project memory: [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) records the runtime, packaging, and verification conventions.
