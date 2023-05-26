const express =require('express')
const path =require('path')

const bodyParser=require('body-parser')
const db =require("./Router/db-config")
const app = express()
require('dotenv').config();

const Port =process.env.Port || 3000;

app.use(express.urlencoded({extended:false}))
app.use(express.json());
//Set view engine

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

//define router
app.use('/' ,require ('./Router/myrouter'))
app.use('/auth' ,require ('./Router/auth'))


//static file
app.use(express.static(path.join(__dirname,'public')))

//connect port
app.listen(Port,()=>{  
    console.log("server port : "+Port);
})