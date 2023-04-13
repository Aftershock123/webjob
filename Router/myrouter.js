const express =require('express')
const router =express.Router
const path =require('path')

const home = path.join(__dirname,"../webpage/home.html")
const login = path.join(__dirname,"../webpage/login.html")
const registercompany = path.join(__dirname,"../webpage/registerCompany.html")

router.get("/",(req,res)=>{
    res.status(200)
    res.type("text/html")
    res.sendFile(home)
})


router.get("/login",(req,res)=>{
    res.status(200)
    res.type("text/html")
    res.sendFile(login)
})

router.get("/registeruser",(req,res)=>{
    res.sendFile(path.join(__dirname,"../webpage/registerUser.html"))
})

module.exports =router