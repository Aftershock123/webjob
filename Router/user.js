const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const {validationResult} =require('express-validator');
const {signUpValidation} =require('../controllers/validation')
const fs = require('fs');
const crypto = require('crypto');
const router =express.Router();
const loggedIn =require("../controllers/loggedin");
const multer = require('multer');
const sendMail =require("../controllers/sendmail");

const path =require('path')
const ejs =require('ejs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/image/');
  },
  filename: (req, file, cb) => {
    cb(null,Date.now() +file.originalname);
  }
});
const filefilter =(req,file,cb) =>{
  (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')?
  cb(null,true):cb(null,false);
}

const upload = multer({ storage: storage ,fileFilter:filefilter});






router.post('/registeruser', upload.single('image'),signUpValidation,loggedIn, async (req, res,err) => {
  let company;
  let admin;
  let user;
   let status = res.locals.status ;
  const errors = validationResult(req);

  const { username,email, password: Npassword ,image:filename} = req.body;
  if (!email || !Npassword ||errors.isEmpty()) {
    return res.status(400).json({ status: "error", error: errors.array() });
  } else {
    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;
      if (result && result.length) {
        return res.status(400).json({ status: "error", error: "Email has already been registered" });
      } else {
        try {
          const password = await bcrypt.hash(Npassword, 8); 
          db.query('INSERT INTO users SET ?', { username: username, email: email, password: password,image:filename}, async (error, results) => {
            if (error) {
              console.log("insert user error");
              throw error;
            }
            const verificationToken = crypto.randomBytes(20).toString('hex');
            let mailSubject ='Mail Verification';  

            const content= "http://localhost:5000/user/verify?token= "+verificationToken
                            
            await sendMail(req.body.email,mailSubject,content);
            await db.promise().query('UPDATE users set token=? where email=? ',[ verificationToken,req.body.email],async(error,result)=>{
              if (error) {
                console.log("insert user error");
                throw error;
              }
              return res.redirect("/user/verify");
            })
          });   
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
});
// router.get('/token/:verificationToken:email', loggedIn ,async(req,res) =>{
// const email =req.params.email;
//   const verificationToken = req.params.verificationToken;
//   db.query(`UPDATE users SET token = ${verificationToken} where email = ${email}`)
//     if(error){
//       throw error
//     }
//     return res.send ('Mail verified Success');
    
// });
router.get('/verify', loggedIn, async (req, res) => {
  try {
    let user;
    let company;
    let admin;
    
    
    console.log('Request object:', req);
    console.log('Request URL:', req.url);
    console.log('Parsed Query Parameters:', req.query);
    const token = req.query.token.trim();
    console.log('Token from request:', token);
    console.log('Token length:', token.length);

    db.query('SELECT * FROM `users` WHERE `token` = ? limit 1', [token], async (err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).send('Internal Server Error');
      }

      console.log('Query result:', result);

      if (result.length > 0) {
        const userId = result[0].id_user; // Assuming 'id' is the correct column name
        console.log(userId);
        //คิดว่าต้องpost เลยมีความคิดว่าทำเป้นไฟล์แยกน่าจะง่ายกว่าเพราะมีการเรียกใช้ทั้งการgetและpost
        db.query('UPDATE users SET token = null, verified = 1 WHERE id_user = ?', [userId], async (error, updateResult) =>{
          if (error) {
            console.error('Error updating the user:', error);
            return res.status(500).send('Internal Server Error');
          }

          console.log('Update result:', updateResult);
          return res.render('good',{user,company,admin});
        });
      } else {
        console.log('No matching user found for the token.');
        return res.render('404');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





router.get('/user/:resumeId/job/:jobId',async(req,res) =>{
  const resumeId = req.params.resumeId; // Extract the user ID
  const jobId = req.params.jobId; // Extract the order ID
  db.query('INSERT INTO historyuser SET ?',{resume_Id:resumeId,job_id:jobId})
  db.query('SELECT *.r,*.j FROM historyuser INNER JOIN  resume ON historyuser.resume_id = resume.resume_id INNER JOIN   jobcompany ON historyuser.jobid = jobcompany.jobid ',(error,result,fields) =>{
    if(error){
      throw err
    }
    if(result.length > 0){
      db.query('SELECT * FROM companies  where jobid =?',jobId)
    }
    // return render('index');
  })
})

//-------------------------------------------------profile---------------------------------------
  //ได้แล้ว
router.get('/profile/:id', loggedIn,async (req, res) => {
    try {
      let company;
      let admin;
      const {id} = req.params;
      // console.log(id);
      // const [row1] = await db.promise().query('SELECT * FROM companies ');
      // const [row2] = await db.promise().query('SELECT * FROM admins');
      const [rows] = await db.promise().query('SELECT * FROM users  where id_user = ?', [id]);
      // const [row4] = await db.promise().query('SELECT * FROM historyuser where id_user = ?',[id]);
      // console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { user: rows[0] ,company,admin});
      // if(jobId){

      //   res.redirect('/user/:resumeId/job/:jobId');
      // }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  //ได้แล้ว
  router.post('/updateprofile/:id', loggedIn,async (req, res) => {
    try {
      let company;
      let admin ;
      
      const {id} = req.params;
      // console.log(id);
      const {username,email}= req.body;
      // console.log(req.body);
      const [rows] = await db.promise().query('UPDATE users SET username = ?, email = ? WHERE id_user = ?', [username, email, id]);
      const [row1] = await db.promise().query('SELECT * FROM users  where id_user = ?', [id]);

     
      console.log(row1[0]);
      if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { user: row1[0] ,company,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
 
///----------------------------------------------------resume-------------------------------------//////////////////
//รวมหน้าaddresume กับupdateresume
  //ได้แล้ว
  router.get('/addresume/:id',loggedIn, async (req, res) => {
    try {
      let company;
      let admin;
      const {id} = req.params;
  
      // const [rows] = await db.promise().query('SELECT * FROM users where id_user = ?', [id]);
      const [row] = await db.promise().query('SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      // // const [rows] = await db.promise().query('SELECT * FROM users  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      // console.log(rows[0]);
      console.log(row[0]);
      if (row.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('resume',{user:row[0],resume:row[0],company,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  //ได้แล้ว
  router.post('/addresume/:id', loggedIn, async (req, res) => {
    try {
      let company;
      let admin;
      const {id} = req.params;
      
      const {professional_summary,work_experience,skills,education,languages,interests,contact}= req.body;
      
      const [rows] = await db.promise().query('INSERT INTO resume SET ?', { professional_summary: professional_summary, work_experience: work_experience, skills: skills, education: education ,languages: languages ,interests: interests ,contact: contact ,id_user:id});
       const [row] = await db.promise().query('SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      
        
        if (rows.length === 0 ) {
          return res.status(404).send('User not found');
        }

        res.render('resume',{user:row[0],resume:row[0],company,admin});
    
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });






  //ไม่โชว์ข้อมูลล่าสุดที่เพิ่ม 
  //เพิ่มแล้วลบอันเก่าออกเลย ยังไม่ได้ทำแค่คิดเฉยๆแก้ปันหาเพิ่มแล้วค่าล่าสุดไม่มา
  router.get('/updateresume/:id', loggedIn, async (req, res) => {
    try {
      
      let company;
      let admin;
      
      const {id} = req.params;
      // console.log(id);
      
      
      const [rows] = await db.promise().query('SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      // console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('resume',{user:rows[0],resume:rows,company,admin});
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


//ได้แล้ว
  router.post('/updateresume/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let company;

      const {id} = req.params;
        
      const {professional_summary,work_experience,skills,education,languages,interests,contact}= req.body;
      
      const [rows] = await db.promise().query('UPDATE resume SET professional_summary = ?, work_experience = ?, skills = ?, education = ?, languages = ?, interests = ?, contact = ? WHERE resume.id_user = ?', [ professional_summary,work_experience, skills,education ,languages ,interests ,contact ,id]);    
      
      if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
      res.render('resume',{user:rows[0],resume:rows,company,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  


 

  router.post('/resetpassword',async (req,res) =>{
    try{
    const email =req.body.email;

    const [rows] = await db.promise().query('SELECT * FROM users  where users.email = ?', [email]);
      if(rows){
        const otp_before = Math.floor(1000 + Math.random() * 9000);
        const otp = otp_before.toString();
        await db.promise().query('UPDATE users SET  token = ? where users.email = ?', [ otp ,email]);    
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "asdf@gmail.com",
            pass: "asdf",
          },
        });

        var mailOptions = {
          from: "aceportgasonepiece@gmail.com",
          to: email,
          subject: "Reset your password",
          html:
            `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Raleway:ital,wght@1,200&display=swap");

          * {
            margin: 0;
            padding: 0;
            border: 0;
          }

          body {
            font-family: "Raleway", sans-serif;
            background-color: #d8dada;
            font-size: 19px;
            max-width: 800px;
            margin: 0 auto;
            padding: 3%;
          }

          header {
            width: 98%;
          }

          #wrapper {
            background-color: #f0f6fb;
          }

          h1,
          p {
            margin: 3%;
          }
          .btn {
            float: center;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            width: 70%;
            background-color: #303840;
            color: #f6faff;
            text-decoration: none;
            font-weight: 800;
            padding: 8px 12px;
            border-radius: 8px;
            letter-spacing: 2px;
          }
          .btn-pink {
          color: #fff;
          background-color: rgb(255, 133, 194);
          border-color: rgb(255, 133, 194);
          }

          .btn.btn-pink:hover,
          .btn.btn-pink:focus,
          .btn.btn-pink:active,
          .btn.btn-pink.active {
            color: #ffffff;
            background-color: #fa228a;
            border-color: #fa228a;
          }

          .btn-purple3 {
            color: rgb(27, 27, 27);
            background-color: #D9ACF5;
            border-color: #D9ACF5;
          }

          .btn.btn-purple3:hover,
          .btn.btn-purple3:focus,
          .btn.btn-purple3:active,
          .btn.btn-purple3.active {
            color: #ffffff;
            background-color: #bd96d5;
            border-color: #bd96d5;
          }

          .text-my-own-color {
            color: #ffffff !important;
            text-decoration: none;
          }

          .text-my-own-color:hover,
          .text-my-own-color:focus,
          .text-my-own-color:active {
          text-decoration: none;
            color: #fa228a !important;
          }
          hr {
            height: 1px;
            background-color: #303840;
            clear: both;
            width: 96%;
            margin: auto;
          }

          #contact {
            text-align: center;
            padding-bottom: 3%;
            line-height: 16px;
            font-size: 12px;
            color: #303840;
          }
        </style>
      </head>
      <body>
        <div id="wrapper">
          <div class="one-col">
            <h1>Hello,</h1>
            <p>
              We've received a request to reset the password. No changes have been made your account yet.
            </p>` +
            `<h2 style="margin: 0 auto;width: max-content;padding: 0 10px;">Your OTP</h1><br><h2 style="background: #fa228a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">` +
            otp +
            "</h2>" +
            `<p>
            You can reset your password by clicking the link below and filling in the OTP:
            </p>` +
            '<div class="btn btn-pink"><a class="text-my-own-color" href="http://localhost:3000/users/resetPassword"' +
            //   ?= ' +
            // otp +
            '"> Reset your password </a></div>' +
            `
            <p>
            If you did not request a new password, please let us know immediately by replying to this email.
            </p>
            <hr />

            <footer>
              <p id="contact">
                Copyright © 2023 nawatniyai <br />
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    }catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post('changepassword' ,loggedIn, async(req,res,next)=>{
  try{
  const token = req.body.token;
  // console.log("token: " + token);
  const [rows] = await db.promise().query('SELECT * FROM users  where users.token = ?', [token]);
  if (rows) {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);
    // console.log("password: " + password);
    // console.log("newPassword: " + newPassword);
    await db.promise().query('UPDATE users SET  password  = ? where users.token = ?', [ newPassword ,token]);    

    await db.promise().query('UPDATE users SET  token  = "" where users.token = ?', [token]); 
    
    console.log("resetToken: " + token);
    res.redirect("/users/login");
  } else {
    
        res.render("changepassword", {
          errors: "OTP ไม่ถูกต้อง",
         
        })
}}catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}
}
  );

//userid

  router.get('/pdf/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let admin;
      const {id} = req.params;
//ได้ค่าcompanyid เพื่อหาjobid
    // const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;

    const [resume] = await db.promise().query('SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
    const [historyuser] =await db.promise().query('SELECT * FROM historyuser ')

    if (resume.length > 0) {
      return res.status(404).send('User not found');
    }
console.log(resume[0]);
let  mailSubject = "Resume" +resume.username

let [content]=resume[0];
let [content1]=historyuser[0];
generatePDF(req.body.email,mailSubject,content,content1);


  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

  


module.exports= router;