const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = process.cwd();
const manifestPath = path.join(root, 'assets', 'data', 'works-drive.json');

const convert = (input, output) => new Promise((resolve, reject) => {
  const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-c:v', 'libwebp', '-q:v', '78', '-compression_level', '6', output], { windowsHide: true });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', reject);
  child.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited with ${code}`)));
});

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const jobs = manifest.regions.flatMap((region) => region.projects.flatMap((project) => project.images.map((image) => ({ region, project, image }))));
  let cursor = 0;
  let completed = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const sourcePath = path.join(root, job.image.localPath);
      const outputPath = sourcePath.replace(/\.jpg$/i, '.webp');
      await convert(sourcePath, outputPath);
      job.image.localPath = job.image.localPath.replace(/\.jpg$/i, '.webp');
      await fs.unlink(sourcePath);
      completed += 1;
      if (completed % 25 === 0 || completed === jobs.length) console.log(`Converted ${completed}/${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Completed ${jobs.length} WebP files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
