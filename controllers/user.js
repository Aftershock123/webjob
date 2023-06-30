const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();


router.post('/registeruser' , async (req, res) => {
    const { username,email, password: Npassword } = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        // console.log(email);
        // console.log(username);
        db.query('SELECT email FROM members WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Logging the original password before hashing
                    // console.log(Npassword);
                
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8);
                    db.query('INSERT INTO members SET ?', { username: username ,email: email, password: password }, (error, results) => {
                        if (error) {
                            console.log("insert member error");
                            throw error;
                        }
                    
                        // const memberId = results.insertId; // Get the inserted member ID
                    
                        db.query('INSERT INTO users SET ?', { username: username, email: email, password: password, id_member: results.insertId }, (error, results) => {
                            // console.log(username);
                            // console.log(email);
                            // console.log(password);
                            if (error) {
                                console.log("insert user error");
                                throw error;
                            }
                            return res.status(200).json({ status: "success", success: "User has been registered" });
                        });
                    });
                    
                    
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
});


 



module.exports= router;