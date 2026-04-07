const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const PORTFOLIO_ROOT = 'portfolio';

const EXCLUSION_KEYWORDS = [
    'ใบ', 'เซ็น', 'doc', 'บิล', 'ส่งงาน', 'invoice', 'receipt', 'งวด', 'สัญญา', 
    'บจก', 'บริษัท', 'ลงนาม', 'จ่ายเงิน', 'เช็ค', 'เงินโอน', 'statement', 
    'แบบฟอร์ม', 'แบบร่าง', 'drawing', 'blueprint', 'survey', 'thumbs', 'desktop',
    'ใบงาน', 'ใบสั่ง', 'บันทึก', 'รายงาน', 'เอกสาร', 'ส่งของ', 'มัดจำ', 'เสนอราคา'
];

function isKeywordDocument(fileName) {
    const lower = fileName.toLowerCase();
    return EXCLUSION_KEYWORDS.some(kw => lower.includes(kw));
}

let deletedCount = 0;
let errorsCount = 0;
let processedCount = 0;

async function processImage(filePath) {
    try {
        const image = await Jimp.read(filePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        // Skip tiny images
        if (width < 10 || height < 10) return;
        
        let brightPixels = 0;
        
        image.scan(0, 0, width, height, function(x, y, idx) {
            if (x % 3 !== 0 || y % 3 !== 0) return;
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const brightness = (r + g + b) / 3;
            if (brightness > 185) brightPixels++;
        });
        
        const sampledPixels = Math.floor(width / 3) * Math.floor(height / 3);
        const brightRatio = brightPixels / sampledPixels;
        
        const isSuspiciousName = /^s__\d+_\d\.jpg$/i.test(path.basename(filePath)) || /^\d+_\d\.jpg$/i.test(path.basename(filePath));
        
        if (brightRatio > 0.68 || (isSuspiciousName && brightRatio > 0.40)) {
            // console.log(`🗑️ Deleting Document: ${filePath} (Bright: ${(brightRatio*100).toFixed(1)}%)`);
            fs.unlinkSync(filePath);
            deletedCount++;
        }
    } catch (e) {
        errorsCount++;
    }
}

async function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function main() {
    console.log('Starting Turbo Document Cleanup Engine...');
    const allImages = await getAllFiles(PORTFOLIO_ROOT);
    console.log(`Found ${allImages.length} total images to scan.`);
    
    // Batch processing limits
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
        const batch = allImages.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (filePath) => {
            processedCount++;
            
            const file = path.basename(filePath);
            if (isKeywordDocument(file)) {
                try { 
                    fs.unlinkSync(filePath); 
                    deletedCount++; 
                } catch(e) {}
                return;
            }
            if (fs.existsSync(filePath)) {
                await processImage(filePath);
            }
        }));
        
        if (processedCount % 500 < BATCH_SIZE) {
            console.log(`Progress: Scanned ${processedCount}/${allImages.length} images... Deleted ${deletedCount} so far.`);
        }
    }
    
    console.log('====================================');
    console.log(`✅ Turbo Cleanup Complete.`);
    console.log(`Total Images Scanned: ${processedCount}`);
    console.log(`Total Documents Deleted: ${deletedCount}`);
    console.log(`Errors (Unreadable/Corrupt): ${errorsCount}`);
    console.log('====================================');
}

main();
