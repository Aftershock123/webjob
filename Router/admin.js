const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();
const loggedIn =require("../controllers/loggedin")

router.post('/registeradmin' , async (req, res) => {
    const { username,email, password: Npassword } = req.body;
    if (!email || !Npassword) {
        return res.status(401).json({ status: "error", error: "Please enter your email and password" });
    } else {
        db.query('SELECT email FROM admins WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8); 

                        db.query('INSERT INTO admins SET ?', { username: username, email: email, password: password }, (error, results) => {
                            if (error) {
                                console.log("insert user error");
                                throw error;
                            }
                            return res.status(200).json({ status: "success", success: "Admin has been registered" });
                        });
   
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error", error: "Internal server error" });
                }
            }
        });
    }
});
//---------------------------------------------------profile-----------------------------
router.get('/profile/:id', loggedIn,async (req, res) => {
    try {
      const {id} = req.params;

      const [rows] = await db.promise().query('SELECT * FROM admins  where id_admin = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).send('admin not found');
      }
  
      res.render('profile', { admin: rows[0] });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/updateprofile/:id', loggedIn,async (req, res) => {
    try {
      const {id} = req.params;

      const {username,email}= req.body;
      
      const [rows] = await db.promise().query('UPDATE admins SET username = ?, email = ? WHERE admins.id_admin = ?', [username, email, id]);      
      
       if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/admin/profile/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//--------------------------------------------------------web----------------------------------
router.post('/updateweb/:id',loggedIn,async(req,res)=>{
try{
  const {id} =req.params;
  const [rows] = await db.promise().query('UPDATE admins SET username = ?, email = ? WHERE admins.id_admin = ?', [username, email, id]);
  

}catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');}
});

module.exports= router;