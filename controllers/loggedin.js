const db = require("../Router/db-config");
const jwt = require("jsonwebtoken");
const loggedIn = async (req, res, next) => {
  if (!req.cookies.userRegistered) {
    res.locals.status = "no";
    return next();
  }

  try {
    const decoded = jwt.verify(
      req.cookies.userRegistered,
      process.env.JWT_SECRET
    );
    // console.log(decoded);
    let userType = "";

    // Check for users
    db.query(
      "SELECT * from users WHERE id_user = ?",
      [decoded.id_user],
      (err, users) => {
        const companiesss = null;
        db.query("SELECT * FROM companies", companiesss);
        // console.log(companiesss);
        if (err) {
          console.error("Database query error:", err);
          return next(err);
        }
        if (users.length > 0) {
          userType = "user";
          res.locals.users = users[0];
          res.locals.status = "loggedIn";
          return next();
        } else if (userType != null) {
          // console.log(`userType : ${userType}`)
          db.query(
            "SELECT * from companies WHERE id_company = ?",
            [decoded.id_company],
            (err, companies) => {
              if (err) {
                console.error("Database query error:", err);
                return next(err);
              }
              // console.log(companies)
              if (companies.length > 0) {
                userType = "company";
                res.locals.companys = companies[0];
                res.locals.status = "loggedIn";

                return next();
              } else {
                // Check for admins

                db.query(
                  "SELECT * from admins WHERE id_admin = ?",
                  [decoded.id_admin],
                  (err, admins) => {
                    if (err) {
                      console.error("Database query error:", err);
                      return next(err);
                    }
                    if (admins.length > 0) {
                      userType = "admin";
                      res.locals.admins = admins[0];
                      res.locals.status = "loggedIn";
                      // console.log(`userType : ${res.locals.status}`);
                      return next();
                    }
                    // console.log(userType) ;
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (err) {
    console.error("JWT verification error:", err);
    return next(err);
  }
};

module.exports = loggedIn;
