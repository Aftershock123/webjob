const express =require('express')
const path =require('path')
const cookie =require('cookie-parser')
const Port =process.env.Port || 5000;
const db =require("./Router/db-config")
const app = express()





//Set view engine

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')



//static file
app.use(express.static(path.join(__dirname,'public')))
app.use("/js" , express.static(__dirname+'./public/js'))

app.use(cookie());
app.use(express.urlencoded({extended:false}))
app.use(express.json());

db.connect((err)=>{
    if(err) throw err;
    console.log("database connected")
})




//define router


app.use('/' ,require ('./Router/myrouter'))
app.use("/api",require("./controllers/login"))
app.use("/company",require("./controllers/company"))
app.use("/user",require("./controllers/user"))




//connect port
app.listen(Port,()=>{  
    console.log("server port : "+Port);
})