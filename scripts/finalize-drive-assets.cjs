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
  const images = manifest.regions.flatMap((region) => region.projects.flatMap((project) => project.images));
  for (const image of images) {
    const sourcePath = path.join(root, image.localPath);
    const webpPath = sourcePath.replace(/\.jpg$/i, '.webp');
    if (!await exists(webpPath)) await convert(sourcePath, webpPath);
    if (await exists(sourcePath)) await fs.unlink(sourcePath);
    image.localPath = image.localPath.replace(/\.jpg$/i, '.webp');
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Finalized ${images.length} local WebP images.`);
}

async function exists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
