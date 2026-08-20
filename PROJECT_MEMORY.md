# Project Memory: The Toilet Partition

## Current checkpoint

- Branch: `backup-v.2`
- Domain: `https://thetoiletpartition.com`
- Latest work: PDF-inspired responsive UI, shared floating navigation, local portfolio/gallery data, WebP portfolio assets, contact map, and SEO metadata.
- Deploy archive: `thetoiletpartition-deploy-2026-08-21.zip` (local ignored artifact; upload the extracted contents to the hosting document root).

## Runtime architecture

- Static website; no Node server is required for hosting.
- Works page uses `assets/data/works-drive.json` and the `assets/data/works-drive-inline.js` local fallback.
- Portfolio images are local WebP files under `assets/portfolio-drive/` and are lazy-loaded in works/gallery views.
- Core SEO files are `robots.txt` and `sitemap.xml`.
- Contact page uses the Google Maps embed centered on Tha Sao, Krathum Baen, Samut Sakhon.

## Packaging and source policy

- PDF references remain local under `Asset/` and must never be committed or included in deploy archives.
- `Catalog/`, local helper scripts, `server.js`, Git metadata, staging folders, and ZIP archives are not deploy runtime files.
- Keep product/project detail pages and their referenced assets when preparing a full-site deploy package.

## Verification checkpoint

- JavaScript syntax checks pass for the works data/runtime files.
- `git diff --check` is required before commit.
- Deploy ZIP was checked for required entry points and confirmed to contain no PDF or excluded source directories.
