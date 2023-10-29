const fs = require('fs').promises; // ต้องใช้ fs.promises เพื่อรับ Promise-based fs

const readAndConvertImage =async(imageFilename)=> {
  try {
    const data = await fs.readFile(path.join(__dirname, '../public/image', imageFilename));
    const base64Image = Buffer.from(data).toString('base64');
    return base64Image;
    
  } catch (err) {
    console.error(err);
    throw err; // คุณสามารถจัดการข้อผิดพลาดตามที่คุณต้องการ
  }
}
module.exports =readAndConvertImage ;

