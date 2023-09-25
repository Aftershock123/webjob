const express = require("express");
const logout = require("../controllers/logout");
const db = require("../Router/db-config");
const loggedIn = require("../controllers/loggedin");
const router = express.Router();
const nodemailer = require("nodemailer");

const sendMail = require("../controllers/sendmail");
const path = require("path");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");

router.get("/forgotpassword", async (req, res) => {
  let user;
  const [row] = await db.promise().query("SELECT * FROM users");
  res.render("forgotpassword", { user: row[0] });
});

router.get("/forget", async (req, res) => {
  let user;
  let company;

  res.render("forget", { user, company });
});

router.post("/forget/:email", loggedIn, async (req, res) => {
  try {
    let company;
    let admin;
    let user;
    const email = req.body.email;

    console.log(email);

    db.query(
      "SELECT * FROM users  where users.email = ?",
      [email],
      async (error, result) => {
        if (error) {
          console.log("insert user error");
          throw error;
        }
        if (result.length > 0) {
          const otp_before = Math.floor(1000 + Math.random() * 9000);
          const otp = otp_before.toString();

          let mailSubjects = "resetpassword";
          const content = result[0].id_user;
          console.log(content);

          const TemplatePath = path.join(__dirname, "../views/forgetreset.ejs");
          const data = await ejs.renderFile(TemplatePath, { otp, content });

          await sendMail(req.body.email, mailSubjects, data);
          console.log("after send repass", req.body.email);
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
          return res.render("emailverify", { user: result[0], company, admin });
        } else if (result.length === 0) {
          db.query(
            "SELECT * FROM companies where companies.email = ?",
            [email],
            async (error, result) => {
              const otp_before = Math.floor(1000 + Math.random() * 9000);
              const otp = otp_before.toString();

              let mailSubjects = "resetpassword";
              const content = result.id_company;
              console.log(content);

              const TemplatePath = path.join(
                __dirname,
                "../views/forgetreset.ejs"
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
              return res.render("emailverify", {
                user: result[0],
                company,
                admin,
              });
            }
          );
        } else {
          console.log("not match email");
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/forgetchangepassword/:id", async (req, res) => {
  let company;
  let admin;
  let status = res.locals.status;
  let { id } = req.params;
  // console.log(id)

  const [row] = await db
    .promise()
    .query("SELECT * FROM users  where users.id_user = ?", [id]);
  const [rows] = await db
    .promise()
    .query("SELECT * FROM companies  where companies.id_company = ?", [id]);
  // console.log(res.locals.status);
  // console.log(status);

  return res.render("forgetchangepassword", {
    company: rows[0],
    user: row[0],
    admin,
    status,
  });
});

router.post("/forgetchangepassword/:id", loggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = req.body.otp;
    console.log("token: " + token);
    console.log("id: " + id);

    db.query(
      "SELECT * FROM users  where users.token = ? and users.id_user = ?",
      [token, id],
      async (error, result) => {
        console.log("sele");
        if (result.length > 0) {
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

          console.log("resetToken: " + token);
          res.redirect("/login");
        } else if (result.length === 0) {
          await db
            .promise()
            .query(
              "SELECT * FROM companies  where companies.token = ? and companies.id_company",
              [token, id],
              async (error, result) => {
                if (result.length > 0) {
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
                }
              }
            );
        } else {
          console.log("not match email");
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", loggedIn, async (req, res) => {
  try {
    let status;
    let user;
    let company;
    let admin;
    let jobindex;
    let resumeindex;
    let adminindex;
    let companyindex;
    let userindex;

    if (res.locals.users) {
      status = "loggedIn";
      user = res.locals.users;
      // console.log(user);
      [companyindex] = await db.promise().query("SELECT * FROM companies ");
      // console.log(companyindex);
      [jobindex] = await db
        .promise()
        .query(
          'SELECT * ,DATE_FORMAT(deadline_offer, "%d-%m-%y %h:%m ")as deadline_offer FROM job_company  inner join companies  on job_company.id_company = companies.id_company '
        );
      // console.log(jobindex);
      [resumeindex] = await db.promise().query("SELECT * FROM resume ");
      // console.log(resumeindex);
    } else if (res.locals.companys) {
      status = "loggedIn";
      company = res.locals.companys;
      // console.log(company);
      [jobindex] = await db
        .promise()
        .query(
          'SELECT * ,DATE_FORMAT(deadline_offer, "%d-%m-%y %h:%m ")as deadline_offer FROM job_company  inner join companies  on job_company.id_company = companies.id_company '
        );
      // console.log(req.body.jobindex);
      [resumeindex] = await db.promise().query("SELECT * FROM resume ");
      // console.log(req.body.resumeindex);
      [userindex] = await db.promise().query("SELECT * FROM users ");
      // console.log(req.body.userindex);
      [adminindex] = await db.promise().query("SELECT * FROM admins ");
      // console.log(req.body.adminindex);
    } else if (res.locals.admins) {
      status = "loggedIn";
      admin = res.locals.admins;
      [jobindex] = await db
        .promise()
        .query(
          'SELECT * ,DATE_FORMAT(deadline_offer, "%d-%m-%y %h:%m ")as deadline_offer FROM job_company  inner join companies  on job_company.id_company = companies.id_company  '
        );
      // console.log(req.body.jobindex);
      [resumeindex] = await db.promise().query("SELECT * FROM resume ");
      // console.log(req.body.resumeindex);
      [userindex] = await db.promise().query("SELECT * FROM users ");
      // console.log(req.body.userindex);
      [companyindex] = await db.promise().query("SELECT * FROM companies ");
      // console.log(req.body.companyindex);
    } else {
      status = "no";
      user = "nothing";
      company = "nothing";
      [jobindex] = await db
        .promise()
        .query(
          'SELECT * ,DATE_FORMAT(deadline_offer, "%d-%m-%y %h:%m ")as deadline_offer FROM job_company  inner join companies  on job_company.id_company = companies.id_company   '
        );
      // console.log(req.body.jobindex);
      [resumeindex] = await db.promise().query("SELECT * FROM resume ");
      // console.log(req.body.resumeindex);
      [userindex] = await db.promise().query("SELECT * FROM users ");
      // console.log(req.body.userindex);
      [companyindex] = await db.promise().query("SELECT * FROM companies ");
      console.log(req.body.companyindex);
      [adminindex] = await db.promise().query("SELECT * FROM admins ");
      // console.log(req.body.adminindex);
    }

    res.render("index.ejs", {
      status,
      user,
      company,
      admin,
      jobindex,
      resumeindex,
      companyindex,
      userindex,
      adminindex,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", (req, res) => {
  let status;
  let user;
  let company;
  let admin;

  if (res.locals.users) {
    status = "loggedIn";
    user = res.locals.users;
    // console.log(user)
  } else if (res.locals.companys) {
    status = "loggedIn";
    company = res.locals.companys;
    // console.log(company)
  } else if (res.locals.admins) {
    status = "loggedIn";
    admin = res.locals.admins;
    // console.log(admin)
  } else {
    status = "no";
    user = "nothing";
    company = "nothing";
  }

  res.render("login", { status, user, company, admin });
});

router.get("/registeruser", (req, res) => {
  let company;
  let admin;
  res.locals.status = "no";
  let status = res.locals.status;
  // console.log(res.locals.status);
  // console.log(status);
  let user;
  return res.render("registeruser.ejs", { company, user, admin, status });
});
router.get("/registercompany", (req, res) => {
  let company;
  let admin;
  res.locals.status = "no";
  let status = res.locals.status;
  let user;
  // console.log(res.locals.status);
  // console.log(status);

  return res.render("registercompany", company, user, admin, status);
});
router.get("/registeradmin", (req, res) => {
  let company;
  let admin;
  res.locals.status = "no";
  let status = res.locals.status;
  let user;
  return res.render("registeradmin", company, user, admin, status);
});

router.get("/logout", logout);

router.get("/emailverify", (req, res) => {
  let company;
  let admin;
  res.locals.status = "no";
  let status = res.locals.status;
  let user;
  // console.log(res.locals.status);
  // console.log(status);

  return res.render("emailverify", company, user, admin, status);
});

module.exports = router;
