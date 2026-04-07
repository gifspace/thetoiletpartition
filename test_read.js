const Jimp = require('jimp');
async function test() {
    try {
        const image = await Jimp.read('portfolio/ช่างกิจ/ช่างกิจ/ขัดสนิท วิทยาลัยการอาชีพนครปฐม นครปฐม/S__10395650_0.jpg');
        console.log("Success");
    } catch(e) {
        console.log(e);
    }
}
test();
