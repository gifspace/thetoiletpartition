const fs = require('fs');
const path = require('path');

let count = 0;
function dump(dir) {
    if (count > 100) return;
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (count > 100) return;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            dump(filePath);
        } else if (file.match(/\.(jpg|jpeg)$/i)) {
            // Check if it's NOT a generic S__ or number
            if (!/^S__\d+|^[0-9]+(_0)?\.jpg$/i.test(file)) {
                console.log(filePath.replace(/\\/g, '/'));
                count++;
            }
        }
    });
}
dump('portfolio');
