
const db = require('../Router/db-config');
const jwt = require('jsonwebtoken');
const loggedIn = (req, res, next) => {
    if (!req.cookies.userRegistered) {
      res.locals.status = "no";
      return next();
    }
  //ต้องแยกactor โดยinner join ทุกactor  If (member ที่ล็อคอินเข้ามามีไทป์เป็น user) ให้ ทำการจอยแค่ user & member ; if else (member ที่ล็ออินเป็นไมป? Costumer) ให้ทำการจอยแค่ customer &member
    try {
      const decoded = jwt.verify(req.cookies.userRegistered, process.env.JWT_SECRET);
      ///มีปันหาคือถ้าเอาuser.*ขึ่นก่อนก็จะเรียกข้อมูลcompanyได้แต่ถ้าcompanyขึ้นก่อนก้จะเรียกuserไม่ได้
      db.query('SELECT users.*,companys.* FROM members left JOIN users ON members.id_member = users.id_member left join companys on members.id_member = companys.id_member WHERE members.id_member = ?', [decoded.id_member], (err, result) => {
      if (err) {
          console.error('Database query error:', err);
          return next(err); // Pass the error to the error handling middleware
        }
  
        if (result.length === 0) {
          console.log('Member not found');
          res.locals.status = "no";
          return next(); // Member not found, proceed to the next middleware/route
        }
  
        // Set the members and status properties on res.locals
        res.locals.members = result[0];
        res.locals.users = result[0];
        res.locals.companys = result[0];
        res.locals.status = "loggedIn";
        // console.log(res.locals.members);
        console.log(res.locals.companys);
        // console.log(res.locals.users);
        return next();
      });
    } catch (err) {
      console.error('JWT verification error:', err);
      return next(err); // Pass the error to the error handling middleware
    }
  };


  module.exports = loggedIn ;