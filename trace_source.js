const fs = require('fs');
const path = require('path');

const imgDir = 'assets/portfolio-imgs';
const portfolioRoot = 'portfolio';

function findSourceInPortfolio(targetSize) {
    let found = [];
    function search(dir) {
        let items;
        try {
            items = fs.readdirSync(dir);
        } catch (e) {
            return;
        }
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                search(fullPath);
            } else if (stat.size === targetSize) {
                found.push(fullPath);
            }
        }
    }
    search(portfolioRoot);
    return found;
}

const badSlugs = ['tp-03', 'th-01', 'th-01-1', 'th-22-23', 'th-33', 'tp-22', 'th-02'];
badSlugs.forEach(slug => {
    const p = path.join(imgDir, slug, 'img-1.jpg');
    if (fs.existsSync(p)) {
        const size = fs.statSync(p).size;
        const srcs = findSourceInPortfolio(size);
        console.log(`Slug ${slug} img-1.jpg size: ${size} ->`, srcs[0] || 'Not found');
    } else {
        console.log(`Slug ${slug} not found`);
    }
});
