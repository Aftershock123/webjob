const express = require('express')
const router = express.Router()

router.get('/',(req,res)=>{
    const name ="Non"
    res.render('index.ejs',{data:name})
})


router.get('/login',(req,res)=>{
    res.render('login')
})

router.get('/registeruser',(req,res)=>{
    
    res.render('registeruser')
})
router.get('/registercompany',(req,res)=>{
    
    res.render('registercompany')
})

router.get('/resume',(req,res)=>{
    
    res.render('resume')
})

router.get('/payment',(req,res)=>{
    
    res.render('payment')
})




module.exports = router 