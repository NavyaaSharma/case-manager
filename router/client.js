const express=require('express')
const Case=require('../models/case')
const Client=require('../models/client')
var auth=require('../middleware/auth')
const router=new express.Router()

router.post('/client/create',async(req,res)=>{
    const check=await Client.findOne({phone:req.body.phone})
    if(check)
    {
        res.status(401).json({error:"User already exists"})
    }
    else{
        const map=await Case.findOne({phone:req.body.phone})
        if(map)
        {
            const user=new Client(req.body)
            try{
                await user.save()
                res.status(201).send(user)
            }
            catch{
                res.status(400).send()
            }
        }
        else
        {
            res.status(401).json({error:"Please enter the phone number which is registered with the advocate"})
        }
    }
})

router.post('/client/forgotpassword',async(req,res)=>{
    const user=await Client.findOne({phone:req.body.phone})
    if(user)
    {
        try{
            user.password=req.body.password
            await user.save()
            res.status(201).send(user)
        }
        catch{
            res.status(400).send()
        }
    }
    else
    {
        res.status(401).send()
    }
    
})
router.post('/client/login',async(req,res)=>{
    try{
        const user=await Client.findByCredentials(req.body.phone,req.body.password)
        const token=await user.generateToken()
        if(!user)
        {
            res.status(404).send()
        }
        res.json({token,user})
    }
    catch{
        res.status(400).send({"err":"invalid phone number or password"})
    }
})

router.get('/client/count',auth,async(req,res)=>{
    
    Case.count({phone:req.query.phone}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({"total":result});
        }
      });
})

module.exports=router