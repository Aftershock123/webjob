const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
// const randomstring = require("randomstring");
const router =express.Router();
const loggedIn =require("../controllers/loggedin")
  //ได้แล้ว
router.post('/registeruser', loggedIn , async (req, res) => {
  let company;
  let admin;
  let status;
  
    const { username,email, password: Npassword } = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Logging the original password before hashing                
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8); 
                        db.query('INSERT INTO users SET ?', { username: username, email: email, password: password}, (error, results) => {
                            if (error) {
                                console.log("insert user error");
                                throw error;
                            }
                            return  res.render('login', { company ,user,admin,status});
                        });   
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
});

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
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  //ได้แล้ว
  router.post('/updateprofile/:id', loggedIn,async (req, res) => {
    try {
      const {id} = req.params;
      // console.log(id);
      const {username,email}= req.body;
      // console.log(req.body);
      
      const [rows] = await db.promise().query('UPDATE users SET username = ?, email = ? WHERE id_user = ?', [username, email, id]);
      // console.log(rows);
      if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/user/profile/' + id);
  
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
  
      const [rows] = await db.promise().query('SELECT * FROM users where id_user = ?', [id]);
      const [row] = await db.promise().query('SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      // // const [rows] = await db.promise().query('SELECT * FROM users  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?', [id]);
      
      // console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('resume',{user:rows[0],resume:row[0],company,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  //ได้แล้ว
  router.post('/addresume/:id', async (req, res) => {
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
  router.get('/updateresume/:id', async (req, res) => {
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
  router.post('/updateresume/:id', async (req, res) => {
    try {
      const {id} = req.params;
        
      const {professional_summary,work_experience,skills,education,languages,interests,contact}= req.body;
      
      const [rows] = await db.promise().query('UPDATE resume SET professional_summary = ?, work_experience = ?, skills = ?, education = ?, languages = ?, interests = ?, contact = ? WHERE resume.id_user = ?', [ professional_summary,work_experience, skills,education ,languages ,interests ,contact ,id]);    
      
      if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
      res.redirect('/user/updateresume/' + id );
  
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

  


module.exports= router;