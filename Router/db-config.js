const mysql = require('mysql2');
const dotenv =require('dotenv').config();
const db = mysql.createConnection({
  host: process.env.DB_Host ,
  user: process.env.DB_User ,
  password: process.env.DB_Password ,
  database: process.env.DB_Name ,
  port: process.env.DB_Port ,
});


module.exports = db;

