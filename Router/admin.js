const db =require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express =require("express");
const router =express.Router();
const loggedIn =require("../controllers/loggedin")

// router.post('/registeradmin' , async (req, res) => {
//   let company;
//   let admin;
//   let status;
//     const { username,email, password: Npassword } = req.body;
//     if (!email || !Npassword) {
//         return res.status(401).json({ status: "error", error: "Please enter your email and password" });
//     } else {
//         db.query('SELECT email FROM admins WHERE email = ?', [email], async (err, result) => {
//             if (err) throw err;
//             if (result[0]) {
//                 return res.json({ status: "error", error: "Email has already been registered" });
//             } else {
//                 try {
//                     // Hashing the password
//                     const password = await bcrypt.hash(Npassword, 8); 

//                         db.query('INSERT INTO admins SET ?', { username: username, email: email, password: password }, (error, results) => {
//                             if (error) {
//                                 console.log("insert user error");
//                                 throw error;
//                             }
//                             return  res.render('login', { company ,user,admin,status});
//                         });
   
//                 } catch (error) {
//                     console.log(error);
//                     return res.status(500).json({ status: "error", error: "Internal server error" });
//                 }
//             }
//         });
//     }
// });
//---------------------------------------------------profile-----------------------------
router.get('/profile/:id', loggedIn,async (req, res) => {
    try {
      let user;
      let company;
      const {id} = req.params;

      const [rows] = await db.promise().query('SELECT * FROM admins  where id_admin = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).send('admin not found');
      }
  
      res.render('profile', { admin: rows[0] ,user,company});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/updateprofile/:id', loggedIn,async (req, res) => {
    try {
      let user;
      let company;
      const {id} = req.params;

      const {username,email}= req.body;
      
      const [rows] = await db.promise().query('UPDATE admins SET username = ?, email = ? WHERE admins.id_admin = ?', [username, email, id]);      
      const [updatedadmin] = await db.promise().query('SELECT * FROM admins WHERE id_admin = ?', [id]);// console.log(rows);
       if (rows.length === 0 ) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { admin: updatedadmin[0],user,company});
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//--------------------------------------------------------web----------------------------------
router.get('/webpage/:id',loggedIn,async(req,res)=>{
  try{
    
    const {id} =req.params;
    
   
    const [rows] = await db.promise().query('SELECT * FROM webpage');
   const webpage =rows[0]
    res.locals.webpage = webpage;
    // console.log(res.locals.webpage)
    const [row] =await db.promise().query('SELECT * FROM admins where admins.id_admin =? ',[id]);
    
    res.render('webpage', { admin:row[0],webpage});
       
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');}
  });
  
  router.post('/editwebpage/:id', loggedIn, async (req, res) => {
    try {
     
      const [rows] = await db.promise().query('SELECT * FROM webpage');
      const webpage =rows[0]
       res.locals.webpage = webpage;
      //  console.log(res.locals.webpage.id_webpage)
       
      const { id } = req.params;
      
      const { namepage, address, email, call} = req.body;

      // Update the webpage details using the webpage ID
      const [rowq] = await db.promise().query("UPDATE webpage SET namepage = ?, address = ?, email = ?, `call` = ? WHERE id_webpage = ?",
      [namepage, address, email, call,parseInt(res.locals.webpage.id_webpage)]);
      // console.log(rowq);
      // Fetch the updated webpage data
      const [updatedWebpageRows] = await db.promise().query('SELECT * FROM webpage WHERE id_webpage = ?', [res.locals.webpage.id_webpage]);
  
      const [admin] = await db.promise().query('SELECT * FROM admins WHERE id_admin = ?', [id]);
  
      if (admin.length === 0) {
        return res.status(404).send("User not found");
      }
  
      res.render('webpage', { admin: admin[0], webpage: updatedWebpageRows[0] });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  



  



module.exports= router;