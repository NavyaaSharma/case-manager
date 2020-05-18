var jwt=require('jsonwebtoken')
var User=require('../models/admin')

const auth=async (req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('JWT ','')
        const decoded=jwt.verify(token,'mysecret')
        const user=User.findOne({_id:decoded._id,'tokens.token':token})
        if(!user)
        {
            res.status(404).send({"error":"user not found"})
        }
        req.user=user
        next()
    }catch(e){
        res.status(400).send({"error":"please authenticate user"})
    }
    
}

module.exports=auth