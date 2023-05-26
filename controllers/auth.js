const mysql = require('mysql2');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
 
const database = mysql.createConnection({
  host: process.env.DB_Host ,
  user: process.env.DB_User ,
  password: process.env.DB_Password ,
  database: process.env.DB_Name ,
  port: process.env.DB_Port ,
});





exports.registeruser =(req,res) =>{
console.log(req.body);
// const name =req.body.name;
// const password =req.body.password;
// const currentpass =req.body.currentpass;
// const email =req.body.email;
// const tell =req.body.tell;

// res.send("From submit");
const {name ,password ,currentpass ,email ,tell } = req.body;
// console.log(name);
// console.log(email);
database.query("select email from user where email=? ",[email],async(error ,results) =>{
    if(error){
        console.log(error);
    }

    if(results.length > 0){
        return res.render('registeruser' ,{msg:'email  id already taken'});
    } else if ( password != currenpassword){
        return res.render('registeruser',{msg :'Passwords do not match'});
    }

    let hashedPassword =await bcrypt.hash(password, 8);
    console.log(hashedPassword);
});
};