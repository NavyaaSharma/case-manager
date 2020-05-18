const express=require('express')
const Case=require('../models/case')
const User=require('../models/admin')
var auth=require('../middleware/auth')
const router=new express.Router()

router.post('/admin/create',async(req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()
        res.status(201).send(user)
    }
    catch{
        res.status(400).send()
    }
    // res.status(200).send(req.body)
})

router.post('/admin/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateToken()
        if(!user)
        {
            res.status(404).send()
        }
        res.send({token})
    }
    catch{
        res.status(400).send({"err":"invalid email or password"})
    }
})

router.post('/adv/add-case',auth,async(req,res)=>{
    var user=new Case(req.body)
    try
    {
        await user.save()
        res.status(201).send(user)
    }
    catch
    {
        res.status(400).send("Bad Request")
    }

})

router.post('/adv/add-date',auth,async(req,res)=>{
    try
    {   
        const user=await Case.findOne({case_no:req.body.case_no})
        if(!user)
        {
            res.status(404).send({"error":"No case existes"})
        }
        user.date.push(req.body.date_details)
        await user.save()
        res.status(201).send(user)
    }
    catch
    {
        res.send(400).send()
    }
})

router.get('/adv/details',auth,async(req,res)=>{
    try
    {
        const user= await Case.find({phone:req.body.phone})
        if(!user)
        {
            res.status(404).send({"error":"No case existes"})
        }
        res.status(200).send(user)
    }
    catch
    {
        res.status(400).send()
    }
})

router.get('/adv/count',auth,async(req,res)=>{
    
    Case.count({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({"total":result});
        }
      });
})

router.post('/adv/update/case/details',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    try{
        const user=await Case.findOne({case_no: req.query.case_no})
        updates.forEach((update)=>{
            user[update]=req.body[update]
        })
        await user.save()
        if(!user)
        {
            res.status(404).send({err:"No data found"})
        }
    res.send(user)
    }
    catch(err){
        res.status(400).send(err);
    }
})

router.post('/adv/update/case/date',auth,async(req,res)=>{
    try{
        const user=await Case.findOne({case_no: req.query.case_no})
        if(!user)
        {
            res.status(404).send({err:"No data found"})
        }
        
        for(var i=0;i<user.date.length;i++)
        {
            if(user.date[i]._id==req.query.date_id)
            {
                if(req.body.date)
                {
                    user.date[i].data=req.body.date
                }
                if(req.body.msg)
                {
                    user.date[i].msg=req.body.msg
                }
                if(req.body.time)
                {
                    user.date[i].time=req.body.time
                }
                if(req.body.details)
                {
                    user.date[i].details=req.body.details
                }
                break;
            }
        }
        await user.save()
        res.status(200).send(user)
    }
    catch
    {
        res.status(400).send()
    }
})

router.get('/adv/allCases',auth,async(req,res)=>{
    try{
        var user=Case.find({})
        if(!user)
        {
            res.status(404).send({err:"No data found"})
        }
        res.status(200).send(user)
    }
    catch
    {
        res.status(400).send()
    }
})
module.exports=router