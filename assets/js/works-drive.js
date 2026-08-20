(() => {
  const getDataUrl = () => {
    const script = [...document.scripts].find((item) => item.src.includes('/assets/js/works-drive.js'));
    const scriptUrl = script?.src || new URL('assets/js/works-drive.js', document.baseURI).href;
    return new URL('../data/works-drive.json', scriptUrl).href;
  };
  const loadData = async () => {
    if (window.WORKS_DRIVE_DATA) return window.WORKS_DRIVE_DATA;
    const response = await fetch(getDataUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Drive manifest request failed: ${response.status} ${getDataUrl()}`);
    return response.json();
  };
  const imageUrl = (image) => image.localPath ? encodeURI(image.localPath) : '';
  const storageGet = (key) => {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  };
  const storageSet = (key, value) => {
    try { window.sessionStorage.setItem(key, value); } catch { /* file:// may restrict storage */ }
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const flatten = (data) => data.regions.flatMap((region) => region.projects.map((project) => ({
    ...project,
    regionId: region.id,
    regionName: region.name
  })));

  const renderWorks = (mount, data) => {
    const allProjects = flatten(data);
    let activeRegion = storageGet('worksRegion') || 'all';

    const render = () => {
      const regions = [{ id: 'all', name: 'ทุกภูมิภาค' }, ...data.regions];
      const filters = regions.map((region) => `
        <button type="button" class="drive-filter-button${activeRegion === region.id ? ' is-active' : ''}" data-region="${escapeHtml(region.id)}" aria-pressed="${activeRegion === region.id}">
          ${escapeHtml(region.name)}
        </button>`).join('');
      const projects = allProjects.filter((project) => activeRegion === 'all' || project.regionId === activeRegion);
      const cards = projects.map((project) => {
        const first = project.images[0];
        const query = `project-gallery.html?region=${encodeURIComponent(project.regionId)}&project=${encodeURIComponent(project.id)}`;
        return `
          <article class="drive-work-card">
            <a href="${query}" class="drive-work-card-link" aria-label="เปิดผลงาน ${escapeHtml(project.name)}">
              <div class="drive-work-card-media">
                <img src="${imageUrl(first)}" alt="${escapeHtml(first.title)}" loading="lazy" decoding="async" class="drive-work-card-image">
                <span class="drive-work-region">${escapeHtml(project.regionName)}</span>
                <span class="drive-work-count">${project.images.length} รูป</span>
              </div>
              <div class="drive-work-card-copy">
                <p class="drive-work-eyebrow">${escapeHtml(project.regionName)}</p>
                <h2>${escapeHtml(project.name)}</h2>
              </div>
            </a>
          </article>`;
      }).join('');

      mount.innerHTML = `
        <section class="drive-works-section" aria-labelledby="drive-works-title">
          <div class="drive-works-shell">
            <header class="drive-works-heading">
              <p class="drive-kicker">PROJECT ARCHIVE</p>
              <h1 id="drive-works-title">ผลงานติดตั้งจากโครงการจริง</h1>
              <p>เลือกภูมิภาคเพื่อดูผลงาน และเปิดแต่ละงานเพื่อชมภาพติดตั้งแบบ Gallery</p>
            </header>
            <div class="drive-filter-bar" role="group" aria-label="กรองผลงานตามภูมิภาค">${filters}</div>
            <div class="drive-work-grid" aria-live="polite">${cards || '<p class="drive-empty">ยังไม่มีรูปภาพในหมวดนี้</p>'}</div>
          </div>
        </section>`;

      mount.querySelectorAll('.drive-filter-button').forEach((button) => {
        button.addEventListener('click', () => {
          activeRegion = button.dataset.region;
          storageSet('worksRegion', activeRegion);
          render();
          mount.querySelector('.drive-works-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      mount.querySelectorAll('.drive-work-card-link').forEach((link) => {
        link.addEventListener('click', () => {
          storageSet('worksScrollY', String(window.scrollY));
          storageSet('worksRegion', activeRegion);
        });
      });
    };

    render();
    const savedScrollY = Number(storageGet('worksScrollY'));
    if (Number.isFinite(savedScrollY) && savedScrollY > 0) {
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, savedScrollY)));
    }
  };

  const renderGallery = (mount, data) => {
    const params = new URLSearchParams(window.location.search);
    const region = data.regions.find((item) => item.id === params.get('region'));
    const project = region?.projects.find((item) => item.id === params.get('project'));

    if (!region || !project) {
      mount.innerHTML = '<section class="drive-gallery-empty"><h1>ไม่พบผลงานนี้</h1><a href="works.html">กลับไปหน้าผลงาน</a></section>';
      return;
    }

    mount.innerHTML = `
      <section class="drive-gallery-section" aria-labelledby="drive-gallery-title">
        <div class="drive-gallery-shell">
          <a href="works.html" class="drive-gallery-back">← กลับไปหน้าผลงาน</a>
          <header class="drive-gallery-heading">
            <p class="drive-kicker">${escapeHtml(region.name)}</p>
            <h1 id="drive-gallery-title">${escapeHtml(project.name)}</h1>
            <p>${project.images.length} รูปภาพผลงาน</p>
          </header>
          <div class="drive-gallery-grid">
            ${project.images.map((image, index) => `
              <a href="${imageUrl(image)}" class="drive-gallery-item" data-index="${index}" aria-label="เปิดรูป ${index + 1}: ${escapeHtml(image.title)}">
                <img src="${imageUrl(image)}" alt="${escapeHtml(image.title)}" loading="lazy" decoding="async">
                <span>${String(index + 1).padStart(2, '0')}</span>
              </a>`).join('')}
          </div>
        </div>
      </section>
      <div class="drive-lightbox" hidden role="dialog" aria-modal="true" aria-labelledby="drive-lightbox-title">
        <div class="drive-lightbox-backdrop" data-close-lightbox></div>
        <div class="drive-lightbox-panel">
          <button type="button" class="drive-lightbox-close" data-close-lightbox aria-label="ปิดรูปภาพ">×</button>
          <button type="button" class="drive-lightbox-nav drive-lightbox-prev" data-lightbox-prev aria-label="รูปก่อนหน้า">‹</button>
          <figure><img alt="" data-lightbox-image><figcaption id="drive-lightbox-title" data-lightbox-caption></figcaption></figure>
          <button type="button" class="drive-lightbox-nav drive-lightbox-next" data-lightbox-next aria-label="รูปถัดไป">›</button>
        </div>
      </div>`;

    mount.querySelector('.drive-gallery-back')?.addEventListener('click', (event) => {
      if (document.referrer.includes('works.html') && window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });

    const items = [...mount.querySelectorAll('.drive-gallery-item')];
    const lightbox = mount.querySelector('.drive-lightbox');
    const lightboxImage = mount.querySelector('[data-lightbox-image]');
    const caption = mount.querySelector('[data-lightbox-caption]');
    let activeIndex = 0;

    const showImage = (index) => {
      activeIndex = (index + project.images.length) % project.images.length;
      const image = project.images[activeIndex];
      lightboxImage.src = imageUrl(image);
      lightboxImage.alt = image.title;
      caption.textContent = `${activeIndex + 1} / ${project.images.length} - ${image.title}`;
      lightbox.hidden = false;
      document.body.classList.add('drive-lightbox-open');
    };
    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.classList.remove('drive-lightbox-open');
      lightboxImage.removeAttribute('src');
    };

    items.forEach((item) => item.addEventListener('click', (event) => {
      event.preventDefault();
      showImage(Number(item.dataset.index));
    }));
    mount.querySelectorAll('[data-close-lightbox]').forEach((button) => button.addEventListener('click', closeLightbox));
    mount.querySelector('[data-lightbox-prev]').addEventListener('click', () => showImage(activeIndex - 1));
    mount.querySelector('[data-lightbox-next]').addEventListener('click', () => showImage(activeIndex + 1));
    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showImage(activeIndex + 1);
    });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const worksMount = document.querySelector('#drive-works-app');
    const galleryMount = document.querySelector('#drive-gallery-app');
    if (!worksMount && !galleryMount) return;

    try {
      const data = await loadData();
      document.querySelector('#legacy-region-filter')?.remove();
      document.querySelector('#legacy-portfolio-grid')?.remove();
      if (worksMount) renderWorks(worksMount, data);
      if (galleryMount) renderGallery(galleryMount, data);
    } catch (error) {
      console.error(error);
      const target = worksMount || galleryMount;
      if (target) target.innerHTML = '<p class="drive-empty">ไม่สามารถโหลดข้อมูลผลงานได้ กรุณาลองใหม่อีกครั้ง ตรวจสอบว่าเปิดเว็บไซต์ผ่าน web server และมีไฟล์ assets/data/works-drive.json อยู่ครบถ้วน</p>';
    }
  });
})();
