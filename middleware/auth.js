var jwt=require('jsonwebtoken')
var User=require('../models/admin')

const auth=async (req,res,next)=>{

        const check=req.header('Authorization')
        if(check)
        {
            const token=req.header('Authorization').replace('JWT ','')
            jwt.verify(token,'mysecret',(err,user)=>{
                if(err)
                {
                    console.log(err)
                    res.status(403).send({"error":"please authenticate user"})
                }
                else{
                    req.user = user;
                // console.log(req.user)
                // console.log(req.user._id)
                next();
                }
                
            })
            // const user=User.findOne({_id:decoded._id,'tokens.token':token})
            // if(!user)
            // {
            //     res.status(404).send({"error":"user not found"})
            // }
            
            
            // next()
        }
        else{
            res.status(401).send({"error":"please authenticate user"})
        }
    // }catch(e){
    //     res.status(401).send({"error":"please authenticate user"})
    // }
    
}

module.exports=auth