const express = require('express')
const authController =require('../controllers/auth')
const router = express.Router()

router.post('/registeruser', authController.registeruser)
module.exports = router ;