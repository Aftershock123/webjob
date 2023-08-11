// const jwt = require("jsonwebtoken");
// const db = require("../Router/db-config");
// const bcrypt = require("bcryptjs");
// const express = require("express");
// const router = express.Router();

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ status: "error", error: "Please enter your email and password" });
//   } else {
//       db.query("SELECT * FROM users WHERE email = ?",[email],async (err,result,user) => {
//          if(result.length >0) {
//           // Logging the password before hashing
//           // console.log(email);
//           // console.log(result[0]);
//           // Generating JWT token
//           const token = jwt.sign(
//             { id_user: result[0].id_user},process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRES,}
//           );
        
//           const cookieOptions = {
//             expires: new Date(Date.now() +process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//             httpOnly: true,
//           };
        
//           res.cookie("userRegistered", token, cookieOptions);
//           return res.status(200).redirect("/");
//         }
//          else if (user = []) {
//             db.query("SELECT * FROM companys WHERE email = ?",[email],async (err,result,company) => {
//               if(result.length >0) {
//                 // Logging the password before hashing
//                 console.log(email);
//           console.log(result[0]);
              
//                 // Generating JWT token
//                 const token = jwt.sign(
//                   { id_company: result[0].id_company},process.env.JWT_SECRET,
//                   { expiresIn: process.env.JWT_EXPIRES,}
//                 );
              
//                 const cookieOptions = {
//                   expires: new Date(Date.now() +process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//                   httpOnly: true,
//                 };
              
//                 res.cookie("userRegistered", token, cookieOptions);
//                 return res.status(200).redirect("/");
//               }

//               else if (company = []) {
//                 db.query("SELECT * FROM admins WHERE email = ?",[email],async (err,result) => {
//                   if(result.length >0) {
//                     // Logging the password before hashing
//                     console.log(email);
//           console.log(result[0]);
                  
//                     // Generating JWT token
//                     const token = jwt.sign(
//                       { id_admin: result[0].id_admin},process.env.JWT_SECRET,
//                       { expiresIn: process.env.JWT_EXPIRES,}
//                     );
                  
//                     const cookieOptions = {
//                       expires: new Date(Date.now() +process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
//                       httpOnly: true,
//                     };
                  
//                     res.cookie("userRegistered", token, cookieOptions);
//                     return res.status(200).redirect("/");
//                   }
//                   else if (!result.length ||!(await bcrypt.compare(password, result[0].password))) {
//                     return res.json({status: "error",error: "Incorrect email or password",});
//                   }
//                       }
//                         )
//                               }
//                   }
//                     )
//                         }

//     //quryuser
//         }
//  ) 



//  //else}
//       }
//   }
// );
// module.exports = router;

const jwt = require("jsonwebtoken");
const db = require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ status: "error", error: "Please enter your email and password" });
  } else {
            // Query users
            db.query("SELECT * FROM users WHERE email = ?", [email], async (err, usersResult) => {
                if (err) {
                  console.error('Database query error:', err);
                  return res.status(500).json({ status: "error", error: "Database error" });
                }

                if(usersResult.length > 0) {
                  const user = usersResult[0];
              
                  console.log("usersResult");
                  
                  if (!(await bcrypt.compare(password, user.password))) {
                    return res.json({ status: "error", error: "Incorrect user email or password" });
                  }

                  const token = jwt.sign(
                  { id_user: user.id_user },
                  process.env.JWT_SECRET,
                  { expiresIn: process.env.JWT_EXPIRES }
                  );
                
                  const cookieOptions = {
                  expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                  httpOnly: true,
                  };
                  res.cookie("userRegistered", token, cookieOptions);
                  return res.status(200).redirect("/");
                } 
              });

            if(usersResult=[]){
              // Query companies
              // console.log(usersResult);
              db.query("SELECT * FROM companys WHERE email = ?", [email], async (err, companiesResult) => {
                if (err) {
                  console.error('Database query error:', err);
                  return res.status(500).json({ status: "error", error: "Database error" });
                }
                // console.log(companiesResult);
                
                if (companiesResult.length>0) {
                  // console.log("companiesResult");
                    const company = companiesResult[0];
                    // console.log(password);
                    // console.log( company.password);
                    console.log(!(await bcrypt.compare(password, company.password)));//f
                    if (!(await bcrypt.compare(password, company.password))) {
                      return res.json({ status: "error", error: "Incorrect company email or password" });
                    }

                    const token = jwt.sign(
                      { id_company: company.id_company },
                      process.env.JWT_SECRET,
                      { expiresIn: process.env.JWT_EXPIRES }
                    );
                
                    const cookieOptions = {
                      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                      httpOnly: true,
                    };
                
                    res.cookie("userRegistered", token, cookieOptions);
                    return res.status(200).redirect("/");
                  }
              });
            } 



            if(companiesResult =[]){
              // Query admins
              db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, adminsResult) => {
                if (err) {
                  console.error('Database query error:', err);
                  return res.status(500).json({ status: "error", error: "Database error" });
                }
                // console.log("adsadadsasfdasfd");
                // console.log(companiesResult);
                // console.log(adminsResult);
                if (adminsResult.length > 0) {
                  const admin = adminsResult[0];
                  
                  // console.log(!(await bcrypt.compare(password,admin.password)));//f
                  // console.log((await bcrypt.compare(password,admin.password)));//t
                  if (!(await bcrypt.compare(password, admin.password))) {
                    return res.json({ status: "error", error: "Incorrect admin email or password" });
                  }

                    const token = jwt.sign(
                    { id_admin: admin.id_admin },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES }
                    );
                
                    const cookieOptions = {
                    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                    };
                      
                    res.cookie("userRegistered", token, cookieOptions);
                    return res.status(200).redirect("/");
                  } 
              });
            }     
            else {
              return res.json({ status: "error", error: "User not found" });
            }
                    
          }
  })

module.exports = router;






