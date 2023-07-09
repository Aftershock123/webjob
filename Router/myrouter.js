const express = require('express')
const logout =require("../controllers/logout")

const loggedIn =require("../controllers/loggedin")
const router = express.Router()




router.get('/', loggedIn, (req, res) => {
  let status;
  let member;
  
  if (res.locals.members) {
    status = "loggedIn";
    member = res.locals.members;
  } else {
    status = "no";
    member = "nothing";
  }

  res.render('index.ejs', { status, member }); // Pass the 'status' variable to the view
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