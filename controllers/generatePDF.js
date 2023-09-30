const db = require("../Router/db-config");
const mysql = require("mysql2");
const PDFDocument = require("pdfkit");
const path =require('path')
const ejs =require('ejs')
const nodemailer = require("nodemailer");


//ทำเป้นไฟล์แล้วค่อยส่งไปที่เมล
const generatePDF = async (req, res, next,email,mailSubject ,content,content1) => {
  try {
    
    const filename = Math.random() + "_doc" + ".pdf";
    const files =filename;
    const doc = new PDFDocument();
    
    // Customize the PDF document layout and design
    // Add content, headers, footers, etc.
    // Example:
    doc.fontSize(18).text("My Data", { align: "center" });
    doc.moveDown();
    
    data.forEach((row) => {
      doc.text(`ID: ${row.id}`);
      doc.text(`Name: ${row.name}`);
      doc.text("---------------------------");
      doc.moveDown();
    });
    
    // Save or stream the generated PDF
    doc.pipe(fs.createWriteStream("output.pdf"));
    doc.end();
    
    console.log("PDF generated successfully");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'Andrew.ColtOoO@gmail.com',
        pass: 'obap znvj sdee nsds',
      },
    });    
    
    const mailOptions = {
      from: 'Andrew.ColtOoO@gmail.com',
      to: email,
      subject: mailSubject,
      html: data,
      attachments: [{
        filename: files,
        path: 'C:/Users/Username/Desktop/somefile.pdf',
        contentType: 'application/pdf'
      }],
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        // res.send('Failed to send verification email.');
      } else {
        console.log('Email sent: ' + info.response);
        
        // res.send('Verification email sent successfully.');
      }
    });
  } catch (err) {
    console.error("PDF generated error:", err);
    return next(err);
  }
};



  
module.exports = generatePDF;
