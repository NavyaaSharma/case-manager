const express=require('express')
const multer=require('multer')
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
        await user.save().then(()=>{
            res.status(201).send(user)
        }).catch((err)=>{
            res.status(400).send(err)
        })

})


router.post('/adv/add-date',auth,async(req,res)=>{
    try
    {   
        const user=await Case.findOne({case_no:req.body.case_no})
        if(!user)
        {
            res.status(404).send({"error":"No case existes"})
        }
        else{
            user.date.push(req.body.date_details)
        await user.save()
        res.status(201).send(user)
        }
    }
    catch
    {
        res.send(400).send()
    }
})

router.post('/adv/details',auth,async(req,res)=>{
    try
    {
        const user= await Case.find({phone:req.body.phone})
        if(!user || user.length==0)
        {
            res.status(404).send({"error":"No case existes"})
        }
        else{
            res.status(200).send({payload:user})
        }
    }
    catch
    {
        res.status(400).send()
    }
})

router.post('/adv/moredetails',auth,async(req,res)=>{
    try
    {
        const user= await Case.findOne({case_no:req.body.case_no})
        if(!user || user.length==0)
        {
            res.status(404).send({"error":"No case existes"})
        }
        else{
            res.status(200).send({user})
        }
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
        console.log(req.body)
        console.log(req.query.case_no)
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
        console.log(req.body)
        for(var i=0;i<user.date.length;i++)
        {
            if(user.date[i]._id==req.query.date_id)
            {
                if(req.body.date)
                {
                    user.date[i].date=req.body.date
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
        var user=await Case.find({})
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

const upload=multer({
    fileFilter(req,file,cb)
    {
        if(!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/))
        {
            return cb(new Error('uplod image or pdf'))
        }
        cb(undefined,true)
    }
})

router.post('/adv/upload',upload.single('inputFile'),async(req,res)=>{
    console.log('hi')
    var user=await Case.findOne({case_no:req.query.case_no})
    for(var i=0;i<user.date.length;i++)
    {
        if(user.date[i]._id==req.query.date_no)
        {
            user.date[i].files.push({path:req.file.buffer})
            break
        }
    }
    await user.save()
    res.status(200).send({
        message:"File saved"
    })
},(err,req,res,next)=>{
    res.status(400).send({"error":err.message})
})

router.get('/adv/get/upload',async(req,res)=>{
    try{
    var user=await Case.findOne({case_no:req.query.cno})
    if(!user || !user.files)
    {
        res.status(404)
    }
    for(var i=0;i<user.date.length;i++)
    {
        if(user.date[i]._id==req.query.dno)
        {
            for(var j=0;j<user.date[i].files.length;j++)
            {
                if(user.date[i].files[j]._id==req.query.updno)
                {
                    res.set('Content-Type','image/jpg')
                    res.send(user.date[i].files[j].path)
                }
            }
        }
    }
}
catch(e)
{
    res.status(400).send("Bad req")
}
})
module.exports=router