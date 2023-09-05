const db = require("../Router/db-config");
const mysql = require("mysql");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// router.get('/pdf/:id', loggedIn, async (req, res) => {
//     try {
//       let user;
//       let admin;
//       const {id} = req.params;

//     // const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;

//     const [resume] = await db.promise().query('SELECT * FROM resume  where id_user = ?', [id]);

//     if (rows.length === 0) {
//       return res.status(404).send('User not found');
//     }

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

const generatePDF = async (req, res, next) => {
  try {
    let resume;
    //select data from database and loop value for use in pdf
    const html = fs.readFileSync(
      path.join(__dirname, "../views/template.html"),
      "utf-8"
    );
    const filename = Math.random() + "_doc" + ".pdf";
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

module.exports = generatePDF;
