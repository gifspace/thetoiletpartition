const fs = require('node:fs/promises');
const path = require('node:path');

const root = process.cwd();
const manifestPath = path.join(root, 'assets', 'data', 'works-drive.json');
const outputRoot = path.join(root, 'assets', 'portfolio-drive');
const imageUrl = (id) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2400`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeName = (value) => String(value || 'image')
  .replace(/[^\p{L}\p{N}._-]+/gu, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120) || 'image';

async function downloadImage(image, outputPath) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(imageUrl(image.id), { redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) throw new Error(`unexpected content-type ${contentType}`);
      await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(attempt * 1000);
    }
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const jobs = [];
  for (const region of manifest.regions) {
    for (const project of region.projects) {
      for (let index = 0; index < project.images.length; index += 1) {
        const image = project.images[index];
        const relativePath = `assets/portfolio-drive/${region.id}/${project.id}/${String(index + 1).padStart(3, '0')}-${safeName(image.title)}`;
        const outputPath = path.join(root, relativePath);
        jobs.push({ image, outputPath, relativePath, index });
      }
    }
  }

  let completed = 0;
  let cursor = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      await fs.mkdir(path.dirname(job.outputPath), { recursive: true });
      await downloadImage(job.image, job.outputPath);
      job.image.localPath = job.relativePath;
      completed += 1;
      if (completed % 25 === 0 || completed === jobs.length) console.log(`Downloaded ${completed}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Completed ${jobs.length} images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
