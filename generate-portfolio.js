/**
 * SMART PORTFOLIO BUILDER v5
 * 
 * This script does the following in one pass:
 * 1. Scans all subfolders in portfolio/
 * 2. For each folder, picks images that are VERY LIKELY to be real partition/bathroom installation photos
 * 3. Copies them to assets/portfolio-imgs/[slug]/ with English filenames (img-1.jpg, img-2.jpg...)
 * 4. Generates works.html and project detail pages with the new English paths
 * 5. No grayscale - full color always
 *
 * THE CORE LOGIC FOR DETECTING REAL WORK PHOTOS:
 * - "Good photo" = large file (>100KB), NOT a S__XXX_0.jpg scan, NOT a tiny thumbnail
 * - "Document scan" = S__XXX_0.jpg pattern, or filename contains doc keywords
 * - "LINE_ALBUM_xxx" filenames = these ARE real work photos (LINE group album exports)
 * - "NNNNNN_1.jpg" (ending in _1) = likely real LINE photo
 * - "NNNNNN_0.jpg" (ending in _0) = document scan (LINE scan pattern)
 * 
 * KEY INSIGHT: 
 *   In LINE's sharing system:
 *   - Photos shared as "Keep" => S__XXXXX_0.jpg (SCANS/documents)
 *   - Album photos => LINE_ALBUM_xxx.jpg or NNNNNN_1.jpg (REAL photos)
 */

const fs = require('fs');
const path = require('path');

const PORTFOLIO_ROOT = 'portfolio';
const IMG_OUTPUT_DIR = path.join('assets', 'portfolio-imgs');
const PROJECTS_OUTPUT = 'projects-portfolio';

// Clean and recreate output dirs
if (fs.existsSync(IMG_OUTPUT_DIR)) {
    fs.rmSync(IMG_OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(IMG_OUTPUT_DIR, { recursive: true });

if (fs.existsSync(PROJECTS_OUTPUT)) {
    fs.rmSync(PROJECTS_OUTPUT, { recursive: true, force: true });
}
fs.mkdirSync(PROJECTS_OUTPUT, { recursive: true });

// ============================================================
// DOCUMENT DETECTION - very precise rules
// ============================================================
const ALWAYS_BAD_PATTERNS = [
    /^fm-/i,                    // FM-AD-xx = company form templates
];

// Specific known document photos that slipped through purely generic filters
const EXPLICIT_BAD_FILES = [
    '55903.jpg',   // TH 01 หจก.วสุโยธา ใบตรวจรับ
    '6452.jpg',    // TH 22-23 ใบเสนอราคา/ใบแจ้งงาน
    '7884.jpg',    // TP 03 ใบสั่งงาน
    '8267.jpg',    // TH 33 ใบตรวจรับ
];

// Completely block projects that only have or heavily feature documents
const EXPLICIT_BAD_PROJECTS = [
    'TH 01 ศูนย์อาหาร ปตท.สิงห์บุรี', // Shows a restaurant front instead of toilet
    'TH 02 สวนนันทนาการ รอบ 2 ขอนแก่น',
    'TH 02 เทศบาลบางขุนทอง นนทบุรี',
    'TH 03 คลับเฮ้าหมู่บ้าน utopia ระยอง',
    'TH 06 บางจากปทุมราชวงศา อำนาจเจริญ',
    'TH 06 ห้องเปลี่ยนเสื้อผ้าโรงเรียนพระแม่ฟาติมา กทม',
    'TH 06 อาคารโกดังออฟฟิศหนองบอนแดง ชลบุรี',
    'TH 22 - 23 ตลาดคนเดินเมืองใหม่ สมุทรสาคร',
    'TH 22 บจก.ไทย คามาโย รอบ 2 สมุทรปราการ',
    'TH 22 สถานีบริการน้ำมัน ปตท.บจก.ศาสตร์สุวรรณออยล์ ตรัง',
    'TH 22-23 รีสอร์ทสวนเกษตร ห้องประชุม & ออฟฟิศจัดเลี้ยง ปทุมธานี',
    'TH 23 - 24 ห้องเปลี่ยนเสื้อผ้าสโมสรตำรวจ กทม',
    'TH 23 อาคารสำนักงานให้เช่าเทพารักษ์ สมุทรปราการ',
    'TH 24 คริสต์จักรแบ๊พติสต์บางจาก กรุงเทพมหานคร',
    'TH 24-25 บริษัท อาหารยอดคุณ จำกัด ปทุมธานี',
    'TH 24 อาคารสำนักงานปากน้ำโพ นครสวรรค์',
    'TH 24 อาคารสำนักงานสวนสัก ระยอง',
    'TH 24-22 บจก.ออกานิก นครปฐม',
    'TH 26 โรงพยาบาลสัตว์บรมราชชนนี กทม',
    'TH 26 TUMTOOK FACTORY สมุทรปราการ',
    'TH 26 บางจากพุนพิน สุราษฎร์ธานี กทม',
    'TH 26 อาคารสำนักงาน บจก.เพิ่มทรัพย์ สตีลแอนด์คอนสตรัคชั่น ชลบุรี',
    'TH 33 บจก.เฮลโก โซลูชั่น สมุทรสาคร',
    'TH 33 ร้านคาราโอเกะ บ้านบึง ชลบุรี',
    'TH 33 - TH 08 บริษัท เจเทคโตะ (ไทยแลนด์) จำกัด ฉะเชิงเทรา',
    'TH 34 แผงบังตา คาราโอเกะบ้านบึง ชลบุรี',
    'ใบตรวจรับ', // Just in case the folder uses this directly
];

// Only block 5-digit-only filenames if they are NOT in a LINE_ALBUM directory
const BARE_NUMERIC_PATTERN = /^\d{5,}\.jpe?g$/i;

const DOC_KEYWORDS_IN_FILENAME = [
    'ใบงาน', 'ใบสั่ง', 'ใบแจ้ง', 'ใบรับ', 'ใบตรวจ', 'ใบส่ง', 'ใบเสนอ',
    'ลายเซ็น', 'ลงนาม', 'สัญญา', 'invoice', 'receipt', 'quotation',
    'ใบตรวจรับ', 'มอบงาน', 'fm-ad', 'form',
];

function isDocumentImage(filePath) {
    const base = path.basename(filePath);
    const baseLower = base.toLowerCase();
    const parentDir = path.basename(path.dirname(filePath)).toLowerCase();

    // Explicitly reject known bad files
    if (EXPLICIT_BAD_FILES.includes(baseLower)) return true;

    // Explicitly reject bad projects
    if (EXPLICIT_BAD_PROJECTS.some(p => parentDir.includes(p.toLowerCase()))) return true;

    // Always bad (document scan patterns)
    for (const pat of ALWAYS_BAD_PATTERNS) {
        if (pat.test(base)) return true;
    }

    // Bare numeric filenames (e.g. 55903.jpg) are bad UNLESS the parent folder is a LINE_ALBUM
    // because LINE_ALBUM folders contain legitimate work photos
    if (BARE_NUMERIC_PATTERN.test(base) && !parentDir.includes('line_album')) {
        return true;
    }

    // Document keywords in filename
    for (const kw of DOC_KEYWORDS_IN_FILENAME) {
        if (baseLower.includes(kw.toLowerCase())) return true;
    }

    // Must be at least 40KB to be a real photo (filters out tiny icons/thumbnails)
    try {
        const stat = fs.statSync(filePath);
        if (stat.size < 40000) return true;
    } catch(e) {}

    return false;
}


// ============================================================
// REGION MAPPING
// ============================================================
const REGION_MAP = {
    'กทม.และปริมณฑล': ['กรุงเทพ', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม', 'Bangkok', 'กทม'],
    'ภาคเหนือ': ['เชียงใหม่', 'เชียงราย', 'ลำพูน', 'ลำปาง', 'แพร่', 'น่าน', 'พะเยา', 'แม่ฮ่องสอน', 'อุตรดิตถ์', 'Lamphun', 'Chiangmai'],
    'ภาคอีสาน': ['ขอนแก่น', 'โคราช', 'นครราชสีมา', 'อุบล', 'อุดร', 'ชัยภูมิ', 'บุรีรัมย์', 'สุรินทร์', 'ศรีสะเกษ', 'หนองคาย', 'บึงกาฬ', 'เลย', 'สกลนคร', 'นครพนม', 'มุกดาหาร', 'มหาสารคาม', 'กาฬสินธุ์', 'ร้อยเอ็ด', 'ยโสธร'],
    'ภาคใต้': ['ภูเก็ต', 'กระบี่', 'พังงา', 'สุราษฎร์', 'เกาะสมุย', 'นครศรีธรรมราช', 'ตรัง', 'พัทลุง', 'สงขลา', 'หาดใหญ่', 'สตูล', 'ปัตตานี', 'ยะลา', 'นราธิวาส', 'ชุมพร', 'ระนอง', 'Phuket', 'Krabi'],
    'ภาคตะวันตก': ['กาญจนบุรี', 'ราชบุรี', 'ตาก', 'เพชรบุรี', 'ประจวบ'],
    'ภาคตะวันออก': ['ระยอง', 'ชลบุรี', 'พัทยา', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'สระแก้ว', 'จันทบุรี', 'ตราด', 'Rayong', 'Chonburi', 'Pattaya'],
};

function getRegion(projectName, folderPath) {
    const combined = (projectName + ' ' + folderPath).toLowerCase();
    for (const [region, keywords] of Object.entries(REGION_MAP)) {
        if (keywords.some(k => combined.includes(k.toLowerCase()))) return region;
    }
    return 'กทม.และปริมณฑล';
}

// ============================================================
// SLUGIFY - convert Thai/any text to safe English folder name
// ============================================================
let slugIndex = 0;
const slugMap = {};

function slugify(name) {
    if (slugMap[name]) return slugMap[name];
    
    // Try to extract any English words/numbers first
    const asciiParts = name.match(/[a-zA-Z0-9]+/g) || [];
    let slug = asciiParts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
    
    // If no English parts, just use an index
    if (!slug || slug.length < 2) {
        slugIndex++;
        slug = `project-${String(slugIndex).padStart(3, '0')}`;
    } else {
        // Ensure uniqueness
        const baseSlug = slug;
        let counter = 1;
        const usedSlugs = Object.values(slugMap);
        while (usedSlugs.includes(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
    }
    
    slugMap[name] = slug;
    return slug;
}

// ============================================================
// DEEP SCAN - find all project folders with valid images
// ============================================================
function findProjects(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    let items;
    try { items = fs.readdirSync(dir); } catch(e) { return results; }

    let localImages = [];
    let hasSubDirs = false;

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                hasSubDirs = true;
                results = results.concat(findProjects(fullPath));
            } else if (item.match(/\.(jpg|jpeg|png)$/i)) {
                if (!isDocumentImage(fullPath)) {
                    const size = fs.statSync(fullPath).size;
                    localImages.push({ path: fullPath, size });
                }
            }
        } catch(e) {}
    });

    if (localImages.length > 0) {
        // Sort images: LINE_ALBUM photos first (most reliable work photos),
        // then by file size descending for everything else.
        // This avoids selecting large document JPEGs as the "best" images.
        localImages.sort((a, b) => {
            const aIsAlbum = /line_album/i.test(path.basename(a.path));
            const bIsAlbum = /line_album/i.test(path.basename(b.path));
            if (aIsAlbum && !bIsAlbum) return -1;
            if (!aIsAlbum && bIsAlbum) return 1;
            return b.size - a.size;
        });
        
        // Take the top 6 best quality images
        const bestImages = localImages.slice(0, 6).map(f => f.path);
        
        const name = path.basename(dir);
        // Skip worker folders and generic names
        if (!name.startsWith('ช่าง') && name.length > 2) {
            results.push({
                name,
                folderPath: dir,
                rawImages: bestImages,
                region: getRegion(name, dir),
            });
        }
    }

    return results;
}

console.log('Scanning portfolio folders...');
const allProjectsRaw = findProjects(PORTFOLIO_ROOT);

// Deduplicate by folder name (keep first occurrence)
const seen = new Set();
const allProjects = allProjectsRaw.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
});

console.log(`Found ${allProjects.length} unique projects. Copying images to English paths...`);

// ============================================================
// COPY IMAGES to English path
// ============================================================
allProjects.forEach((project, idx) => {
    const slug = slugify(project.name);
    const destDir = path.join(IMG_OUTPUT_DIR, slug);
    fs.mkdirSync(destDir, { recursive: true });

    const copiedImages = [];
    project.rawImages.forEach((srcPath, imgIdx) => {
        const ext = path.extname(srcPath).toLowerCase() || '.jpg';
        const destName = `img-${imgIdx + 1}${ext}`;
        const destPath = path.join(destDir, destName);
        try {
            fs.copyFileSync(srcPath, destPath);
            copiedImages.push(`assets/portfolio-imgs/${slug}/${destName}`);
        } catch(e) {
            console.warn(`[WARN] Could not copy ${srcPath}: ${e.message}`);
        }
    });

    project.images = copiedImages;
    project.slug = slug;

    if ((idx + 1) % 50 === 0) console.log(`  Processed ${idx + 1}/${allProjects.length}...`);
});

console.log('Images copied. Generating HTML...');

// ============================================================
// HTML TEMPLATES
// ============================================================
const layout = (title, bodyContent, relRoot = '.') => `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | The Toilet Partition</title>
    <meta name="description" content="ผลงานติดตั้งผนังห้องน้ำสำเร็จรูปคุณภาพสูง โดย MHC Group Products">
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Anuphan:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${relRoot}/assets/css/style.css">
    <style>
        body { font-family: 'Anuphan', 'Inter', sans-serif; background: #f8fafc; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        [x-cloak] { display: none !important; }
        .card { transition: transform 0.4s ease, box-shadow 0.4s ease; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18); }
        .img-hover { transition: transform 0.7s ease; }
        .card:hover .img-hover { transform: scale(1.06); }
    </style>
</head>
<body x-data="{ filter: 'all' }">

  <!-- HEADER -->
  <header class="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="${relRoot === '.' ? 'index.html' : '../index.html'}" class="flex items-center gap-3 group">
        <div class="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black">T</div>
        <div>
          <div class="font-black text-slate-900 uppercase tracking-tight leading-none text-base">The Toilet</div>
          <div class="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">Partition</div>
        </div>
      </a>
      <nav class="hidden md:flex items-center gap-8">
        <a href="${relRoot === '.' ? 'index.html' : '../index.html'}" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">หน้าแรก</a>
        <a href="${relRoot === '.' ? 'works.html' : '../works.html'}" class="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-0.5">ผลงาน</a>
        <a href="${relRoot === '.' ? 'products.html' : '../products.html'}" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">สินค้า</a>
      </nav>
      <a href="${relRoot === '.' ? 'contact.html' : '../contact.html'}" class="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-slate-700 transition-colors">ติดต่อเรา</a>
    </div>
  </header>

  ${bodyContent}

  <!-- FOOTER -->
  <footer class="bg-white border-t border-slate-100 py-10 mt-20">
    <div class="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400 font-medium tracking-widest uppercase">
      &copy; 2026 The Toilet Partition · MHC Group Products Co., Ltd.
    </div>
  </footer>

</body>
</html>`;

// ============================================================
// WORKS.HTML CONTENT
// ============================================================
const regions = ['all', 'กทม.และปริมณฑล', 'ภาคเหนือ', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันตก', 'ภาคตะวันออก'];

const worksBody = `
  <!-- HERO -->
  <section class="pt-36 pb-16 bg-white border-b border-slate-100 text-center px-6">
    <span class="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full mb-6">ผลงานทั้งหมด</span>
    <h1 class="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">Installation<br><span class="text-slate-300">Portfolio</span></h1>
    <p class="text-slate-500 text-sm md:text-base max-w-xl mx-auto">รวมผลงานติดตั้งผนังกั้นห้องน้ำสำเร็จรูปคุณภาพสูง<br>จากทีมงานมืออาชีพ ทั่วทุกภาคของไทย</p>
  </section>

  <!-- REGION FILTER -->
  <div class="sticky top-[73px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-6">
    <div class="max-w-7xl mx-auto overflow-x-auto hide-scroll">
      <div class="flex items-center gap-2 min-w-max lg:justify-center">
        ${regions.map(r => `
        <button @click="filter = '${r}'"
          :class="filter === '${r}' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
          class="px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border border-slate-200">
          ${r === 'all' ? 'ทุกภาค' : r}
        </button>`).join('')}
      </div>
    </div>
  </div>

  <!-- GRID -->
  <main class="max-w-7xl mx-auto px-6 py-12">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      ${allProjects.filter(p => p.images.length > 0).map(p => {
        const detailFile = `${p.slug}.html`;
        const thumb = p.images[0];
        return `
      <div x-show="filter === 'all' || filter === '${p.region}'"
           x-transition:enter="transition ease-out duration-300"
           x-transition:enter-start="opacity-0 scale-95"
           x-transition:enter-end="opacity-100 scale-100"
           class="card bg-white rounded-2xl overflow-hidden border border-slate-100 group">
        <a href="projects-portfolio/${detailFile}" class="block">
          <div class="aspect-square overflow-hidden bg-slate-100 relative">
            <img src="${thumb}" alt="${p.name}" class="img-hover w-full h-full object-cover"
                 loading="lazy" onerror="this.style.display='none'">
            <div class="absolute top-2 left-2">
              <span class="text-[9px] font-black bg-black/60 text-white backdrop-blur-sm px-2 py-1 rounded-full">${p.region}</span>
            </div>
          </div>
          <div class="p-3">
            <h3 class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-slate-500 transition-colors">${p.name}</h3>
          </div>
        </a>
      </div>`;
      }).join('\n')}
    </div>
  </main>
`;

fs.writeFileSync('works.html', layout('ผลงานติดตั้ง', worksBody, '.'));

// ============================================================
// INDIVIDUAL PROJECT PAGES
// ============================================================
allProjects.filter(p => p.images.length > 0).forEach(p => {
    const fileName = `${p.slug}.html`;
    const filePath = path.join(PROJECTS_OUTPUT, fileName);

    const projectBody = `
  <!-- PROJECT HEADER -->
  <div class="pt-28 pb-8 px-6 bg-white border-b border-slate-100">
    <div class="max-w-5xl mx-auto">
      <a href="../works.html" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors mb-6">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        กลับ Portfolio
      </a>
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">${p.region}</span>
          <h1 class="text-2xl md:text-4xl font-black text-slate-900 leading-tight">${p.name}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- GALLERY -->
  <main x-data="{ modal: false, src: '' }" class="max-w-5xl mx-auto px-6 py-10">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      ${p.images.map((img, idx) => `
      <div @click="src='../${img}'; modal=true"
           class="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in group border border-slate-100 hover:border-slate-300 transition-colors ${idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-auto md:aspect-square' : ''}">
        <img src="../${img}" alt="${p.name} รูปที่ ${idx + 1}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
             loading="${idx < 2 ? 'eager' : 'lazy'}" onerror="this.parentElement.style.display='none'">
      </div>`).join('')}
    </div>

    <!-- LIGHTBOX MODAL -->
    <div x-show="modal"
         x-cloak
         @click="modal=false"
         @keydown.window.escape="modal=false"
         class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100">
      <img :src="src" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" @click.stop>
      <button @click="modal=false" class="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-thin leading-none">&times;</button>
    </div>
  </main>
`;

    fs.writeFileSync(filePath, layout(p.name, projectBody, '..'));
});

// ============================================================
// SUMMARY
// ============================================================
const validProjects = allProjects.filter(p => p.images.length > 0);
console.log('\n==========================================');
console.log(`✅ DONE! Generated ${validProjects.length} project pages.`);
console.log(`   Images stored in: assets/portfolio-imgs/ (English names)`);
console.log(`   Project pages in: projects-portfolio/`);
console.log(`   Main archive:     works.html`);
console.log('==========================================');
