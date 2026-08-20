/* The Toilet Partition - Main JS Interactions */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
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
});

function materialSelector() {
    const materials = [
        { code: 'TH 01', name: 'Pure White', image: 'assets/images/material-selector/th01.webp', swatch: '#f7f7f3' },
        { code: 'TH 02', name: 'Ivory White', image: 'assets/images/material-selector/th02.webp', swatch: '#eee9d9' },
        { code: 'TH 03', name: 'Soft Grey', image: 'assets/images/material-selector/th03.webp', swatch: '#c9ccca' },
        { code: 'TH 05', name: 'Lime Green', image: 'assets/images/material-selector/th05.webp', swatch: '#b5d822' },
        { code: 'TH 06', name: 'Sky Blue', image: 'assets/images/material-selector/th06.webp', swatch: '#7f9fc8' },
        { code: 'TH 07', name: 'Royal Blue', image: 'assets/images/material-selector/th07.webp', swatch: '#1f358f' },
        { code: 'TH 08', name: 'Blush Pink', image: 'assets/images/material-selector/th08.webp', swatch: '#edb6b6' },
        { code: 'TH 09', name: 'Energy Orange', image: 'assets/images/material-selector/th09.webp', swatch: '#f07f1d' },
        { code: 'TH 22', name: 'Walnut Brown', image: 'assets/images/material-selector/th22.webp', swatch: 'linear-gradient(135deg, #835a3b, #4f2d20)' },
        { code: 'TH 23', name: 'Ash Texture', image: 'assets/images/material-selector/th23.webp', swatch: 'repeating-linear-gradient(12deg, #9c998f 0 3px, #77756e 3px 5px)' },
        { code: 'TH 24', name: 'Natural Oak', image: 'assets/images/material-selector/th24.webp', swatch: 'repeating-linear-gradient(8deg, #c5a275 0 4px, #ad8656 4px 6px)' },
        { code: 'TH 26', name: 'Golden Oak', image: 'assets/images/material-selector/th26.webp', swatch: 'repeating-linear-gradient(8deg, #d4b47d 0 4px, #bd9762 4px 6px)' },
        { code: 'TH 33', name: 'White Marble', image: 'assets/images/material-selector/th33.webp', swatch: 'linear-gradient(135deg, #edf0f3 0 45%, #aeb6bf 47%, #f8fafc 50% 100%)' },
        { code: 'TH 34', name: 'Black Marble', image: 'assets/images/material-selector/th34.webp', swatch: 'linear-gradient(135deg, #171717 0 45%, #8b6946 47%, #171717 50% 100%)' }
    ];

    return {
        materials,
        active: materials.find((material) => material.code === 'TH 07'),
        select(material) {
            this.active = material;
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
