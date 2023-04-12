const http = require('http')
const fs = require('fs')
const url =require('url')

const indexpage = fs.readFileSync(`${__dirname}/webpage/Home.html`)
const registerUser = fs.readFileSync(`${__dirname}/webpage/registerUser.html`)

const server =http.createServer((req,res)=>{
    const pathName = req.url
    if(pathName ==="/" || pathName ==="home"){
        res.end(indexpage)
        // res.end(registerUser)
    }else if(pathName ==="/abc"){
        res.end("<h1>hello abc</h1>")
    }else {
        res.writeHead(404)
        res.end("<h1>Not found</h1>")
    }

})
.listen(8080,'localhost',()=>{
console.log("start 8080")
})