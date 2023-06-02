const jwt =require('jsonwebtoken');
const db =require('../Router/db-config')
const bcrypt =require('bcryptjs');

const login = async (req,res)=>{
    const {email, password}= req.body
    if(!email || !password) return res.json({status:"error",error:"Please Enter your email and password"});
    else{
        db.query('SELECT email FROM users WHERE email = ? ', [email], async(Err,result)=>{
            if(Err) throw Err;
            if(!result[0] || !await bcrypt.compare(password,result[0].password))return res.json({status:"error",error:"Incorrect Email or password"})
            else{
                const token =jwt.sign(result[0].id, process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_EXPIRES
                })
                const cookieOptions ={
                    expiresIn: new Date(Date.now() +process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly:true
                }
                res.cookie("userRegistered",token,cookieOptions);
                return res.json({status:"sucess" , sucess:"User has been logged in"});
            }
        })
    }
}
module.exports=login;