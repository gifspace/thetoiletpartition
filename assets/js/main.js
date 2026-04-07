/* The Toilet Partition - Main JS Interactions */

document.addEventListener('DOMContentLoaded', () => {
    // Scroll-Triggered Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled', 'glass');
        } else {
            header.classList.remove('header-scrolled', 'glass');
        }
    });

    // Mobile Menu Toggle Logic (Handled by Alpine.js in HTML)
});

// Alpine.js Data for Gallery Filter
function galleryFilter() {
    return {
        selectedFilter: 'all',
        items: [],
        init() {
            // Initial items logic if needed
        }
    }
}
