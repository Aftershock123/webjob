const db = require("../Router/db-config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const loggedIn = require("../controllers/loggedin");

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

//---------------------------------------------------profile-----------------------------
router.get(
  "/profile/:id",
  upload.single("image"),
  loggedIn,
  async (req, res) => {
    try {
      let user;
      let company;
      const { id } = req.params;
      let webpage;
      [webpage] = await db.promise().query("SELECT * FROM webpage ");

      const [rows] = await db
        .promise()
        .query("SELECT * FROM admins  where id_admin = ?", [id]);

      if (rows.length === 0) {
        return res.status(404).send("admin not found");
      }

      res.render("profileadmin", { admin: rows[0], user, company, webpage });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/updateprofile/:id",
  upload.single("image"),
  loggedIn,
  async (req, res) => {
    try {
      let user;
      let company;

      const { id } = req.params;
      let webpage;
      [webpage] = await db.promise().query("SELECT * FROM webpage ");
      const [updatedadmin] = await db
        .promise()
        .query("SELECT * FROM admins WHERE id_admin = ?", [id]); // console.log(rows);
      const { username, email } = req.body;
      const image = req.file ? req.file.filename : updatedadmin[0].image;

      const [rows] = await db
        .promise()
        .query(
          "UPDATE admins SET username = ?, email = ?,image = ? WHERE admins.id_admin = ?",
          [username, email, image, id]
        );
      // const [updatedadmin] = await db.promise().query('SELECT * FROM admins WHERE id_admin = ?', [id]);// console.log(rows);
      if (updatedadmin.length === 0) {
        return res.status(404).send("User not found");
      }
      // console.log(updatedadmin.image);
      // console.log(updatedadmin[0].image);
      // res.render('profileadmin', { admin: updatedadmin[0],user,company,webpage});
      const currentURL = req.get("Referer");
      res.redirect(currentURL);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//--------------------------------------------------------web----------------------------------
router.get("/webpage/:id", loggedIn, async (req, res) => {
  try {
    let user;
    let company;
    const { id } = req.params;

    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    // const [rows] = await db.promise().query('SELECT * FROM webpage');
    //  const webpage =rows[0]
    res.locals.webpage = webpage;
    // console.log(res.locals.webpage)
    const [row] = await db
      .promise()
      .query("SELECT * FROM admins where admins.id_admin =? ", [id]);

    res.render("webpage", {
      admin: row[0],
      webpage,
      user,
      company,
      eweb: webpage[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/editwebpage/:id", loggedIn, async (req, res) => {
  try {
    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");
    let user;
    let company;
    let jobindex;
    // const [rows] = await db.promise().query('SELECT * FROM webpage');
    // const webpage =rows[0]
    // console.log(webpage.id_webpage);
    //  res.locals.webpage = webpage;
    //  console.log(res.locals.webpage.id_webpage);

    const { id } = req.params;

    const { namepage, address, email, call } = req.body;
    console.log(webpage[0].id_webpage);

    await db
      .promise()
      .query(
        "UPDATE webpage SET namepage = ?, address = ?, email = ?, `call` = ? WHERE webpage.id_webpage = ?",
        [namepage, address, email, call, webpage[0].id_webpage]
      );

    const [updatedWebpageRows] = await db
      .promise()
      .query("SELECT * FROM webpage WHERE id_webpage = ?", [
        webpage[0].id_webpage,
      ]);

    const [admin] = await db
      .promise()
      .query("SELECT * FROM admins WHERE id_admin = ?", [id]);

    if (admin.length === 0) {
      return res.status(404).send("User not found");
    }

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
////////////////////////////////-----------------------------usermanagement------------------------------------///////////////////////////
router.get(
  "/usermanagement/:id",
  loggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let { id } = req.params;
      let user;
      let company;
      let webpage;
      [webpage] = await db.promise().query("SELECT * FROM webpage ");
      let admin;
      const [row] = await db
        .promise()
        .query("SELECT * FROM admins where admins.id_admin =? ", [id]);
      let [usermanage] = await db.promise().query("SELECT * FROM users ");
      //  console.log(usermanage);
      res.render("usermanagement", {
        admin: row[0],
        usermanage,
        webpage,
        user,
        company,
      });
    } catch (error) {}
  }
);

router.post("/ban/:id", loggedIn, async (req, res) => {
  try {
    let id = req.body.id;

    let webpage;
    [webpage] = await db.promise().query("SELECT * FROM webpage ");

    const [row] = await db
      .promise()
      .query("SELECT * FROM admins where admins.id_admin =? ", [id]);
    let [companymanage] = await db.promise().query("SELECT * FROM companies ");
    let admin;
    let user;

    await db
      .promise()
      .execute("UPDATE users SET status = ? WHERE id_user = ?", ["banned", id]);

    // console.log(`User with ID ${id} has been banned.`);
    const currentURL = req.get("Referer");
    res.redirect(currentURL);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

router.post("/unban/:id", loggedIn, async (req, res) => {
  try {
    let id = req.params.id;
    let admin;
    let user;

    await db
      .promise()
      .execute("UPDATE users SET status = ? WHERE id_user = ?", ["active", id]);
    // console.log(`User with ID ${id} has been unbanned.`);
    const currentURL = req.get("Referer");
    res.redirect(currentURL);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

///////////////////////////////////---------------------------------------companymanagement-------------------///////////////////////////////

router.get(
  "/companymanagement/:id",
  loggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let { id } = req.params;

      let user;
      let company;
      let webpage;
      [webpage] = await db.promise().query("SELECT * FROM webpage ");
      let admin;
      const [row] = await db
        .promise()
        .query("SELECT * FROM admins where admins.id_admin =? ", [id]);
      let [companymanage] = await db
        .promise()
        .query("SELECT * FROM companies ");
      //  console.log(usermanage);
      res.render("companymanagement", {
        admin: row[0],
        companymanage,
        webpage,
        user,
        company,
      });
    } catch (error) {}
  }
);

router.post("/bancompany/:id", loggedIn, async (req, res) => {
  try {
    let id = req.params.id;

    let admin;
    let user;

    await db
      .promise()
      .execute("UPDATE companies SET status = ? WHERE id_company = ?", [
        "banned",
        id,
      ]);
    // console.log(`User with ID ${id} has been banned.`);
    const currentURL = req.get("Referer");
    res.redirect(currentURL);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

router.post("/unbancompany/:id", loggedIn, async (req, res) => {
  try {
    let id = req.params.id;
    let admin;
    let user;

    await db
      .promise()
      .execute("UPDATE companies SET status = ? WHERE id_company = ?", [
        "active",
        id,
      ]);
    // console.log(`User with ID ${id} has been unbanned.`);
    const currentURL = req.get("Referer");
    res.redirect(currentURL);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

module.exports = router;
