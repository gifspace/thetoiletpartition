/* The Toilet Partition - Main JS Interactions */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.querySelector('.site-header');
    const syncHeaderState = () => {
        if (siteHeader) siteHeader.classList.toggle('header-scrolled', window.scrollY > 12);
    };

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });

    const revealElements = document.querySelectorAll('.reveal');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('active'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -32px 0px'
        });

        revealElements.forEach((element) => observer.observe(element));
    }

    document.querySelectorAll('[data-current-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    enhanceProductPage();
});

function enhanceProductPage() {
    const path = window.location.pathname.toLowerCase();
    if (!path.includes('/products/')) return;

    const file = path.split('/').pop();
    const isMff25 = file === 'mff-premium.html';
    const isMff30 = file === 'mff-compact.html';
    const family = file.startsWith('hpl-') ? 'hpl' : file.startsWith('pb-') ? 'pb' : isMff25 || isMff30 ? 'mff' : '';
    if (!family) return;

    if (isMff30) {
        document.querySelectorAll('[src*="mff-25.jpg"]').forEach((image) => {
            image.src = image.src.replace('mff-25.jpg', 'mff-30.jpg');
            image.alt = 'เอกสารสเปกวัสดุ MFF 30 mm';
        });
        document.querySelectorAll('h1').forEach((heading) => { if (heading.textContent.includes('COMPACT')) heading.textContent = 'MFF 30 mm'; });
        document.querySelectorAll('span').forEach((badge) => { if (badge.textContent.includes('COMPACT')) badge.textContent = 'MFF SERIES · 30 MM'; });
        document.querySelectorAll('p').forEach((paragraph) => { if (paragraph.textContent.includes('รูปแบบ Compact')) paragraph.textContent = 'แผ่น MFF ความหนา 30 mm กันน้ำ 100% น้ำหนักเบา พร้อมสีมาตรฐานจากโฟลเดอร์สี MFF 30 mm ของบริษัท'; });
        document.querySelectorAll('dd').forEach((value) => { if (value.textContent.trim() === '25/30 mm') value.textContent = '30 mm'; });
        document.querySelectorAll('h2').forEach((heading) => { if (heading.textContent === 'ภาพสเปกและภาพตัวอย่าง') heading.textContent = 'สีมาตรฐาน MFF 30 mm'; });
    }

    const specsId = isMff25 ? 'premium-specs' : isMff30 ? 'compact-specs' : '';
    if (specsId) {
        const specs = document.getElementById(specsId);
        const thickness = isMff25 ? '25' : '30';
        if (specs) {
            specs.querySelector('h2').textContent = `รายละเอียด MFF ${thickness} mm`;
            specs.querySelector('p').innerHTML = `แผ่น MFF ${thickness} mm ประกอบด้วยการเคลือบผิว High Pressure Laminate หนา 0.8 mm ทั้ง 2 ด้านด้วยระบบ Sandwich System ปิดขอบโดยรอบด้วย EAGE PVC เกรด A และระบบ HOTMELT โดยมีแกนโฟมแข็งพิเศษที่รับแรงดันได้ไม่น้อยกว่า 1,500 นิวตันต่อตารางเมตร`;
            const values = {
                'โครงสร้าง': `HPL 0.8 mm สองด้าน · แกนโฟมแข็งพิเศษ · ขอบ EAGE PVC ${thickness} mm`,
                'คุณสมบัติ': 'กันน้ำ 100% · ทำความสะอาดง่าย · ไม่เป็นสื่อไฟฟ้า · ทนไฟ · ป้องกันแบคทีเรียและปลวก',
                'เหมาะสำหรับ': 'อาคารสาธารณะ ห้องน้ำเปียกและห้องน้ำแห้งหลายห้อง ติดตั้งง่ายเหมือนการประกอบเฟอร์นิเจอร์',
                'สี': 'มีสีมาตรฐานของบริษัทให้เลือกหลายสี'
            };
            specs.querySelectorAll('dt').forEach((term) => {
                const row = term.closest('div');
                const value = row?.querySelector('dd');
                if (value && values[term.textContent.trim()]) value.textContent = values[term.textContent.trim()];
            });
        }
    }

    const root = document.querySelector('main > div') || document.querySelector('main');
    if (!root || root.querySelector('[data-material-reference]')) return;

    const definitions = {
        hpl: { label: 'HPL 10/13 mm', document: '../assets/images/material-selector/docs/hpl.jpg', alt: 'สเปกวัสดุ HPL 10/13 mm' },
        pb: { label: 'PB 18/28 mm', document: '../assets/images/material-selector/docs/pb.jpg', alt: 'สเปกวัสดุ PB 18/28 mm' },
        mff25: { label: 'MFF 25 mm', document: '../assets/images/material-selector/docs/mff-25.jpg', alt: 'สเปกวัสดุ MFF 25 mm' },
        mff30: { label: 'MFF 30 mm', document: '../assets/images/material-selector/docs/mff-30.jpg', alt: 'สเปกวัสดุ MFF 30 mm' }
    };
    const material = isMff25 ? definitions.mff25 : isMff30 ? definitions.mff30 : definitions[family];
    const colors = isMff25
        ? [['907', 'Sky Blue'], ['914', 'Mint Green'], ['222', 'Beige'], ['910', 'Pink'], ['936', 'Orange'], ['6652', 'Ash Brown'], ['8184', 'Walnut'], ['8433', 'Dark Walnut'], ['927', 'Brown Oak']]
        : [['8184', 'Walnut'], ['927', 'Brown Oak'], ['8433', 'Dark Walnut'], ['907', 'Sky Blue'], ['914', 'Mint Green'], ['222', 'Beige'], ['910', 'Pink'], ['936', 'Orange'], ['6652', 'Ash Brown']];
    const colorSection = (isMff25 || isMff30) ? `<section class="mt-16" aria-labelledby="company-colors"><h2 id="company-colors" class="mb-8 text-center text-3xl font-bold text-primary">สีมาตรฐาน ${material.label}</h2><div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">${colors.map((color, index) => `<figure class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><img src="../assets/images/material-selector/colors/${isMff25 ? 'mff25' : 'mff30'}-${String(index + 1).padStart(2, '0')}.jpg" alt="${material.label} สี ${color[1]} รหัส ${color[0]}" class="aspect-square w-full object-cover"><figcaption class="p-3 text-center text-xs font-bold text-primary">${color[1]} · ${color[0]}</figcaption></figure>`).join('')}</div></section>` : '';

    root.insertAdjacentHTML('beforeend', `<section data-material-reference class="mt-16 rounded-3xl border border-slate-100 bg-slate-50 p-6 md:p-10" aria-labelledby="material-reference"><div class="grid items-center gap-8 md:grid-cols-[0.42fr_0.58fr]"><div><span class="text-xs font-bold uppercase tracking-[0.25em] text-secondary">Material Reference</span><h2 id="material-reference" class="mt-3 text-2xl font-bold text-primary">วัสดุของรุ่นนี้</h2><p class="mt-4 leading-7 text-slate-600">ภาพวัสดุจากเอกสารบริษัทที่ตรงกับซีรีส์ของสินค้ารุ่นนี้</p></div><a href="${material.document}" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-2xl bg-white p-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><img src="${material.document}" alt="${material.alt}" class="w-full rounded-xl object-contain"></a></div></section>${colorSection}`);
}

function materialSelector() {
    const hplCodes = ['TH 01', 'TH 02', 'TH 03', 'TH 05', 'TH 06', 'TH 07', 'TH 08', 'TH 09', 'TH 22', 'TH 23', 'TH 24', 'TH 26', 'TH 33', 'TH 34'];
    const hplNames = ['Pure White', 'Ivory White', 'Soft Grey', 'Lime Green', 'Sky Blue', 'Royal Blue', 'Blush Pink', 'Energy Orange', 'Walnut Brown', 'Ash Texture', 'Natural Oak', 'Golden Oak', 'White Marble', 'Black Marble'];
    const hplColors = hplCodes.map((code, index) => ({ code, name: hplNames[index], image: `assets/images/material-selector/colors/hpl-${String(index + 1).padStart(2, '0')}.jpg`, swatch: `assets/images/material-selector/colors/swatches/hpl-${String(index + 1).padStart(2, '0')}.jpg` }));

    const pbCodes = ['TP 34', 'TP 33', 'TP 23', 'TP 22', 'TP 21', 'TP 11', 'TP 10', 'TP 07', 'TP 03', 'TP 02', 'TP 01'];
    const pbNames = ['Black Marble', 'White Marble', 'Light Oak', 'Walnut Oak', 'Natural Oak', 'Charcoal', 'Black', 'Royal Blue', 'Soft Grey', 'Cream', 'Pure White'];
    const pbColors = pbCodes.map((code, index) => ({ code, name: pbNames[index], image: `assets/images/material-selector/colors/pb-${String(index + 1).padStart(2, '0')}.jpg`, swatch: `assets/images/material-selector/colors/swatches/pb-${String(index + 1).padStart(2, '0')}.jpg` }));

    const mff25Codes = ['907', '914', '222', '910', '936', '6652', '8184', '8433', '927'];
    const mff25Names = ['Sky Blue', 'Mint Green', 'Beige', 'Pink', 'Orange', 'Ash Brown', 'Walnut', 'Dark Walnut', 'Brown Oak'];
    const mff25Colors = mff25Codes.map((code, index) => ({ code, name: mff25Names[index], image: `assets/images/material-selector/colors/mff25-${String(index + 1).padStart(2, '0')}.jpg`, swatch: `assets/images/material-selector/colors/swatches/mff25-${String(index + 1).padStart(2, '0')}.jpg` }));
    const mff30Codes = ['8184', '927', '8433', '907', '914', '222', '910', '936', '6652'];
    const mff30Names = ['Walnut', 'Brown Oak', 'Dark Walnut', 'Sky Blue', 'Mint Green', 'Beige', 'Pink', 'Orange', 'Ash Brown'];
    const mff30Colors = mff30Codes.map((code, index) => ({ code, name: mff30Names[index], image: `assets/images/material-selector/colors/mff30-${String(index + 1).padStart(2, '0')}.jpg`, swatch: `assets/images/material-selector/colors/swatches/mff30-${String(index + 1).padStart(2, '0')}.jpg` }));

    const models = [
        { id: 'hpl-10', family: 'hpl', label: 'HPL 10 mm', series: 'HPL Series', thickness: '10 mm', surface: 'High Pressure Laminate', document: 'assets/images/material-selector/docs/hpl.jpg', colors: hplColors },
        { id: 'hpl-13', family: 'hpl', label: 'HPL 13 mm', series: 'HPL Series', thickness: '13 mm', surface: 'High Pressure Laminate', document: 'assets/images/material-selector/docs/hpl.jpg', colors: hplColors },
        { id: 'pb-18', family: 'pb', label: 'PB 18 mm', series: 'PB Series', thickness: '18 mm', surface: 'Particle Board', document: 'assets/images/material-selector/docs/pb.jpg', colors: pbColors },
        { id: 'pb-28', family: 'pb', label: 'PB 28 mm', series: 'PB Series', thickness: '28 mm', surface: 'Particle Board', document: 'assets/images/material-selector/docs/pb.jpg', colors: pbColors },
        { id: 'mff-25', family: 'mff', label: 'MFF 25 mm', series: 'MFF Series', thickness: '25 mm', surface: 'Melamine Faced Foamboard', document: 'assets/images/material-selector/docs/mff-25.jpg', colors: mff25Colors },
        { id: 'mff-30', family: 'mff', label: 'MFF 30 mm', series: 'MFF Series', thickness: '30 mm', surface: 'Melamine Faced Foamboard', document: 'assets/images/material-selector/docs/mff-30.jpg', colors: mff30Colors }
    ];

    return {
        models,
        activeFamily: 'hpl',
        activeModel: models[0],
        active: hplColors.find((material) => material.code === 'TH 01'),
        lightboxOpen: false,
        lightboxImage: '',
        familyModels(family = this.activeFamily) {
            return this.models.filter((model) => model.family === family);
        },
        colorsFor(id) {
            return this.models.find((model) => model.id === id)?.colors || [];
        },
        chooseFamily(family) {
            this.activeFamily = family;
            this.chooseModel(this.familyModels(family)[0]);
        },
        chooseById(id) {
            const model = this.models.find((item) => item.id === id);
            if (model) this.chooseModel(model);
        },
        chooseModel(model) {
            this.activeFamily = model.family;
            this.activeModel = model;
            this.active = model.colors[0];
        },
        select(material) {
            this.active = material;
        },
        openLightbox(image) {
            this.lightboxImage = image;
            this.lightboxOpen = true;
            document.body.classList.add('overflow-hidden');
        },
        closeLightbox() {
            this.lightboxOpen = false;
            this.lightboxImage = '';
            document.body.classList.remove('overflow-hidden');
        }
    };
}

function galleryFilter() {
    return {
        selectedFilter: 'all',
        items: [],
        init() {}
    };
}
