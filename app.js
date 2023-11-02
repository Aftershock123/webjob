const express =require('express')
const path =require('path')
const cookie =require('cookie-parser')
const Port =process.env.Port || 5000;
const db =require("./Router/db-config")
const app = express()
const bodyParser =require('body-parser')
const session = require('express-session');
const updatejobstatus = require("./controllers/upjobstatus");

// const createdadmin =require('./entity/admin')
// const createduser =require('./entity/user')
// const createdcompany =require('./entity/company')
// const createdresume =require('./entity/resume')
// const createdjobcompany =require('./entity/jobcompany')
setInterval(updatejobstatus, 60000);

//Set view engine

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')




//static file
app.use(express.static(path.join(__dirname,'public')))
app.use("/js" , express.static(__dirname+'./public/js'))


app.use(cookie());
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(bodyParser.json());
db.connect((err)=>{
    if(err) throw err;
    // createdadmin(db)
    // createdcompany(db)
    // createduser(db)
    // createdjobcompany(db)
    // createdresume(db)

    console.log("database connected")
})




//define router

app.use('/' ,require ('./Router/myrouter'))
app.use('/user' ,require ('./Router/user'))
app.use('/admin' ,require ('./Router/admin'))
app.use("/api",require("./controllers/login"))
app.use("/company",require("./Router/company"))





//connect port
app.listen(Port,()=>{  
    console.log("server port : "+Port);
})