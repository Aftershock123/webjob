const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");


const register = async (req, res) => {
    const { name,email, password: Npassword, } = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        console.log(email);
        console.log(name);
        db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Logging the original password before hashing
                    console.log(Npassword);
                
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8);
                    db.query('INSERT INTO users SET ?', { name:name, email: email, password: password }, (error, results) => {
                        if (error) throw error;
                        return res.status(200).json({ status: "success", success: "User has been registered" });
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
};
module.exports= register;