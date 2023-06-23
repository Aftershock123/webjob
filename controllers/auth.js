const express =require("express");
const registeruser =require("./registeruser")
const registercompany =require("./registercompany")
const login =require("./login");
// const profile =require("./profile");
const router =express.Router();

router.post("/registeruser",registeruser)
router.post("/registercompany",registercompany)
router.post("/login",login)
// router.post("/profile",profile)
module.exports =router;