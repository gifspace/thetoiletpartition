const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');

function walk(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'Asset', 'tmp'].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, output);
    else if (entry.name.endsWith('.html')) output.push(target);
  }
  return output;
}

function pageKey(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized === 'index.html') return 'home';
  if (normalized === 'about.html') return 'about';
  if (normalized === 'contact.html') return 'contact';
  if (normalized === 'products.html' || normalized.startsWith('products/')) return 'products';
  if (normalized === 'works.html' || normalized.startsWith('projects-portfolio/')) return 'works';
  return '';
}

function current(key, expected) {
  return key === expected ? ' aria-current="page"' : '';
}

function activeClass(key, expected) {
  return key === expected ? ' nav-pill-active' : '';
}

function mobileActiveClass(key, expected) {
  return key === expected ? ' bg-[#EEF6FB] text-[#075AA8]' : '';
}

function header(prefix, key) {
  return `<header x-data="{ mobileMenu: false }" class="site-header relative z-50 border-b">
    <div class="mx-auto flex h-20 max-w-[1480px] items-center justify-between px-5 md:px-10">
      <a href="${prefix}index.html" class="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075AA8] focus-visible:ring-offset-2" aria-label="The Toilet Partition หน้าแรก">
        <span class="brand-mark brand-mark-small" aria-hidden="true"><span>T</span></span>
        <span class="hidden flex-col sm:flex">
          <span class="text-sm font-bold uppercase leading-none tracking-[0.12em] text-slate-900">The Toilet</span>
          <span class="mt-1 text-[9px] font-bold uppercase tracking-[0.32em] text-[#075AA8]">Partition</span>
        </span>
      </a>

      <nav aria-label="เมนูหลัก" class="hidden items-center gap-1 lg:flex">
        <a href="${prefix}index.html"${current(key, 'home')} class="nav-pill${activeClass(key, 'home')}">หน้าแรก</a>
        <a href="${prefix}about.html"${current(key, 'about')} class="nav-pill${activeClass(key, 'about')}">เกี่ยวกับเรา</a>
        <a href="${prefix}products.html"${current(key, 'products')} class="nav-pill${activeClass(key, 'products')}">สินค้าของเรา</a>
        <a href="${prefix}works.html"${current(key, 'works')} class="nav-pill${activeClass(key, 'works')}">ผลงานของเรา</a>
        <a href="${prefix}contact.html"${current(key, 'contact')} class="nav-pill site-contact-link${activeClass(key, 'contact')}">ติดต่อเรา</a>
      </nav>

      <button type="button" @click="mobileMenu = !mobileMenu" :aria-expanded="mobileMenu" aria-controls="site-mobile-menu" aria-label="เปิดหรือปิดเมนู" class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075AA8]">
        <svg x-show="!mobileMenu" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke-width="2" stroke-linecap="round"/></svg>
        <svg x-cloak x-show="mobileMenu" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>

    <nav id="site-mobile-menu" x-cloak x-show="mobileMenu" x-transition.opacity.duration.200ms @click.outside="mobileMenu = false" aria-label="เมนูมือถือ" class="mx-4 mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl lg:hidden">
      <a @click="mobileMenu = false" href="${prefix}index.html"${current(key, 'home')} class="mobile-nav-link${mobileActiveClass(key, 'home')}">หน้าแรก</a>
      <a @click="mobileMenu = false" href="${prefix}about.html"${current(key, 'about')} class="mobile-nav-link${mobileActiveClass(key, 'about')}">เกี่ยวกับเรา</a>
      <a @click="mobileMenu = false" href="${prefix}products.html"${current(key, 'products')} class="mobile-nav-link${mobileActiveClass(key, 'products')}">สินค้าของเรา</a>
      <a @click="mobileMenu = false" href="${prefix}works.html"${current(key, 'works')} class="mobile-nav-link${mobileActiveClass(key, 'works')}">ผลงานของเรา</a>
      <a @click="mobileMenu = false" href="${prefix}contact.html"${current(key, 'contact')} class="mobile-nav-link site-contact-link mt-2">ติดต่อเรา</a>
    </nav>
  </header>`;
}

function footer(prefix) {
  return `<footer class="site-footer relative overflow-hidden py-16">
    <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"></div>
    <div class="relative z-10 mx-auto max-w-[1320px] px-5 md:px-10">
      <div class="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_1fr]">
        <div>
          <a href="${prefix}index.html" class="inline-flex items-center gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <span class="brand-mark brand-mark-small brand-mark-footer" aria-hidden="true"><span>T</span></span>
            <span><strong class="block text-xl uppercase tracking-[0.08em] text-white">The Toilet</strong><small class="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-300">Partition</small></span>
          </a>
          <p class="mt-6 max-w-md leading-7 text-white/55">ยกระดับมาตรฐานพื้นที่ส่วนตัวด้วยวัสดุระดับมืออาชีพ ที่สถาปนิกและโครงการชั้นนำเลือกใช้</p>
          <div class="mt-6 flex gap-3"><a href="https://facebook.com/Mhcgroupproduct" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook MHC Group Product">FB</a><a href="${prefix}contact.html" class="social-link" aria-label="ติดต่อทาง LINE">LN</a></div>
        </div>
        <div>
          <h2 class="footer-heading">Navigation</h2>
          <ul class="mt-5 space-y-3 text-sm font-medium text-white/55"><li><a href="${prefix}index.html" class="footer-link">หน้าแรก</a></li><li><a href="${prefix}about.html" class="footer-link">เกี่ยวกับเรา</a></li><li><a href="${prefix}products.html" class="footer-link">สินค้าของเรา</a></li><li><a href="${prefix}works.html" class="footer-link">ผลงานของเรา</a></li></ul>
        </div>
        <div>
          <h2 class="footer-heading">Contact info</h2>
          <ul class="mt-5 space-y-4 text-sm text-white/55">
            <li class="flex gap-3"><svg viewBox="0 0 24 24" class="mt-0.5 h-5 w-5 flex-none text-blue-300" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 21s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z" stroke-width="1.8"/><circle cx="12" cy="9" r="2.5" stroke-width="1.8"/></svg><span>99/159 ม.2 ต.ท่าเสา อ.กระทุ่มแบน<br>จ.สมุทรสาคร 74110</span></li>
            <li><a href="tel:0893553444" class="footer-link flex gap-3"><svg viewBox="0 0 24 24" class="h-5 w-5 flex-none text-blue-300" fill="none" stroke="currentColor" aria-hidden="true"><path d="M7 3H4a1 1 0 00-1 1c0 9.4 7.6 17 17 17a1 1 0 001-1v-3l-4-2-2 2c-3.5-1.5-6.5-4.5-8-8l2-2-2-4z" stroke-width="1.7" stroke-linejoin="round"/></svg>089-3553-444</a></li>
            <li><a href="mailto:sale_mhc@hotmail.com" class="footer-link flex gap-3"><svg viewBox="0 0 24 24" class="h-5 w-5 flex-none text-blue-300" fill="none" stroke="currentColor" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.7"/><path d="M4 7l8 6 8-6" stroke-width="1.7" stroke-linejoin="round"/></svg>sale_mhc@hotmail.com</a></li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col gap-3 pt-7 text-xs font-medium text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>&copy; 2026 MHC Group Products Co., Ltd.</p><p>The Toilet Partition - Premium Solutions</p></div>
    </div>
  </footer>`;
}

const files = walk(root);
let changed = 0;

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const headers = source.match(/<header\b[\s\S]*?<\/header>/gi) || [];
  const footers = source.match(/<footer\b[\s\S]*?<\/footer>/gi) || [];
  if (headers.length < 1 || footers.length !== 1) {
    throw new Error(`${path.relative(root, file)} has ${headers.length} header(s) and ${footers.length} footer(s)`);
  }

  const relativePath = path.relative(root, file);
  const prefix = relativePath.includes(path.sep) ? '../' : '';
  const key = pageKey(relativePath);
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const next = source
    .replace(/<header\b[\s\S]*?<\/header>/i, header(prefix, key).replaceAll('\n', eol))
    .replace(/<footer\b[\s\S]*?<\/footer>/i, footer(prefix).replaceAll('\n', eol));

  if (next !== source) {
    changed += 1;
    if (write) fs.writeFileSync(file, next, 'utf8');
  }
}

console.log(`${write ? 'Updated' : 'Would update'} ${changed} of ${files.length} HTML files.`);
