# Deploy handoff

- Branch: `backup-v.2` (working tree contains subsequent local UI, works/gallery, contact-map, and SEO changes; not committed by this packaging task).
- Deploy package: `thetoiletpartition-deploy-2026-08-21.zip`.
- Package contents: static HTML pages, product/project assets, local WebP portfolio assets, SEO metadata, `robots.txt`, and `sitemap.xml`.
- Excluded: PDFs and source/reference `Asset/`, unused `Catalog/`, local helper scripts, `server.js`, Git metadata, and handoff/status files.
- Project memory: [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) records the runtime, packaging, and verification conventions.
- Validation: ZIP listing contains no PDF or excluded directories; required homepage, works/gallery data, portfolio assets, robots, and sitemap files are present.
