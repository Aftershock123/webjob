const express =require('express')
const router =require('./Router/myrouter')
const app = express()

app.use(router)

app.listen(8080,()=>{
    console.log("server port 8080")
})