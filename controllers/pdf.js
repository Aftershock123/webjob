const db = require("../Router/db-config");
const mysql = require("mysql");
const PDFDocument = require("pdfkit");
const path =require('path')
const ejs =require('ejs')
const nodemailer = require("nodemailer");


//ทำเป้นไฟล์แล้วค่อยส่งไปที่เมล
const generatePDF = async (req, res, next,email,mailSubject ,content,content1) => {
  try {
    
    //select data from database and loop value for use in pdf
    const TemplatePath = path.join(__dirname, "../views/template.ejs");
    const data =await ejs.renderFile(TemplatePath,{content,content1});
    
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
  } catch (err) {
    console.error("PDF generated error:", err);
    return next(err);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'Andrew.ColtOoO@gmail.com',
    pass: 'obap znvj sdee nsds',
  },
});
const TemplatePath = path.join(__dirname, "../views/template.ejs");
const data =await ejs.renderFile(TemplatePath,{content,content1});

console.log(data)
console.log(content)

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
  
module.exports = generatePDF;
