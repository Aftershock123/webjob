const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");

const sendMail = async (email, mailSubjects, data) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Andrew.ColtOoO@gmail.com",
        pass: "stdy cqxs nbvv cdmz",
      },
    });
    const mailOptions = {
      from: "Andrew.ColtOoO@gmail.com",
      to: email,
      subject: mailSubjects,
      html: data,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        // res.send('Failed to send verification email.');
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
