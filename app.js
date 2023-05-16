const express =require('express')
// const path = require('path')
const mysql =require('mysql2');
// const router =require('./Router/myrouter')
const app = express()



const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'projectweb',
    port:'3307'

})
connection.connect((err)=>{
    if(err){
        console.log('Error connect to mysql database = ',err)
        return;
    }
    console.log('Mysql successfully connected');
})

// app.set('views',path.join(__dirname,'views'))
// app.set('view engine','ejs')
// app.use(router)
// app.use(express.static(path.join(__dirname,'public')))



app.listen(8080,()=>{
    console.log("server port 3030 ")
})