const path =require('path')

const nodemailer = require("nodemailer");

const puppeteer = require('puppeteer');


const generatePDF = async (email,mailSubjects ,data,name,emailcom,rowa) =>{
  try{
    
    const pdfFolder = path.join(__dirname,"../public/pdf" );
    const pdfFileName = `${name}_resume_${Date.now()}.pdf`;
    const pdfPath = path.join(pdfFolder, pdfFileName);
    
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(data);
   
    await page.pdf({ path: pdfPath, format: 'A4' });

  await browser.close();

  console.log('PDF created at:', pdfPath);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "Andrew.ColtOoO@gmail.com",
        pass: "stdy cqxs nbvv cdmz",
      }
    });
    console.log(rowa);
  

    const mailOptions = {
      from: "Andrew.ColtOoO@gmail.com",
      to: emailcom, email,
      subject: mailSubjects,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfPath // ต้องเป็นสตริงที่ระบุที่อยู่ไฟล์เต็ม
        }
      ]
    };
    
    if (Array.isArray(rowa)) {
      for (let i = 0; i < rowa.length; i++) {
        const filename = rowa[i].file_name;
        mailOptions.attachments.push({
          filename,
          path: path.join(__dirname, "../public/pdf", filename)
        });
      }
    }
    
   
    
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    
  }catch(error){
    console.log(error);
  }
} 




 




  
module.exports = generatePDF;
