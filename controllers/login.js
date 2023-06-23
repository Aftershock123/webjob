const jwt = require('jsonwebtoken');
const db = require('../Router/db-config');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", error: "Please enter your email and password" });
  } else {
    db.query('SELECT * FROM members WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;
      if (!result.length || !await bcrypt.compare(password, result[0].password)) {
        return res.json({ status: "error", error: "Incorrect email or password" });
      } else {
        // Logging the password before hashing
        console.log(password);
        
        // Generating JWT token
        const token = jwt.sign({ id_member: result[0].id_member }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES
        });

        const cookieOptions = {
          expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
          httpOnly: true
        };

        res.cookie("userRegistered", token, cookieOptions);
        return res.status(200).json({ status: "success", success: "User has been logged in" });
      }
    });
  }
};

module.exports = login;