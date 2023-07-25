const express = require('express')
const logout =require("../controllers/logout")

const loggedIn =require("../controllers/loggedin")
const router = express.Router()
const nodemailer = require('nodemailer'); 

const sendMail_ForgotPassword = async (email, mailSubject,content) => {
  try {

      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth : {
              user: "nonjirawat2506@gmail.com",
              pass: "vxqnqdqqnpxlsciq"
              
          }
      });
      
      const option = {
          from : "nonjirawat2506@gmail.com",
          to : email,
          subject: mailSubject,
          html : content
      
      };
      
      transporter.sendMail(option, function(err, info)  {
          if (err) {
              console.log(err);
              return;
          } 
          console.log("Sent: " + info.response);
      });

  } catch(err) {
      console.log(error.message);
  }
}



router.get('/forgetpassword',(req,res)=>{
  
  
  res.render('forgetpassword');
})



router.post('/forgetpassword/:id', async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id);   
    
    const gpc =require('generate-pincode');
    const pin =gpc(4);
    const {email}= req.body;

    console.log(email);
    
    const [rows] = db.query('SELECT * FROM members WHERE email = ?', [email], async (err, result) => {});
  // const [rows] = await db.promise().query('UPDATE resume SET professional_summary = ?, work_experience = ?, skills = ?, education = ?, languages = ?, interests = ?, contact = ? WHERE resume.id_user = ?', [ professional_summary,work_experience, skills,education ,languages ,interests ,contact ,id]);    
  

  let mailSubject = 'Reset Password';

      let content = 
              "hello asdfasfd"+
              'pin '+pin+
              '<div>Please <a href="http://localhost:5000/"> <b><u> click here </u></b></a> to reset your password.'
      sendMail_ForgotPassword(email, mailSubject, content);

    console.log(email);
    console.log(mailSubject);
    console.log(content);
    // if (rows.length === 0 ) {
    //   return res.status(404).send('User not found');
    // }

   

    // res.redirect('/user/resume/' + id );

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});







































router.get('/', loggedIn, (req, res) => {
  let status;
  let member;
  let user;
  let company;
  
  if (res.locals.members) {
    status = "loggedIn";
    member = res.locals.members;
    user = res.locals.users;
    company = res.locals.companys;
    console.log(company);
    console.log(user);
    console.log(status);
  } else {
    status = "no";
    member = "nothing";
  }

  res.render('index.ejs', { status, member,user,company }); // Pass the 'status' variable to the view
});

  
router.get('/login',(req,res)=>{
  let status;
  let member;
  

  if (req.members) {
    status = "loggedIn";
    member = req.members;
  } 
 
  else {
    status = "no";
    member = "nothing";
  }
    res.render('login', { status, member })
});


router.get('/registeruser',(req,res)=>{
    
    res.render('registeruser')
})
router.get('/registercompany',(req,res)=>{
    
    res.render('registercompany')
})


router.get("/logout",logout)





module.exports = router ;