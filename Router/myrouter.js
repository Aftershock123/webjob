const express = require('express')
const logout =require("../controllers/logout")

const loggedIn =require('../controllers/loggedin');
const router = express.Router()
router.get('/', loggedIn, (req, res) => {
    let status;
    let user;
  
    if (req.user) {
      status = "loggedIn";
      user = req.user;
    } else {
      status = "no";
      user = "nothing";
    }
  
    res.render('index.ejs', { status, user }); // Pass the 'status' variable to the view
  });
  
  


router.get('/login',(req,res)=>{
    res.render('login')
})


router.get('/registeruser',(req,res)=>{
    
    res.render('registeruser')
})
// router.get('/registercompany',(req,res)=>{
    
//     res.render('registercompany')
// })

// router.get('/resume',(req,res)=>{
    
//     res.render('resume')
// })
router.get("/logout",logout)





module.exports = router ;