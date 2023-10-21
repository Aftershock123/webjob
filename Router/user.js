const db = require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express = require("express");
const { check,validationResult } = require("express-validator");

const crypto = require("crypto");
const router = express.Router();
const loggedIn = require("../controllers/loggedin");
const multer = require("multer");
const sendMail = require("../controllers/sendmail");
const generatePDF = require("../controllers/generatePDF");
const path = require("path");
const ejs = require("ejs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image/");
  },
  filename: function (req, file, cb) {
    const image = file ? `${Date.now() + file.originalname}` : "default.png";
    cb(null, image);
  },
});
const filefilter = (req, file, cb) => {
  file.mimetype == "image/jpeg" || file.mimetype == "image/png"
    ? cb(null, true)
    : cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: filefilter });
//////////////////////// -----------------------------------------------------register----------------------------------------------------------------------------------////////////////////////////////////////

router.post(
  "/registeruser",
  upload.single("image"),
  [
    check("email", "กรุณาป้อน Email").isEmail(),
    check("password")
      .notEmpty()
      .withMessage("กรุณาป้อน Password")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Password ต้องมีอย่างน้อย 8 ตัวอักษร")
      .bail()
      .isLength({ max: 120 })
      .withMessage("Password ต้องไม่เกิน 120 ตัวอักษร"),

    check("username", "กรุณาป้อน Username").not().isEmpty(),
    check("confirmpassword")
    .notEmpty()
    .withMessage("กรุณาป้อน Confirm Password")
    .custom((value, { req }) => {
      if (value === req.body.password) {
        return true;
      }
      return false;
    })
    .withMessage("Confirm Password ไม่ถูกต้อง"),
  ],
  async (req, res, err) => {
    let company;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let admin;
    let user;
    res.locals.status = "no";
    let status = res.locals.status;
    const result = validationResult(req);
    const errors = result.array();

    const image = req.file ? req.file.filename : "default.png";
    const { username,  password: Npassword } = req.body;
const email =req.body.email;
    console.log("Image:", email);
    
      

    if (!email || !Npassword || !result.isEmpty()) {
      
      const referer = req.headers.referer;
      const viewName = referer.substring(referer.lastIndexOf("/") + 1);
    console.log(referer);
     return res.render(viewName, {
       errors: errors,
       webpage,
       
     });

    } else {
      db.query(
        "SELECT email FROM users WHERE email = ?",
        [email],
        async (err, result) => {
          if (err) throw err;
          if (result && result.length) {
            return res.status(400).json({
              status: "error",
              error: "Email has already been registered",
            });
          } else {
            try {
              const password = await bcrypt.hash(Npassword, 8);
              db.query(
                "INSERT INTO users SET ?",
                {
                  username: username,
                  email: email,
                  password: password,
                  image: image,
                },
                async (error, results) => {
                  if (error) {
                    console.log("insert user error");
                    throw error;
                  }
                  const verificationToken = crypto
                    .randomBytes(20)
                    .toString("hex");
                  let mailSubjects = "Mail Verification";

                  const content =
                    "http://localhost:5000/user/verify?token= " +
                    verificationToken;

                  const TemplatePath = path.join(
                    __dirname,
                    "../views/email.ejs"
                  );
                  const data = await ejs.renderFile(TemplatePath, { content });
                  // console.log(" send data: ", data);
                  await sendMail(req.body.email, mailSubjects, data);
                  await db
                    .promise()
                    .query(
                      "UPDATE users set token=? where email=? ",
                      [verificationToken, req.body.email],
                      async (error, result) => {
                        if (error) {
                          console.log("insert user error");
                          throw error;
                        }
                      }
                    );
                  res.redirect("/emailverify");
                }
              );
            } catch (error) {
              console.log(error);
              return res
                .status(500)
                .json({ status: "error", error: "Internal server error" });
            }
          }
        }
      );
    }
  }
);
//////////////////////// -----------------------------------------------------verify----------------------------------------------------------------------------------////////////////////////////////////////

router.get("/verify", async (req, res) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let company;
    let admin;
    res.locals.status = "no";
    let status = res.locals.status;
    // console.log('Request object:', req);
    // console.log('Request URL:', req.url);
    // console.log('Parsed Query Parameters:', req.query);
    const token = req.query.token.trim();
    // console.log('Token from request:', token);
    // console.log('Token length:', token.length);

    db.query(
      "SELECT * FROM `users` WHERE `token` = ? limit 1",
      [token],
      async (err, result) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).send("Internal Server Error");
        }
        // console.log('Query result:', result);
        if (result.length > 0) {
          const userId = result[0].id_user; // Assuming 'id' is the correct column name
          // console.log(userId);
          //คิดว่าต้องpost เลยมีความคิดว่าทำเป้นไฟล์แยกน่าจะง่ายกว่าเพราะมีการเรียกใช้ทั้งการgetและpost
          db.query(
            "UPDATE users SET token = null, verified = 1 WHERE id_user = ?",
            [userId],
            async (error, updateResult) => {
              if (error) {
                console.error("Error updating the user:", error);
                return res.status(500).send("Internal Server Error");
              }

              // console.log("Update result:", updateResult);
              return res.render("login", { user, company, admin, webpage });
            }
          );
        } else {
          console.log("No matching user found for the token.");
          return res.render("404");
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//////////////////////////////////-------------------------------------------------profile---------------------------------------/////////////////////////////////////////
//ได้แล้ว
router.get(
  "/profile/:id",
  loggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let company;
      let admin;
      let history;
      let resume;
      const { id } = req.params;

      let [webpage] = await db.promise().query("SELECT * FROM webpage ");

      const [rows] = await db
        .promise()
        .query("SELECT * FROM users  where id_user = ?", [id]);
      // console.log(rows);
      const [row] = await db
        .promise()
        .query("SELECT * FROM resume where resume.id_user = ?", [id]);
      // console.log(row);

      if (row.length < 1) {
        res.render("profile", {
          user: rows[0],
          company,
          admin,
          webpage,
          resume,
          history,
        });
      } else {
        let [webpage] = await db.promise().query("SELECT * FROM webpage ");

        const [row] = await db
          .promise()
          .query("SELECT * FROM users  where id_user = ?", [id]);
        // console.log("user: ", row);
        const [rows] = await db
          .promise()
          .query("SELECT * FROM resume where resume.id_user = ?", [id]);
        //  console.log("resume: ", rows);
        const [row1] = await db
          .promise()
          .query("SELECT * FROM historyuser where historyuser.id_resume = ? ", [
            rows[0].id_resume,
          ]);
        // console.log("history: ", row1);

        const [row2] = await db
          .promise()
          .query(
            "SELECT * FROM job_company inner join companies on job_company.id_company = companies.id_company  inner join historyuser on job_company.idjob_company = historyuser.idjob_company where historyuser.id_resume = ? ",
            [rows[0].id_resume]
          );
        //   console.log("job:" ,[rows[0].id_resume]);
        console.log("job:" ,[row2]);

        return res.render("profile", {
          user: row[0],
          company,
          admin,
          webpage,
          resume: row[0],
          history: row2,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/jobsended/:id",
  loggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let company;
      let admin;
      let history;
      let resume;
      const { id } = req.params;

      let [webpage] = await db.promise().query("SELECT * FROM webpage ");

      const [rows] = await db
        .promise()
        .query("SELECT * FROM users  where id_user = ?", [id]);
      // console.log(rows);
      const [row] = await db
        .promise()
        .query("SELECT * FROM resume where resume.id_user = ?", [id]);
      // console.log(row);

      if (row.length < 1) {
        res.render("profile", {
          user: rows[0],
          company,
          admin,
          webpage,
          resume,
          history,
        });
      } else {
        let [webpage] = await db.promise().query("SELECT * FROM webpage ");

        const [row] = await db
          .promise()
          .query("SELECT * FROM users  where id_user = ?", [id]);
        // console.log("user: ", row);
        const [rows] = await db
          .promise()
          .query("SELECT * FROM resume where resume.id_user = ?", [id]);
        //  console.log("resume: ", rows);
        const [row1] = await db
          .promise()
          .query("SELECT * FROM historyuser where historyuser.id_resume = ? ", [
            rows[0].id_resume,
          ]);
        // console.log("history: ", row1);

        const [row2] = await db
          .promise()
          .query(
            "SELECT * FROM job_company inner join companies on job_company.id_company = companies.id_company  inner join historyuser on job_company.idjob_company = historyuser.idjob_company where historyuser.id_resume = ? ",
            [rows[0].id_resume]
          );
        //   console.log("job:" ,[rows[0].id_resume]);
        console.log("job:", [row2]);

        return res.render("jobsended", {
          user: row[0],
          company,
          admin,
          webpage,
          resume: row[0],
          history: row2,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);
//ได้แล้ว
router.post(
  "/updateprofile/:id",
  loggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let company;
      let admin;
      let history;
      let resume;
      let [webpage] = await db.promise().query("SELECT * FROM webpage ");
      const { id } = req.params;
      const [row1] = await db
        .promise()
        .query("SELECT * FROM users  where id_user = ?", [id]);
      const { username, email } = req.body;
      const image = req.file ? req.file.filename : row1[0].image;
      const [rows] = await db
        .promise()
        .query(
          "UPDATE users SET username = ?, email = ? ,image =? WHERE id_user = ?",
          [username, email, image, id]
        );

      if (row1.length < 1) {
        return res.status(404).send("User not found");
      }
      let [row3] = await db
        .promise()
        .query("SELECT * FROM resume where resume.id_user = ?", [id]);

      if (row3.length < 1) {
        const currentURL = req.get("Referer");
        res.redirect(currentURL);
      }
      const currentURL = req.get("Referer");
        res.redirect(currentURL);
    } catch (error) {
      // res.render("profile", { user: row2[0], company, admin, webpage });
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

///////////////////////////////////----------------------------------------------------resume-------------------------------------//////////////////
//รวมหน้าaddresume กับupdateresume
//ได้แล้ว
router.get("/addresume/:id", loggedIn, async (req, res) => {
  try {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let company;
    let admin;
    // const errors = req.query.errors ? JSON.parse(req.query.errors) : [];
    const { id } = req.params;

    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE id_user = ?", [id]);

    // Fetch resume data
    const [resumeRows] = await db
      .promise()
      .query("SELECT * FROM resume WHERE id_user = ?", [id]);

    // Check if resume data exists
    const resume = resumeRows.length > 0 ? resumeRows[0] : null;

    res.render("resume", {
      user: rows[0],
      resume: resumeRows[0],
      company,
      admin,
      webpage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//ได้แล้ว
router.post("/addresume/:id", loggedIn,[
  check("professional_summary", "กรุณาป้อน professional_summary").not().isEmpty(),
  check("work_experience", "กรุณาป้อน work_experience").not().isEmpty(),
  check("skills", "กรุณาป้อน skills").not().isEmpty(),
  check("education", "กรุณาป้อน education").not().isEmpty(),

  check("languages", "กรุณาป้อน languages").not().isEmpty(),
  check("interests", "กรุณาป้อน interests").not().isEmpty(),
  check("contact", "กรุณาป้อน contact").not().isEmpty(),
  
], async (req, res) => {
  try {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let company;
    let admin;
    const result = validationResult(req);
    const errors = result.array();
    const { id } = req.params;

    const {
      professional_summary,
      work_experience,
      skills,
      education,
      languages,
      interests,
      contact,
    } = req.body;

    if(!result.isEmpty()){
      const referer = req.headers.referer;
      const viewName = referer.substring(referer.lastIndexOf("/") + 1);
    console.log(referer);
    console.log(viewName);
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE id_user = ?", [id]);

    // Fetch resume data
    const [resumeRows] = await db
      .promise()
      .query("SELECT * FROM resume WHERE id_user = ?", [id]);

  
    res.render("resume", {
      user: rows[0],
      resume: resumeRows[0],
      company,
      admin,
      webpage,errors
    });

    }else{

      await db.promise().query("INSERT INTO resume SET ?", {
        professional_summary: professional_summary,
        work_experience: work_experience,
        skills: skills,
        education: education,
        languages: languages,
        interests: interests,
        contact: contact,
        id_user: id,
      });
  
      const [rows] = await db
        .promise()
        .query("SELECT * FROM users where users.id_user = ?", [id]);
      const [row] = await db
        .promise()
        .query(
          "SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?",
          [id]
        );
  
      if (rows.length === 0) {
        return res.status(404).send("User not found");
      }
      // /updateresume/:id
      res.render("resume", {
        user: rows[0],
        resume: row[0],
        company,
        admin,
        webpage,
      });
    }

    // res.redirect(`/updateresume/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//ไม่โชว์ข้อมูลล่าสุดที่เพิ่ม
//เพิ่มแล้วลบอันเก่าออกเลย ยังไม่ได้ทำแค่คิดเฉยๆแก้ปันหาเพิ่มแล้วค่าล่าสุดไม่มา

//ได้แล้ว
router.post("/updateresume/:id", loggedIn, async (req, res) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let company;
    let admin;

    const { id } = req.params;

    const {
      professional_summary,
      work_experience,
      skills,
      education,
      languages,
      interests,
      contact,
    } = req.body;
    const [row1] = await db
      .promise()
      .query("SELECT * FROM users WHERE id_user = ?", [id]);
    const [rows] = await db
      .promise()
      .query(
        "UPDATE resume SET professional_summary = ?, work_experience = ?, skills = ?, education = ?, languages = ?, interests = ?, contact = ? WHERE resume.id_user = ?",
        [
          professional_summary,
          work_experience,
          skills,
          education,
          languages,
          interests,
          contact,
          id,
        ]
      );
    const [row] = await db
      .promise()
      .query(
        "SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?",
        [id]
      );

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }
    // res.redirect(`/user/updateresume/${id}` );
    res.render("resume", {
      user: row1[0],
      resume: row[0],
      company,
      admin,
      webpage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//////////////////////// -----------------------------------------------------resetpassword----------------------------------------------------------------------------------////////////////////////////////////////

router.get("/resetpassword/:id", loggedIn, async (req, res) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let company;
    let admin;
    let user;
    const { id } = req.params;
    // console.log(email);

    const [rows] = await db
      .promise()
      .query("SELECT * FROM users  where users.id_user = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }
    return res.render("resetpassword", {
      user: rows[0],
      company,
      admin,
      webpage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/resetpassword/:email", loggedIn, async (req, res) => {
  try {
    let company;
    let admin;
    let user;
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { email } = req.params;

    db.query(
      "SELECT * FROM users  where users.email = ?",
      [email],
      async (error, result) => {
        if (error) {
          console.log("insert user error");
          throw error;
        }
        const otp_before = Math.floor(1000 + Math.random() * 9000);
        const otp = otp_before.toString();

        let mailSubjects = "resetpassword";
        const content = result[0].id_user;
        // console.log(content);

        const TemplatePath = path.join(__dirname, "../views/resetpass.ejs");
        const data = await ejs.renderFile(TemplatePath, { otp, content });

        await sendMail(req.body.email, mailSubjects, data);
        // console.log("after send repass", req.body.email);
        await db
          .promise()
          .query(
            "UPDATE users SET  token = ? where users.email = ?",
            [otp, email],
            async (error, result) => {
              if (error) {
                console.log("insert user error");
                throw error;
              }
            }
          );
        return res.render("emailtext", {
          user: result[0],
          company,
          admin,
          webpage,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/changepassword/:id", async (req, res) => {
  let webpage;
  [webpage] = await db.promise().query("SELECT * FROM webpage ");
  let company;
  let admin;
  let status = res.locals.status;
  let { id } = req.params;
  // console.log(id)
  const [rows] = await db
    .promise()
    .query("SELECT * FROM users  where users.id_user = ?", [id]);
  // console.log(res.locals.status);
  // console.log(status);

  return res.render("changepassword", {
    company,
    user: rows[0],
    admin,
    status,
    webpage,
  });
});

router.post("/changepassword/:id", loggedIn, async (req, res, next) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;
    const token = req.body.otp;
    // console.log("token: " + token);
    // console.log("id: " + id);
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users  where users.token = ? and users.id_user", [
        token,
        id,
      ]);
    if (rows) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      // console.log("password: " + password);
      // console.log("newPassword: " + newPassword);
      await db
        .promise()
        .query("UPDATE users SET  password  = ? where users.token = ?", [
          newPassword,
          token,
        ]);

      await db
        .promise()
        .query("UPDATE users SET  token  = null  where users.token = ?", [
          token,
        ]);

      // console.log("resetToken: " + token);
      res.redirect("/login");
    } else {
      res.render("changepassword", {
        errors: "OTP ไม่ถูกต้อง",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//userid
//////////////////////// -----------------------------------------------------pdf----------------------------------------------------------------------------------////////////////////////////////////////

router.get("/pdf/:id", loggedIn, async (req, res) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let admin;
    const { id } = req.params;
    //ได้ค่าcompanyid เพื่อหาjobid
    // const {name_job,role,detail_work,experience,gender,education,welfare,salary,workday,day_off,deadline_offer}= req.body;

    const [resume] = await db
      .promise()
      .query(
        "SELECT * FROM resume  INNER JOIN users ON resume.id_user = users.id_user where resume.id_user = ?",
        [id]
      );
    const [historyuser] = await db
      .promise()
      .query("SELECT * FROM historyuser ");

    if (resume.length > 0) {
      return res.status(404).send("User not found");
    }
    // console.log(resume[0]);
    let mailSubject = "Resume" + resume.username;

    let [content] = resume[0];
    let [content1] = historyuser[0];
    generatePDF(req.body.email, mailSubject, content, content1);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/apply/:userId/:jobId", loggedIn, 
   async (req, res) => {
  try {
    const result = validationResult(req);
    const errors = result.array();

    const userId = req.params.userId; // Extract the user ID
    const jobId = req.params.jobId; // Extract the order ID
    let company;
    let admin;
    let user;
    let webpage;
    let history;
    let resume;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    // console.log(userId); //128
    // console.log(jobId); //14
    const [rows] = await db
      .promise()
      .query(
        "SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.idjob_company = ?",
        [jobId]
      );
    // console.log(rows[0].id_company);
    // console.log("rows");
    
    let emailcom = rows[0].id_company;

    const [row] = await db
      .promise()
      .query(
        "SELECT * FROM resume  inner join users  on resume.id_user = users.id_user where  resume.id_user = ?",
        [userId]
      );
    // console.log(row);
    // console.log("row");
    // console.log( row[0].id_resume);//11

    db.query("INSERT INTO historyuser SET ?", {
      id_resume: row[0].id_resume,
      idjob_company: jobId,
    });
    const [rowss] = await db
      .promise()
      .query("SELECT * FROM historyuser   where  historyuser.id_resume = ?", [
        row[0].id_resume,
      ]);

    // console.log(rowss);
    let mailSubjects = "resume";
    const content = row;
    // console.log("ssssssssssssssssssssssssssssssssssssss",content[0]);
    // console.log("content");
    const name = content[0].username;
    let email = row[0].email;
    // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    const TemplatePath = path.join(__dirname, "../views/pdfemail.ejs");
    const data = await ejs.renderFile(TemplatePath, { content });
    // console.log(content[0].id_resume);
    // console.log(data);
    ///emailcom จริงๆไม่ต้องใช้emailก็ได้ที่ใช้เพราะเช็คค่า
    await generatePDF(email, mailSubjects, data, name, emailcom);
    let [roww] = await db
      .promise()
      .query(
        "SELECT * FROM users WHERE users.id_user = ? ",
        [userId],
        async (error, result) => {
          if (error) {
            console.log("insert user error");
            throw error;
          }
        }
      );
      let id=userId;
    // res.redirect(`/user/profile/${id}`)
    return res.status(200).json({ status: "success" });
    // res.render("profile", {
    //   user: roww[0],
    //   company,
    //   admin,
    //   webpage,
    //   resume: row,
    //   history: rowss,
    // });
    //เรียกใช้router.get profile
  } catch (error) {
    console.log("Internal server error");
    return res
      .status(500)
      .json({ status: "error", error: "Please add resume" });

    //    const referer = req.headers.referer;
    //   const viewName = referer.substring(referer.lastIndexOf("/") + 1);
    // console.log(referer);
    //  return res.render(viewName, {
    //    errors: errors,
    //    webpage,
       
    //  });
  }
});

module.exports = router;
