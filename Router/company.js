const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();
const multer = require('multer');
const loggedIn =require("../controllers/loggedin")
const fs = require('fs');
const crypto = require('crypto');
const verificationToken = crypto.randomBytes(20).toString('hex');
const sendMail =require("../controllers/sendmail");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/image/');
  },
  filename: (req, file, callback) => {
    callback(null,Date.now() +file.originalname);
  }
});

const upload = multer({ storage: storage });





//ลงทะเบียน 
router.post('/registercompany' , upload.single('image'), async (req, res) => {
  let admin ;
  let user  ;
  let company ;
  let status = res.locals.status ;
 
  const { username: username, password: Npassword, name_company, type_company, namecontact_company, address_company, province_company, county_company, district_company, zipcode_company, tell_company , email,image:filename} = req.body;
  if (!email || !Npassword) {
      return res.status(401).json({ status: "error", error: "Please enter your email and password" });
  } else {
      db.query('SELECT email FROM companies WHERE email = ?', [email], async (err, result) => {
          if (err) throw err;
          if (result[0]) {
              return res.json({ status: "error", error: "Email has already been registered" });
          } else {
              try {
                  // Hashing the password
                  const password = await bcrypt.hash(Npassword, 8);

                      db.query('INSERT INTO companies SET ?', { username: username, password: password, name_company: name_company, type_company: type_company, namecontact_company: namecontact_company, address_company: address_company, province_company: province_company, county_company: county_company, district_company: district_company, zipcode_company: zipcode_company, tell_company: tell_company, email: email,image: filename  },(error) =>{
                          if (error) {
                              console.log("Insert company error");
                              throw error;
                          } 0
                         
                          return res.render('login', { company ,user,admin,status});
                      });
                  
              } catch (error) {
                  console.log("Internal server error");
                  return res.status(500).json({ status: "error", error: "Internal server error" });
              }
          }
      });
  }
});
//--------------------------------------------- profile------------------------------------------------------
 
//แสดงโปรไฟล์
router.get('/profile/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let admin;
      const {id} = req.params;
    
      const [rows] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
  
    console.log(rows[0].image)
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { company: rows[0] ,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  //อัพเดตโปรไฟล์
  router.post('/updateprofile/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let admin;
      const {id} = req.params;
      
      const {username,email}= req.body;
      
      const [rows] = await db.promise().query('UPDATE companies SET username = ?, email = ? WHERE companies.id_company = ?', [username, email, id]);
      const [updatedCompany] = await db.promise().query('SELECT * FROM companies WHERE id_company = ?', [id]);// console.log(rows);
       if (rows.length === 0 ) {
        return res.status(404).send('companies not found');
      }
  
      res.render('profile', { company: updatedCompany[0] ,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//-----------------------------------------------------------job-------------------------------

  //เพิ่มเส้จไปหน้าjoball
    //ได้แล้วเพิ่มต้องแก้นิดหน่อย
    router.get('/addjob_company/:id', loggedIn, async (req, res) => {
      try {    
        let user;
        let admin;   
        const {id} = req.params;

        const [rows] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
        
        if (rows.length === 0) {
          return res.status(404).send('User not found');
        }
        res.render('addjob', { company: rows[0] ,user,admin});
    
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
    //ได้แล้ว
    router.post('/addjob_company/:id', loggedIn, async (req, res) => {
      try {
        let user;
      let admin;
      const {id} = req.params;
      
      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;
      
      const [rows] = await db.promise().query('INSERT INTO job_company SET ?', { name_job: name_job, role: role, detail_work: detail_work, experience: experience, gender: gender, education: education, welfare: welfare, salary: salary, workday: workday, day_off: day_off, deadline_offer: deadline_offer,id_company: id});
      
      const [updatedCompany] = await db.promise().query('SELECT * FROM companies  where id_company = ?', [id]);
      
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      res.render('addjob', { job: rows[0] ,company: updatedCompany[0] ,user,admin});
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
    //ได้แล้ว
  router.get('/joball/:id', loggedIn, async (req, res) => {
    try {
      let user;
      let admin;
      const {id} = req.params; 

      const [rows] = await db.promise().query('SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.id_company = ?', [id]);


      
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('jobgetall',{company:rows[0],job:rows,user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  //////เหลือ Updateที่ยังไม่ได้
  

  router.get('/updatejob_company/:id', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;

      const [rows] = await db.promise().query('SELECT * FROM job_company  INNER JOIN companys ON job_company.id_company = companys.id_company where job_company.id_company = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('updatejob',{company:rows[0],job:rows[0]});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/updatejob_company/:id/', loggedIn, async (req, res) => {
    try {
      const {id} = req.params;

      const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;
      
      const [rows] = await db.promise().query('UPDATE job_company SET name_job = ?, role = ?, detail_work = ?, experience = ?, gender = ?, education = ?, welfare = ?, salary = ?, workday = ?, day_off = ?, deadline_offer = ?,id = ? WHERE  idjob_company job_company.id_company = ?', [ name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer,id]);
    
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/company/updatejob_company/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



///เจาะจงงานในหน้าindex ปันหาคือทำไงให้ค่าของหน้าindexส่งมาเช่นค่าของactor navberมีปันหา
//เอาค่าในlocalมาใช้


  router.get('/jobbyidjob/:id', loggedIn, async (req, res) => {
    try {
      let user = res.locals.users;
      let admin = res.locals.admins;
      let company = res.locals.companys;
      
      const {id} = req.params; 
      
      const [rows] = await db.promise().query('SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.idjob_company = ?', [id]);

      // const [Company] =await db.promise().query('SELECT * FROM companies where id_company =?',[id] );
      // console.log(rows[0]);
      // console.log(id_company);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
      
      res.render('detailjob',{company,job:rows[0],user,admin});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//---------------------------------------------- ค้นหา-------------------------------------------------
  //ยังไม่ได้ทำค้นหาจิงจัง
router.post('/searchcompany', loggedIn, async (req, res) => {
    try {
      const search= req.body.searchcompany;
      console.log(search)
  
      let [rows] = await db.promise().query('SELECT * FROM companies where username like "%'+search+'%"');
      console.log(rows)
      var data=[];
      for(i=0;i<rows.length;i++)
      {
          data.push(rows[i]);
      }
      res.send(JSON.stringify(data));
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });




  // ค้นหาตำแหน่งงาน
    router.post('/searchjob', loggedIn, async (req, res) => {
    try {
     
  
      const [rows] = await db.promise().query('SELECT * FROM job_company where name_job like ?', ['%${searchjob}%'],(err,result));
      console.log(rows);
      // res.send(result);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });




//   router.post('/resetpassword',async (req,res) =>{
//     try{
//     const email =req.body.email;

//     const [rows] = await db.promise().query('SELECT * FROM users  where users.email = ?', [email]);
//       if(rows){
//         const otp_before = Math.floor(1000 + Math.random() * 9000);
//         const otp = otp_before.toString();
//         await db.promise().query('UPDATE users SET  token = ? where users.email = ?', [ otp ,email]);    
//         var transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: "asdf@gmail.com",
//             pass: "asdf",
//           },
//         });

//         var mailOptions = {
//           from: "aceportgasonepiece@gmail.com",
//           to: email,
//           subject: "Reset your password",
//           html:
//             `<!DOCTYPE html>
//     <html lang="en">
//       <head>
//         <meta charset="UTF-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>Document</title>
//         <style>
//           @import url("https://fonts.googleapis.com/css2?family=Raleway:ital,wght@1,200&display=swap");

//           * {
//             margin: 0;
//             padding: 0;
//             border: 0;
//           }

//           body {
//             font-family: "Raleway", sans-serif;
//             background-color: #d8dada;
//             font-size: 19px;
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 3%;
//           }

//           header {
//             width: 98%;
//           }

//           #wrapper {
//             background-color: #f0f6fb;
//           }

//           h1,
//           p {
//             margin: 3%;
//           }
//           .btn {
//             float: center;
//             text-align: center;
//             margin-left: auto;
//             margin-right: auto;
//             width: 70%;
//             background-color: #303840;
//             color: #f6faff;
//             text-decoration: none;
//             font-weight: 800;
//             padding: 8px 12px;
//             border-radius: 8px;
//             letter-spacing: 2px;
//           }
//           .btn-pink {
//           color: #fff;
//           background-color: rgb(255, 133, 194);
//           border-color: rgb(255, 133, 194);
//           }

//           .btn.btn-pink:hover,
//           .btn.btn-pink:focus,
//           .btn.btn-pink:active,
//           .btn.btn-pink.active {
//             color: #ffffff;
//             background-color: #fa228a;
//             border-color: #fa228a;
//           }

//           .btn-purple3 {
//             color: rgb(27, 27, 27);
//             background-color: #D9ACF5;
//             border-color: #D9ACF5;
//           }

//           .btn.btn-purple3:hover,
//           .btn.btn-purple3:focus,
//           .btn.btn-purple3:active,
//           .btn.btn-purple3.active {
//             color: #ffffff;
//             background-color: #bd96d5;
//             border-color: #bd96d5;
//           }

//           .text-my-own-color {
//             color: #ffffff !important;
//             text-decoration: none;
//           }

//           .text-my-own-color:hover,
//           .text-my-own-color:focus,
//           .text-my-own-color:active {
//           text-decoration: none;
//             color: #fa228a !important;
//           }
//           hr {
//             height: 1px;
//             background-color: #303840;
//             clear: both;
//             width: 96%;
//             margin: auto;
//           }

//           #contact {
//             text-align: center;
//             padding-bottom: 3%;
//             line-height: 16px;
//             font-size: 12px;
//             color: #303840;
//           }
//         </style>
//       </head>
//       <body>
//         <div id="wrapper">
//           <div class="one-col">
//             <h1>Hello,</h1>
//             <p>
//               We've received a request to reset the password. No changes have been made your account yet.
//             </p>` +
//             `<h2 style="margin: 0 auto;width: max-content;padding: 0 10px;">Your OTP</h1><br><h2 style="background: #fa228a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">` +
//             otp +
//             "</h2>" +
//             `<p>
//             You can reset your password by clicking the link below and filling in the OTP:
//             </p>` +
//             '<div class="btn btn-pink"><a class="text-my-own-color" href="http://localhost:3000/users/resetPassword"' +
//             //   ?= ' +
//             // otp +
//             '"> Reset your password </a></div>' +
//             `
//             <p>
//             If you did not request a new password, please let us know immediately by replying to this email.
//             </p>
//             <hr />

//             <footer>
//               <p id="contact">
//                 Copyright © 2023 nawatniyai <br />
//               </p>
//             </footer>
//           </div>
//         </div>
//       </body>
//     </html>`,
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             console.log(error);
//           } else {
//             console.log("Email sent: " + info.response);
//           }
//         });
//       }
//     }catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   });


//   router.post('changepassword' ,loggedIn, async(req,res,next)=>{
//   try{
//   const token = req.body.token;
//   // console.log("token: " + token);
//   const [rows] = await db.promise().query('SELECT * FROM users  where users.token = ?', [token]);
//   if (rows) {
//     const password = req.body.password;
//     const salt = await bcrypt.genSalt(10);
//     const newPassword = await bcrypt.hash(password, salt);
//     // console.log("password: " + password);
//     // console.log("newPassword: " + newPassword);
//     await db.promise().query('UPDATE users SET  password  = ? where users.token = ?', [ newPassword ,token]);    

//     await db.promise().query('UPDATE users SET  token  = "" where users.token = ?', [token]); 
    
//     console.log("resetToken: " + token);
//     res.redirect("/users/login");
//   } else {
    
//         res.render("changepassword", {
//           errors: "OTP ไม่ถูกต้อง",
         
//         })
// }}catch (error) {
//   console.error(error);
//   res.status(500).send('Internal Server Error');
// }
// }
//   );

module.exports= router;