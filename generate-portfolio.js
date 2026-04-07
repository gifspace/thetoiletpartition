/**
 * SMART PORTFOLIO BUILDER v5 - PREMIUM EDITION
 * 
 * This script does the following in one pass:
 * 1. Scans all subfolders in portfolio/
 * 2. For each folder, picks images that are VERY LIKELY to be real partition/bathroom installation photos
 * 3. Copies them to assets/portfolio-imgs/[slug]/ with English filenames (img-1.jpg, img-2.jpg...)
 * 4. Generates works.html and project detail pages with the new English paths
 * 5. Uses a HIGH-END PREMIUM DESIGN matching index.html
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

const EXPLICIT_BAD_FILES = [
    '55903.jpg', '6452.jpg', '7884.jpg', '8267.jpg',
];

const EXPLICIT_BAD_PROJECTS = [
    'TH 01 ศูนย์อาหาร ปตท.สิงห์บุรี', 'TH 02 สวนนันทนาการ รอบ 2 ขอนแก่น',
    'TH 02 เทศบาลบางขุนทอง นนทบุรี', 'TH 03 คลับเฮ้าหมู่บ้าน utopia ระยอง',
    'TH 06 บางจากปทุมราชวงศา อำนาจเจริญ', 'TH 06 ห้องเปลี่ยนเสื้อผ้าโรงเรียนพระแม่ฟาติมา กทม',
    'TH 06 อาคารโกดังออฟฟิศหนองบอนแดง ชลบุรี', 'TH 22 - 23 ตลาดคนเดินเมืองใหม่ สมุทรสาคร',
    'TH 22 บจก.ไทย คามาโย รอบ 2 สมุทรปราการ', 'TH 22 สถานีบริการน้ำมัน ปตท.บจก.ศาสตร์สุวรรณออยล์ ตรัง',
    'TH 22-23 รีสอร์ทสวนเกษตร ห้องประชุม & ออฟฟิศจัดเลี้ยง ปทุมธานี',
    'TH 23 - 24 ห้องเปลี่ยนเสื้อผ้าสโมสรตำรวจ กทม', 'TH 23 อาคารสำนักงานให้เช่าเทพารักษ์ สมุทรปราการ',
    'TH 24 คริสต์จักรแบ๊พติสต์บางจาก กรุงเทพมหานคร', 'TH 24-25 บริษัท อาหารยอดคุณ จำกัด ปทุมธานี',
    'TH 24 อาคารสำนักงานปากน้ำโพ นครสวรรค์', 'TH 24 อาคารสำนักงานสวนสัก ระยอง',
    'TH 24-22 บจก.ออกานิก นครปฐม', 'TH 26 โรงพยาบาลสัตว์บรมราชชนนี กทม',
    'TH 26 TUMTOOK FACTORY สมุทรปราการ', 'TH 26 บางจากพุนพิน สุราษฎร์ธานี กทม',
    'TH 26 อาคารสำนักงาน บจก.เพิ่มทรัพย์ สตีลแอนด์คอนสตรัคชั่น ชลบุรี',
    'TH 33 บจก.เฮลโก โซลูชั่น สมุทรสาคร', 'TH 33 ร้านคาราโอเกะ บ้านบึง ชลบุรี',
    'TH 33 - TH 08 บริษัท เจเทคโตะ (ไทยแลนด์) จำกัด ฉะเชิงเทรา',
    'TH 34 แผงบังตา คาราโอเกะบ้านบึง ชลบุรี', 'ใบตรวจรับ',
];

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

    if (EXPLICIT_BAD_FILES.includes(baseLower)) return true;
    if (EXPLICIT_BAD_PROJECTS.some(p => parentDir.includes(p.toLowerCase()))) return true;
    for (const pat of ALWAYS_BAD_PATTERNS) { if (pat.test(base)) return true; }
    if (BARE_NUMERIC_PATTERN.test(base) && !parentDir.includes('line_album')) return true;
    for (const kw of DOC_KEYWORDS_IN_FILENAME) { if (baseLower.includes(kw.toLowerCase())) return true; }
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
// SLUGIFY
// ============================================================
let slugIndex = 0;
const slugMap = {};

function slugify(name) {
    if (slugMap[name]) return slugMap[name];
    const asciiParts = name.match(/[a-zA-Z0-9]+/g) || [];
    let slug = asciiParts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
    if (!slug || slug.length < 2) {
        slugIndex++;
        slug = `project-${String(slugIndex).padStart(3, '0')}`;
    } else {
        const baseSlug = slug;
        let counter = 1;
        const usedSlugs = Object.values(slugMap);
        while (usedSlugs.includes(slug)) { slug = `${baseSlug}-${counter++}`; }
    }
    slugMap[name] = slug;
    return slug;
}

// ============================================================
// SCAN PROJECTS
// ============================================================
function findProjects(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    let items;
    try { items = fs.readdirSync(dir); } catch(e) { return results; }
    let localImages = [];
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) { results = results.concat(findProjects(fullPath)); }
            else if (item.match(/\.(jpg|jpeg|png)$/i)) {
                if (!isDocumentImage(fullPath)) {
                    const size = fs.statSync(fullPath).size;
                    localImages.push({ path: fullPath, size });
                }
            }
        } catch(e) {}
    });
    if (localImages.length > 0) {
        localImages.sort((a, b) => {
            const aIsAlbum = /line_album/i.test(path.basename(a.path));
            const bIsAlbum = /line_album/i.test(path.basename(b.path));
            if (aIsAlbum && !bIsAlbum) return -1;
            if (!aIsAlbum && bIsAlbum) return 1;
            return b.size - a.size;
        });
        const bestImages = localImages.slice(0, 6).map(f => f.path);
        const infoPath = path.join(dir, 'project_info.json');
        let displayName = path.basename(dir);
        if (fs.existsSync(infoPath)) {
            try {
                const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
                if (info.displayName) displayName = info.displayName;
            } catch(e) {}
        }
        if (displayName.length > 2) {
            results.push({ name: displayName, folderPath: dir, rawImages: bestImages, region: getRegion(displayName, dir) });
        }
    }
    return results;
}

console.log('Scanning portfolio...');
const allProjectsRaw = findProjects(PORTFOLIO_ROOT);
const seen = new Set();
const allProjects = allProjectsRaw.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
});

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
        } catch(e) {}
    });
    project.images = copiedImages;
    project.slug = slug;
});

// ============================================================
// PREMIUM HTML TEMPLATES
// ============================================================
const layout = (title, bodyContent, relRoot = '.') => `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | The Toilet Partition</title>
    <meta name="description" content="ผนังห้องน้ำสำเร็จรูปคุณภาพสูง สถาปัตยกรรมที่ตอบโจทย์การใช้งาน">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS & Tailwind -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="${relRoot}/assets/css/style.css">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: { primary: '#004B8D', secondary: '#00A3E0', text: { dark: '#121A21', light: '#4A5568' } }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Sarabun', 'Inter', sans-serif; }
        [x-cloak] { display: none !important; }
        .hero-gradient { background: linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4), transparent); }
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 50%; width: 0; height: 2px; background: #00A3E0; transition: all 0.3s ease; transform: translateX(-50%); }
        .nav-link:hover::after { width: 20px; }
    </style>
</head>
<body x-data="{ mobileMenu: false, filter: 'all' }" class="bg-[#F8FAFC]">

    <!-- Header -->
    <header x-data="{ scrolled: false }" @scroll.window="scrolled = (window.pageYOffset > 50)"
            :class="scrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl py-4 border-slate-100' : 'bg-transparent py-8 border-transparent'"
            class="fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 md:px-12 border-b">
        <div class="max-w-7xl mx-auto flex justify-between items-center transition-all duration-700">
            <a href="${relRoot}/index.html" class="flex items-center space-x-3 group relative z-10">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform">T</div>
                <div class="flex flex-col">
                    <span :class="scrolled ? 'text-primary' : 'text-white'" class="font-black text-lg md:text-xl leading-none uppercase tracking-tighter transition-colors">THE TOILET</span>
                    <span :class="scrolled ? 'text-secondary' : 'text-white/80'" class="text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase transition-colors">PARTITION</span>
                </div>
            </a>

            <nav class="hidden md:flex items-center space-x-8">
                <a href="${relRoot}/index.html" :class="scrolled ? 'text-slate-600' : 'text-white/80'" class="nav-link font-bold text-sm hover:text-secondary transition-colors transition-all">หน้าแรก</a>
                <a href="${relRoot}/about.html" :class="scrolled ? 'text-slate-600' : 'text-white/80'" class="nav-link font-bold text-sm hover:text-secondary transition-colors transition-all">เกี่ยวกับเรา</a>
                <a href="${relRoot}/products.html" :class="scrolled ? 'text-slate-600' : 'text-white/80'" class="nav-link font-bold text-sm hover:text-secondary transition-colors transition-all">สินค้าของเรา</a>
                <a href="${relRoot}/works.html" :class="scrolled ? 'text-primary' : 'text-white'" class="nav-link font-bold text-sm hover:text-secondary transition-colors transition-all">ผลงานของเรา</a>
                <a href="${relRoot}/contact.html" class="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-secondary transition-all shadow-lg shadow-primary/20">ติดต่อเรา</a>
            </nav>

            <button @click="mobileMenu = !mobileMenu" :class="scrolled ? 'text-primary' : 'text-white'" class="md:hidden relative z-10 p-2">
                <svg x-show="!mobileMenu" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/></svg>
                <svg x-show="mobileMenu" style="display:none;" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>

        <!-- Mobile Menu -->
        <div x-show="mobileMenu" x-cloak x-transition class="absolute top-0 left-0 w-full bg-white shadow-2xl md:hidden py-24 px-8 flex flex-col items-center gap-6">
            <a href="${relRoot}/index.html" class="text-xl font-bold text-slate-800">หน้าแรก</a>
            <a href="${relRoot}/about.html" class="text-xl font-bold text-slate-800">เกี่ยวกับเรา</a>
            <a href="${relRoot}/products.html" class="text-xl font-bold text-slate-800">สินค้าของเรา</a>
            <a href="${relRoot}/works.html" class="text-xl font-bold text-secondary">ผลงานของเรา</a>
            <a href="${relRoot}/contact.html" class="w-full text-center bg-primary text-white py-4 rounded-2xl font-bold">ติดต่อเรา</a>
        </div>
    </header>

    ${bodyContent}

    <!-- Footer -->
    <footer class="bg-slate-900 pt-32 pb-16 text-white relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                <div class="col-span-1 md:col-span-2 space-y-8">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl">T</div>
                        <div class="flex flex-col">
                            <span class="font-black text-2xl uppercase tracking-tighter">THE TOILET</span>
                            <span class="text-secondary text-[11px] font-black tracking-[0.3em] uppercase">PARTITION</span>
                        </div>
                    </div>
                    <p class="text-slate-400 text-lg max-w-sm leading-relaxed">มุ่งเน้นความเป็นเลิศในการออกแบบและติดตั้งผนังห้องน้ำสำเร็จรูป เพื่อความสมบูรณ์แบบของทุกโครงการ</p>
                </div>
                <div>
                    <h4 class="text-secondary font-black text-xs uppercase tracking-[0.3em] mb-8">Navigation</h4>
                    <ul class="space-y-4 text-slate-400 font-bold text-sm">
                        <li><a href="${relRoot}/index.html" class="hover:text-white transition-colors">หน้าแรก</a></li>
                        <li><a href="${relRoot}/about.html" class="hover:text-white transition-colors">เกี่ยวกับเรา</a></li>
                        <li><a href="${relRoot}/products.html" class="hover:text-white transition-colors">สินค้าของเรา</a></li>
                        <li><a href="${relRoot}/works.html" class="hover:text-white transition-colors">ผลงานของเรา</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-secondary font-black text-xs uppercase tracking-[0.3em] mb-8">Contact Info</h4>
                    <ul class="space-y-6 text-slate-400 font-bold text-sm">
                        <li class="flex items-start space-x-3"><span>📍</span><span>99/159 ม.2 ต.ท่าเสา อ.กระทุ่มแบน <br> จ.สมุทรสาคร</span></li>
                        <li class="flex items-center space-x-3"><span>📞</span><span>089-3553-444</span></li>
                        <li class="flex items-center space-x-3"><span>✉️</span><span>sale_mhc@hotmail.com</span></li>
                    </ul>
                </div>
            </div>
            <div class="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">&copy; 2026 THE TOILET PARTITION. ALL RIGHTS RESERVED.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;

const regions = ['all', 'กทม.และปริมณฑล', 'ภาคเหนือ', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันตก', 'ภาคตะวันออก'];
const worksBody = `
    <section class="relative h-[80vh] overflow-hidden bg-slate-900 flex items-center justify-center">
        <div x-data="{ y: 0 }" @scroll.window="y = window.pageYOffset" :style="{ transform: 'translateY(' + (y * 0.4) + 'px)' }" class="absolute inset-0">
            <img src="assets/images/works-hero.png" alt="Works" class="w-full h-full object-cover opacity-50 scale-110">
        </div>
        <div class="absolute inset-0 hero-gradient"></div>
        <div class="relative z-10 text-center px-6 mt-20">
            <span class="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">OUR INSTALLATIONS</span>
            <h1 class="text-6xl md:text-8xl font-black text-white leading-tight filter drop-shadow-2xl">Our <br> <span class="text-secondary italic">Works</span></h1>
            <p class="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mt-8 font-medium leading-relaxed">รวบรวมผลงานการติดตั้งคุณภาพสูง ณ สถานที่ชั้นนำทั่วประเทศ</p>
        </div>
    </section>

    <div class="sticky top-[80px] md:top-[96px] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6 px-6">
        <div class="max-w-7xl mx-auto overflow-x-auto">
            <div class="flex items-center gap-3 min-w-max lg:justify-center">
                ${regions.map(r => `
                <button @click="filter = '${r}'"
                    :class="filter === '${r}' ? 'bg-primary text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50'"
                    class="px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border border-slate-100">
                    ${r === 'all' ? 'ทุกภาค' : r}
                </button>`).join('')}
            </div>
        </div>
    </div>

    <main class="max-w-7xl mx-auto px-6 py-24">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            ${allProjects.filter(p => p.images.length > 0).map(p => `
            <div x-show="filter === 'all' || filter === '${p.region}'" x-transition class="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 relative">
                <a href="projects-portfolio/${p.slug}.html" class="block">
                    <div class="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                        <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy">
                        <div class="absolute top-4 left-4"><span class="text-[9px] font-black bg-white/90 text-primary px-4 py-1.5 rounded-full shadow-lg border border-white/50 uppercase tracking-widest">${p.region}</span></div>
                        <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span class="bg-white text-primary px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">ดูรายละเอียด</span>
                        </div>
                    </div>
                    <div class="p-8">
                        <h3 class="text-xl font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">${p.name}</h3>
                        <div class="h-1 w-12 bg-secondary/30 rounded-full mt-4 group-hover:w-24 transition-all duration-500"></div>
                    </div>
                </a>
            </div>`).join('')}
        </div>
    </main>
`;

fs.writeFileSync('works.html', layout('ผลงานติดตั้ง', worksBody, '.'));

allProjects.filter(p => p.images.length > 0).forEach(p => {
    const projectBody = `
    <section class="relative h-[40vh] bg-slate-900 flex items-center justify-center overflow-hidden">
        <img src="../${p.images[0]}" class="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110">
        <div class="absolute inset-0 hero-gradient"></div>
        <div class="relative z-10 text-center px-6 mt-16">
            <a href="../works.html" class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/10 transition-all">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg> กลับโครงการทั้งหมด
            </a>
            <span class="block text-secondary font-black text-xs uppercase tracking-[0.4em] mb-4">${p.region}</span>
            <h1 class="text-4xl md:text-5xl font-black text-white px-4 leading-tight">${p.name}</h1>
        </div>
    </section>

    <main x-data="{ modal: false, src: '' }" class="max-w-7xl mx-auto px-6 py-24">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${p.images.map((img, idx) => `
            <div @click="src='../${img}'; modal=true" class="aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-700 cursor-zoom-in border border-slate-50 \${idx === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}">
                <img src="../${img}" alt="${p.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" loading="lazy">
            </div>`).join('')}
        </div>

        <div x-show="modal" x-cloak @click="modal=false" class="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4" x-transition>
            <div class="relative w-full h-full flex flex-col items-center justify-center">
                <button @click="modal=false" class="absolute top-0 right-0 text-white/50 hover:text-white p-6 transition-all hover:rotate-90">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <img :src="src" class="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-3xl border border-white/10">
                <div class="mt-8 text-white/40 font-bold text-xs uppercase tracking-[0.3em]">${p.name}</div>
            </div>
        </div>
    </main>
    `;
    fs.writeFileSync(path.join(PROJECTS_OUTPUT, `${p.slug}.html`), layout(p.name, projectBody, '..'));
});

console.log('✅ Premium Portfolio Built Successfully!');
