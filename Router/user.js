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

///ตัวนี้คือหาค่าเก้บค่าไว้ในตัวแปรแล้วต้องส่งไปให้routerจากนั้นค่อยเรียกใช้อีกที
//พอเริ่มมีคำสั่งที่วับซ้อนจะต้องใช้promise ในที่นี้คือinner joinและใช้async
router.get('/profile/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
  
      const [rows] = await db.promise().query('SELECT * FROM members INNER JOIN users ON members.id_member = users.id_member where members.id_member = ?', [id]);
      console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { user: rows[0] });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/updateprofile/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
      const {username,email}= req.body;
      console.log(req.body);
      
      const [rows] = await db.promise().query('UPDATE users SET username = ?, email = ? WHERE users.id_member = ?', [username, email, id]);
      console.log(rows);
      const [rows2] = await db.promise().query('UPDATE members SET username = ?, email = ? WHERE members.id_member = ?', [username, email, id]);
      if (rows.length === 0 && rows2.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/user/profile/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
 

//พอ join จากlogged inแล้วก้จะเรียกใช้ locals.user.id_user ได้ก้จะได้id-userมา

  router.get('/resume/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);
  
      const [rows] = await db.promise().query('SELECT * FROM s INNER JOIN users ON members.id_member = users.id_member where members.id_member = ?', [id]);
      console.log(rows);
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }
  
      res.render('resume', { user: rows[0] });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.post('/resume/:id', async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id);     
      const [rows] = await db.promise().query('INSERT INTO resumes SET ?', { professional_summary: professional_summary, work_experiance: work_experiance, skills: skills, education: education ,languages: languages ,interests: interests ,contact: contact ,id_user: results.insertId}, (error, results) => {    
    });
      console.log(rows);
      
      if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/user/resume/' + id);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });


module.exports= router;