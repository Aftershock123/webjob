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
        // console.log(email);
        // console.log(username);
        db.query('SELECT email FROM admins WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) {
                return res.json({ status: "error", error: "Email has already been registered" });
            } else {
                try {
                    // Logging the original password before hashing
                    // console.log(Npassword);
                
                    // Hashing the password
                    const password = await bcrypt.hash(Npassword, 8); 
                    
                        // const memberId = results.insertId; // Get the inserted member ID
                    
                       
                        db.query('INSERT INTO admins SET ?', { username: username, email: email, password: password }, (error, results) => {
                            // console.log(username);
                            // console.log(email);
                            // console.log(password);
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

///ตัวนี้คือหาค่าเก้บค่าไว้ในตัวแปรแล้วต้องส่งไปให้routerจากนั้นค่อยเรียกใช้อีกที
//พอเริ่มมีคำสั่งที่วับซ้อนจะต้องใช้promise ในที่นี้คือinner joinและใช้async
router.get('/profile/:id', loggedIn,async (req, res) => {
    try {
      const {id} = req.params;
      // console.log(id);
  
      const [rows] = await db.promise().query('SELECT * FROM admins  where id_admin = ?', [id]);
      // console.log(rows);
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
      // console.log(id);
      const {username,email}= req.body;
      // console.log(req.body);
      
      const [rows] = await db.promise().query('UPDATE admins SET username = ?, email = ? WHERE admins.id_admin = ?', [username, email, id]);
      
      // console.log(rows);
       if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/admin/profile/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  
router.post('/updateweb/:id',loggedIn,async(req,res)=>{
try{
  const {id} =req.params;
  const [rows] = await db.promise().query('UPDATE admins SET username = ?, email = ? WHERE admins.id_admin = ?', [username, email, id]);
  

}catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');}
});

module.exports= router;