const db = require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const loggedIn = require("../controllers/loggedin");
const fs = require("fs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const { signUpValidation } = require("../controllers/validation");

const sendMail = require("../controllers/sendmail");
const path = require("path");
const ejs = require("ejs");
// Multer storage configuration
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

//ลงทะเบียน
router.post(
  "/registercompany",
  upload.single("image"),
  signUpValidation,
  async (req, res) => {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let admin;
    let user;
    let company;
    const errors = validationResult(req);
    res.locals.status = "no";
    let status = res.locals.status;
    const image = req.file ? req.file.filename : "default.png";
    const {
      username,
      password: Npassword,
      name_company,
      type_company,
      namecontact_company,
      address_company,
      province_company,
      county_company,
      district_company,
      zipcode_company,
      amphoe,
      tell_company,
      email,
    } = req.body;
    if (!email || !Npassword || errors.isEmpty()) {
      return res
        .status(401)
        .json({
          status: "error",
          error: "Please enter your email and password",
        });
    } else {
      db.query(
        "SELECT email FROM companies WHERE email = ?",
        [email],
        async (err, result) => {
          if (err) throw err;
          if (result[0]) {
            return res.json({
              status: "error",
              error: "Email has already been registered",
            });
          } else {
            try {
              // Hashing the password
              const password = await bcrypt.hash(Npassword, 8);

              db.query(
                "INSERT INTO companies SET ?",
                {
                  username: username,
                  password: password,
                  name_company: name_company,
                  type_company: type_company,
                  namecontact_company: namecontact_company,
                  address_company: address_company,
                  province_company: province_company,
                  county_company: county_company,
                  district_company: district_company,
                  zipcode_company: zipcode_company,
                  tell_company: tell_company,
                  amphoe:amphoe,
                  email: email,
                  image: image,
                },
                async (error, result) => {
                  if (error) {
                    console.log("Insert company error");
                    throw error;
                  }
                  const verificationToken = crypto
                    .randomBytes(20)
                    .toString("hex");
                  let mailSubjects = "Mail Verification";

                  const content =
                    "http://localhost:5000/company/verify?token= " +
                    verificationToken;
                  const TemplatePath = path.join( __dirname,
                    "../views/email.ejs"
                  );
                  const data = await ejs.renderFile(TemplatePath, { content });
                  console.log(" send data: ", data);
                  await sendMail(req.body.email, mailSubjects, data);
                  await db
                    .promise()
                    .query(
                      "UPDATE companies set token=? where email=? ",
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
              console.log("Internal server error");
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

router.get("/verify", async (req, res) => {
  try {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
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
      "SELECT * FROM `companies` WHERE `token` = ? limit 1",
      [token],
      async (err, result) => {
        if (err) {
          console.error("Error querying the database:", err);
          return res.status(500).send("Internal Server Error");
        }

        // console.log('Query result:', result);

        if (result.length > 0) {
          const companyId = result[0].id_company; // Assuming 'id' is the correct column name
          // console.log(userId);
          //คิดว่าต้องpost เลยมีความคิดว่าทำเป้นไฟล์แยกน่าจะง่ายกว่าเพราะมีการเรียกใช้ทั้งการgetและpost
          db.query(
            "UPDATE companies SET token = null, verified = 1 WHERE id_company = ?",
            [companyId],
            async (error, updateResult) => {
              if (error) {
                console.error("Error updating the user:", error);
                return res.status(500).send("Internal Server Error");
              }

              console.log("Update result:", updateResult);
              return res.render("login", { user, company, admin ,webpage});
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

router.get("/resetpassword/:id", loggedIn, async (req, res) => {
  try {
    let company;
    let admin;
    let user;
    const { id } = req.params;
    // console.log(email);

    const [rows] = await db
      .promise()
      .query("SELECT * FROM companies  where companies.id_company = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }
    return res.render("resetpassword", { user, company: rows[0], admin });
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
    const { email } = req.params;

    db.query(
      "SELECT * FROM companies  where companies.email = ?",
      [email],
      async (error, result) => {
        if (error) {
          console.log("insert user error");
          throw error;
        }
        const otp_before = Math.floor(1000 + Math.random() * 9000);
        const otp = otp_before.toString();

        let mailSubjects = "resetpassword";
        const content = result[0].id_company;
        console.log(content);

        const TemplatePath = path.join(
          __dirname,
          "../views/resetpasscompany.ejs"
        );
        const data = await ejs.renderFile(TemplatePath, { otp, content });

        await sendMail(req.body.email, mailSubjects, data);
        console.log("after send repass", req.body.email);
        await db
          .promise()
          .query(
            "UPDATE companies SET  token = ? where companies.email = ?",
            [otp, email],
            async (error, result) => {
              if (error) {
                console.log("insert user error");
                throw error;
              }
            }
          );
        return res.render("emailverify", { user, company: result[0], admin });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/changepassword/:id", async (req, res) => {
  let company;
  let admin;
  let status = res.locals.status;
  let { id } = req.params;
  // console.log(id)
  const [rows] = await db
    .promise()
    .query("SELECT * FROM companies  where companies.id_company = ?", [id]);
  // console.log(res.locals.status);
  // console.log(status);

  return res.render("changepassword", {
    company: rows[0],
    user,
    admin,
    status,
  });
});

router.post("/changepassword/:id", loggedIn, async (req, res, next) => {
  try {

    const { id } = req.params;
    const token = req.body.otp;
    console.log("token: " + token);
    console.log("id: " + id);
    const [rows] = await db
      .promise()
      .query(
        "SELECT * FROM companies  where companies.token = ? and companies.id_company",
        [token, id]
      );
    if (rows) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      // console.log("password: " + password);
      // console.log("newPassword: " + newPassword);
      await db
        .promise()
        .query(
          "UPDATE companies SET  password  = ? where companies.token = ?",
          [newPassword, token]
        );

      await db
        .promise()
        .query(
          "UPDATE companies SET  token  = null  where companies.token = ?",
          [token]
        );

      console.log("resetToken: " + token);
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

//--------------------------------------------- profile------------------------------------------------------

//แสดงโปรไฟล์
router.get("/profile/:id", loggedIn, async (req, res) => {
  try {
    let user;
    let admin;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;

    const [rows] = await db
      .promise()
      .query("SELECT * FROM companies  where id_company = ?", [id]);

    console.log(rows[0].image);
    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.render("profilecompany", { company: rows[0], user, admin ,webpage});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//อัพเดตโปรไฟล์
router.post("/updateprofile/:id",upload.single("image"), loggedIn, async (req, res) => {
  try {
    let user;
    let admin;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;
    const [row] = await db.promise().query("SELECT * FROM companies WHERE id_company = ?", [id]);
    const { username, email } = req.body;

    const image = req.file ? req.file.filename : row[0].image;
    console.log(image)
    const [rows] = await db.promise().query("UPDATE companies SET username = ?, email = ? ,image =? WHERE id_company = ?",[username, email,image, id]);
    const [upCompany] = await db.promise().query("SELECT * FROM companies WHERE id_company = ?", [id]); 
    console.log(upCompany[0]);
  
    if (upCompany.length === 0) {
      return res.status(404).send("companies not found");
    }

    res.render("profile", { company: upCompany[0], user, admin,webpage });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//-----------------------------------------------------------job-------------------------------

//เพิ่มเส้จไปหน้าjoball
//ได้แล้วเพิ่มต้องแก้นิดหน่อย
router.get("/addjob_company/:id", loggedIn, async (req, res) => {
  try {
    let user;
    let admin;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;
    console.log(id)

    const [rows] = await db
      .promise()
      .query("SELECT * FROM companies  where companies.id_company = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.render("addjob", { company: rows[0], user, admin,webpage });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//ได้แล้ว
router.post("/addjob_company/:id", loggedIn, async (req, res) => {
  try {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let admin;
    const { id } = req.params;
    console.log(id);
    // let [company]=await db.promise().query("SELECT * FROM companies where id_company = ? ",[id]);

    const {
      name_job,
      role,
      detail_work,
      experience,
      gender,
      education,
      welfare,
      salary,
      workday,
      day_off,
      deadline_offer,
    } = req.body;

     await db.promise().query("INSERT INTO job_company SET ?", {
        name_job: name_job,
        role: role,
        detail_work: detail_work,
        experience: experience,
        gender: gender,
        education: education,
        welfare: welfare,
        salary: salary,
        workday: workday,
        day_off: day_off,
        deadline_offer: deadline_offer,
        id_company: id,
      });
      const [row] = await db
      .promise()
      .query("SELECT * FROM job_company  where job_company.id_company = ?", [id]);

    const [updatedCompany] = await db
      .promise()
      .query("SELECT * FROM companies  where id_company = ?", [id]);

    if (updatedCompany.length === 0) {
      return res.status(404).send("User not found");
    }
    res.redirect(`/company/joball/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



//ปุ้มปิดงาน

router.post("/banjob/:id", loggedIn, async(req,res) =>{
  try{
    let id  = req.body.id;
    
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    
    let admin ;
    let user ;
    
    await db.promise().execute('UPDATE job_company SET statusjob = ? WHERE idjob_company = ?', ['banned', id]);
    
  // console.log(`User with ID ${id} has been banned.`);
  const currentURL =req.get("Referer")
    res.redirect(currentURL);
}
catch (error) {
  console.error('Error banning user:', error);
}
});
  

router.post("/unbanjob/:id", loggedIn, async(req,res) =>{
  try{
    let id  = req.params.id;
    let admin ;
    let user ;
   
    await db.promise().execute('UPDATE job_company SET statusjob = ? WHERE idjob_company = ?', ['active', id]);
  // console.log(`User with ID ${id} has been unbanned.`);
  const currentURL =req.get("Referer")
  res.redirect(currentURL);
}
catch (error) {
  console.error('Error banning user:', error);
}
  
});
//ได้แล้ว
router.get("/joball/:id", loggedIn, async (req, res) => {
  try {
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let admin;
    const { id } = req.params;
    // console.log(id);
    const [row] = await db.promise().query("SELECT * FROM companies  where id_company = ?", [id]);
// console.log(row)
    const [rows] = await db.promise().query("SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.id_company = ?",[id]);
    // console.log(rows)
    if (rows.length === 0) {
      res.redirect(`/company/addjob_company/${id}`);
    
    }else {

      res.render("jobgetall", { company: row[0], job: rows, user, admin ,webpage});
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//////เหลือ Updateที่ยังไม่ได้
///////
router.get("/updatejob_company/:id", loggedIn, async (req, res) => {
  try {
    let company;
    let user;
    let admin ;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;
    // const [row] = await db.promise().query("SELECT * FROM companies  where id_company = ?", [id]);
//i want to id_company
    const [rows] = await db.promise().query("SELECT *,DATE_FORMAT(deadline_offer, '%Y-%m-%dT%H:%i')as deadline_offer FROM job_company  INNER JOIN companies ON job_company.id_company = companies.id_company where job_company.idjob_company = ?",
        [id]
      );
      // console.log(rows[0].id_company);
      

    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.render("updatejob", { company: rows[0], job: rows[0] ,webpage,user,admin});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/updatejob_company/:id/", loggedIn, async (req, res) => {
  try {
    let company;
    let admin;
    let user;
    let [webpage] = await db.promise().query("SELECT * FROM webpage ");
    const { id } = req.params;
    
    const [rows] = await db.promise().query("SELECT * FROM job_company INNER JOIN companies ON companies.id_company = job_company.id_company WHERE job_company.idjob_company = ?", [id]);
    const [row] =await db.promise().query("SELECT * FROM companies where id_company = ?",[rows[0].id_company]);
  
    const {
      name_job,
      role,
      detail_work,
      experience,
      gender,
      education,
      welfare,
      salary,
      workday,
      day_off,
      deadline_offer,
    } = req.body;

    await db.promise().query("UPDATE job_company SET name_job = ?, role = ?, detail_work = ?, experience = ?, gender = ?, education = ?, welfare = ?, salary = ?, workday = ?, day_off = ?, deadline_offer = ? WHERE job_company.idjob_company = ?",
        [
          name_job,
          role,
          detail_work,
          experience,
          gender,
          education,
          welfare,
          salary,
          workday,
          day_off,
          deadline_offer,
          id,
          
        ]
      );


    if (rows[0].length === 0) {
      return res.status(404).send("User not found");
    }
const currentURL =req.get("Referer")
    res.redirect(currentURL);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

///เจาะจงงานในหน้าindex ปันหาคือทำไงให้ค่าของหน้าindexส่งมาเช่นค่าของactor navberมีปันหา
//เอาค่าในlocalมาใช้

router.get("/jobbyidjob/:id", loggedIn, async (req, res) => {
  try {
    let user = res.locals.users;
    // console.log(user);
    let admin = res.locals.admins;
    let company = res.locals.companys;
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");

    const { id } = req.params;

    const [rows] = await db
      .promise()
      .query(
        "SELECT * FROM job_company  inner join companies  on job_company.id_company = companies.id_company where  job_company.idjob_company = ?",
        [id]
      );

    // const [Company] =await db.promise().query('SELECT * FROM companies where id_company =?',[id] );
    // console.log(rows[0]);
    // console.log(id_company);
    if (rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.render("detailjob", { company, job: rows[0], user, admin ,webpage});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//---------------------------------------------- ค้นหา-------------------------------------------------
//ยังไม่ได้ทำค้นหาจิงจัง
router.post("/searchcompany", loggedIn, async (req, res) => {
  try {
    const search = req.body.searchcompany;
    console.log(search);

    let [rows] = await db
      .promise()
      .query('SELECT * FROM companies where username like "%' + search + '%"');
    console.log(rows);
    var data = [];
    for (i = 0; i < rows.length; i++) {
      data.push(rows[i]);
    }
    res.send(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// ค้นหาตำแหน่งงาน
router.post("/searchjob", loggedIn, async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        "SELECT * FROM job_company where name_job like ?",
        ["%${searchjob}%"],
        (err, result)
      );
    console.log(rows);
    // res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
