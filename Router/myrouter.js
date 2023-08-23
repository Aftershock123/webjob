const express = require('express')
const logout =require("../controllers/logout")
const db = require('../Router/db-config');
const loggedIn =require("../controllers/loggedin")
const router = express.Router()
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');





// // Route for email verification link
// router.get('/verify-email/:token', (req, res) => {
//   const token = req.params.token;

//   // Check if the token exists in the database
//   db.query('SELECT * FROM members WHERE token = ?',[token],(error, results) => {
//       if (error) throw error;

//       if (results.length === 0) {
//         return res.send('Invalid or expired token.');
//       }

//       // Update the user's status to verified
//       const email = results[0].email;
//       db.query('UPDATE email_verification SET is_verified = true WHERE email = ?',[email],(error, results) => {
//           if (error) throw error;
//           res.send('Email verified successfully.');
//         }
//       );
//     }
//   );
// });

// // Route to initiate email verification
// router.post('/verify-email', (req, res) => {
//   const { email } = req.body;
//   const token = uuidv4();

//   // Save the email and token in the database
//   db.query('INSERT INTO email (email, token) VALUES (?, ?)',[email, token],(error, results) => {
//       if (error) throw error;

//       // Send the verification email
//       const verificationLink = `http://your-frontend-website/verify-email/${token}`;
//       const transporter = nodemailer.createTransport({
//         service: 'your-email-service-provider',
//         auth: {
//           user: 'your-email',
//           pass: 'your-email-password',
//         },
//       });

//       const mailOptions = {
//         from: 'your-email',
//         to: email,
//         subject: 'Email Verification',
//         text: `Click the following link to verify your email: ${verificationLink}`,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log(error);
//           res.send('Failed to send verification email.');
//         } else {
//           console.log('Email sent: ' + info.response);
//           res.send('Verification email sent successfully.');
//         }
//       });
//     }
//   );
// });






// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//       user: 'your_email@gmail.com',
//       pass: 'your_email_password',
//   },
// });

// // Serve the HTML form for password reset request
// router.get('/reset_password', (req, res) => {
//   res.render('forgotpassword');
// });

// // Handle the form submission for password reset request
// router.post('/reset_password', (req, res) => {
//   const email = req.body.email; // Assuming you use body-parser middleware to parse form data

//   // Generate a random pin code
//   const pinCode = randomstring.generate({
//       length: 6,
//       charset: 'numeric',
//   });

//   // Store the pin code in the database along with the email and expiration timestamp
//   const expirationDate = new Date();
//   expirationDate.setMinutes(expirationDate.getMinutes() + 30); // Expiration in 30 minutes

//   db.query('INSERT INTO password_reset (email, pin_code, expires_at) VALUES (?, ?, ?)',[email, pinCode, expirationDate],(error) => {
//           if (error) {
//               console.error('Error storing pin code in the database:', error);
//               res.status(500).send('Error storing pin code in the database.');
//           } else {
//               // Send the pin code to the user's email
//               const mailOptions = {
//                   from: 'your_email@gmail.com',
//                   to: email,
//                   subject: 'Password Reset PIN Code',
//                   text: `Your password reset PIN code is: ${pinCode}`,
//               };

//               transporter.sendMail(mailOptions, (error) => {
//                   if (error) {
//                       console.error('Error sending email:', error);
//                       res.status(500).send('Error sending email.');
//                   } else {
//                       res.send('Check your email for the PIN code.');
//                   }
//               });
//           }
//       }
//   );
// });


















// const sendMail_ForgotPassword = async (email, mailSubject, content) => {
//   try {
//     const [rows] = await db.promise().query('SELECT member.email FROM members LEFT JOIN users ON members.id_member = users.id_member WHERE members.id_member = ?',[your_member_id_here]);

//     if (rows.length === 0) {
//       console.log('User not found');
//       return;
//     }

//     const user = rows[0];
//       const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth : {
//               user: email,
//               pass: "vxqnqdqqnpxlsciq"
              
//           }
//       });
      
//       const option = {
//           from : email,
//           to : email,
//           subject: mailSubject,
//           html : content
      
//       };
      
//       transporter.sendMail(option, function(err, info)  {
//           if (err) {
//               console.log(err);
//               return;
//           } 
//           console.log("Sent: " + info.response);
//       });

//   } catch(err) {
//       console.log(error.message);
//   }
// }



router.get('/forgotpassword',(req,res)=>{
  
  
  res.render('forgotpassword');
})



router.post('/forgotpassword/:id', async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id);   
    
    const email = req.body.email; // Assuming you use body-parser middleware to parse form data

    // Generate a random pin code
    const pinCode = randomstring.generate({
        length: 6,
        charset: 'numeric',
    });

    // Store the pin code in the database along with the email and expiration timestamp
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30); // Expiration in 30 minutes

  db.query('INSERT INTO password_reset (email, pin_code, expires_at) VALUES (?, ?, ?)',[email, pinCode, expirationDate],
      (error) => {
          if (error) {
              console.error('Error storing pin code in the database:', error);
              res.status(500).send('Error storing pin code in the database.');
          } else {
              // Send the pin code to the user's email
              const mailOptions = {
                  from: 'your_email@gmail.com',
                  to: email,
                  subject: 'Password Reset PIN Code',
                  text: `Your password reset PIN code is: ${pinCode}`,
              };

              transporter.sendMail(mailOptions, (error) => {
                  if (error) {
                      console.error('Error sending email:', error);
                      res.status(500).send('Error sending email.');
                  } else {
                      res.send('Check your email for the PIN code.');
                  }
              });
          }
      }
  );
}

  //  const gpc =require('generate-pincode');
  //   const pin =gpc(4);
    

  //   console.log(email);
    
    // const [rows] = db.query('SELECT * FROM members WHERE email = ?', [email], async (err, result) => {});
  // const [rows] = await db.promise().query('UPDATE resume SET professional_summary = ?, work_experience = ?, skills = ?, education = ?, languages = ?, interests = ?, contact = ? WHERE resume.id_user = ?', [ professional_summary,work_experience, skills,education ,languages ,interests ,contact ,id]);    
  

  // let mailSubject = 'Reset Password';

  //     let content = 
  //             "hello asdfasfd"+
  //             'pin '+pin+
  //             '<div>Please <a href="http://localhost:5000/"> <b><u> click here </u></b></a> to reset your password.'
  //     sendMail_ForgotPassword(email, mailSubject, content);

  //   console.log(email);
  //   console.log(mailSubject);
  //   console.log(content);
    // if (rows.length === 0 ) {
    //   return res.status(404).send('User not found');
    // }

   

    // res.redirect('/user/resume/' + id );

   catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/',loggedIn, async (req, res) => {
  try{
  let status;
  let user;
  let company;
  let admin;
  let jobindex;
  let resumeindex;
  let adminindex;
  let companyindex ;
  let userindex;


  if (res.locals.users) {
    status = "loggedIn";
    user = res.locals.users;
    // console.log(user);
    [companyindex]= await db.promise().query('SELECT * FROM companies ');
    // console.log(companyindex);
    [jobindex]= await db.promise().query('SELECT * FROM job_company ');
    // console.log(jobindex);
    [resumeindex]= await db.promise().query('SELECT * FROM resume ');
    // console.log(resumeindex);
    

  } else if (res.locals.companys) {
    status = "loggedIn";
    company = res.locals.companys;
    [jobindex] = await db.promise().query('SELECT * FROM job_company ');
    // console.log(req.body.jobindex);
    [resumeindex] = await db.promise().query('SELECT * FROM resume ');
    // console.log(req.body.resumeindex);
    [userindex] = await db.promise().query('SELECT * FROM users ');
    // console.log(req.body.userindex);
    [adminindex] = await db.promise().query('SELECT * FROM admins ');
    // console.log(req.body.adminindex);
  }else if (res.locals.admins) {
    status = "loggedIn";
    admin = res.locals.admins;
    [jobindex] = await db.promise().query('SELECT * FROM job_company ');
    // console.log(req.body.jobindex);
    [resumeindex] = await db.promise().query('SELECT * FROM resume ');
    // console.log(req.body.resumeindex);
    [userindex] = await db.promise().query('SELECT * FROM users ');
    // console.log(req.body.userindex);
    [companyindex] = await db.promise().query('SELECT * FROM companies ');
    // console.log(req.body.companyindex);
  } else {
    status = "no";
    user = "nothing";
    company = "nothing";
    [jobindex] = await db.promise().query('SELECT * FROM job_company ');
    // console.log(req.body.jobindex);
    [resumeindex] = await db.promise().query('SELECT * FROM resume ');
    // console.log(req.body.resumeindex);
    [userindex] = await db.promise().query('SELECT * FROM users ');
    // console.log(req.body.userindex);
    [companyindex] = await db.promise().query('SELECT * FROM companies ');
    console.log(req.body.companyindex);
    [adminindex] = await db.promise().query('SELECT * FROM admins ');
    // console.log(req.body.adminindex);
  }

  res.render('index.ejs', { status, user, company ,admin,jobindex,resumeindex,companyindex,userindex,adminindex});
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

router.get('/login', (req, res) => {
  let status;
  let user;
  let company;
  let admin;

  if (res.locals.users) {
    status = "loggedIn";
    user = res.locals.users;
    // console.log(user)
  } else if (res.locals.companys) {
    status = "loggedIn";
    company = res.locals.companys;
    // console.log(company)
  } else if (res.locals.admins) {
    status = "loggedIn";
    admin = res.locals.admins;
    // console.log(admin)
  } else {
    status = "no";
    user = "nothing";
    company = "nothing";
  }

  res.render('login', { status, user, company,admin });
});



router.get('/registeruser',(req,res)=>{
    
    res.render('registeruser')
})
router.get('/registercompany',(req,res)=>{
    
    res.render('registercompany')
})
router.get('/registeradmin',(req,res)=>{
    
  res.render('registeradmin')
})


router.get("/logout",logout)





module.exports = router ;