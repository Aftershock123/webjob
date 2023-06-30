const express = require('express')
const logout =require("../controllers/logout")
const db = require('../Router/db-config');
const jwt = require('jsonwebtoken');
const router = express.Router()

const loggedIn = (req, res, next) => {
  if (!req.cookies.userRegistered) {
    res.locals.status = "no";
    return next();
  }

  try {
    const decoded = jwt.verify(req.cookies.userRegistered, process.env.JWT_SECRET);
    db.query('SELECT * FROM members WHERE id_member = ?', [decoded.id_member], (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return next(err); // Pass the error to the error handling middleware
      }

      if (result.length === 0) {
        console.log('Member not found');
        res.locals.status = "no";
        return next(); // Member not found, proceed to the next middleware/route
      }

      // Set the members and status properties on res.locals
      res.locals.members = result[0];
      res.locals.status = "loggedIn";
      console.log(res.locals.members);
      return next();
    });
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(err); // Pass the error to the error handling middleware
  }
};


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

router.get('/profile',(req,res)=>{
    
    res.render('profile')
})
router.get("/logout",logout)





module.exports = router ;