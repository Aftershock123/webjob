const db =require('db-config');
const router = require('./myrouter');
router.getByid('/id' ,async(req,res) =>{
    try{
        const [id] =req.params
        const[rows,fields] = await db.query("select * from users where id_user = ?" , [id])
        res.json({
            data:rows
        })
        
        
    }catch(error){
        console.log(error)
    }
});




module.exports = router ;