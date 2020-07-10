const express=require('express')
const multer=require('multer')
const nodemailer=require('nodemailer')
const Case=require('../models/case')
const User=require('../models/admin')
var uauth=require('../middleware/auth')
const router=new express.Router()

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port:465,
    auth: {
      user: 'sandeepsharma600600@gmail.com', // your gmail address
      pass: process.env.password// your gmail password
    }
  });

  const {google} = require('googleapis');

  let auth = new google.auth.OAuth2(
    '766084042057-34svlo44haeekuckndvjv7ga481l4ag1.apps.googleusercontent.com',
    'b-BjUBuFENxsNofAJ3B84skQ',
    'https://developers.google.com/oauthplayground'
  );
  // Now use OAuth response to get an user authenticated API client
  let credentials = {
    access_token:'ya29.a0AfH6SMBwXgL1CltwJICQPZhsIITRrfy3S_GQpY6WeBq4p3W38IKigD_KhnmvBshQURADuvmEdDXcs8wGAwwyDVWtwJTtaBH6bf2wU5XLU7teJ43ZbSHlJid-_8NoZiifRGLL6McXkhjHwYww6OX49oxiS_W1mNjLjDc',
    token_type:'Bearer', // mostly Bearer
    refresh_token:'1//04ad601H2Jg9RCgYIARAAGAQSNwF-L9IrdpVA121aO00h9QbXfcjqZclKx-gFsErrcWK9njMhItURUf58y4e2-XOSPc-lryyhR7g'
  };
  auth.setCredentials(credentials);

var atc=(req,res,next)=>{
    console.log(req.body.date_details.revdate)
    let calendar = google.calendar({version: 'v3', auth});
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: {
            'summary': 'Case Hearing Date',
            'description': `Case hearing for the case : ${req.body.name}`,
            'start': {
                'dateTime': `${req.body.date_details.revdate}T04:30:00`,
                'timeZone':'utc'
            },
            'end': {
                'dateTime': `${req.body.date_details.revdate}T04:30:00`,
                'timeZone':'utc'
            },
            'attendees': [],
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 180},
                ],
            },
            'colorId' : 4 ,
            'sendUpdates':'all',
            'status' : 'confirmed'
        },
    }, (err, success) => {
        if (err) {
            console.log(err)
            res.status(401).send("Can't create event")
            
        }
        else{
            next()
        }
    });
}

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
router.post('/adv/add-case',uauth,async(req,res)=>{
    var user=new Case(req.body)
        await user.save().then(()=>{
            res.status(201).send(user)
        }).catch((err)=>{
            res.status(400).send(err)
        })

})


router.post('/adv/add-date',uauth,atc,async(req,res)=>{
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
        //addtocalender({name:user.name,revdate:req.body.date_details.revdate})
        res.status(201).send("Date added !")
    
        }
    }
    catch
    {
        res.send(400).send()
    }
})

router.post('/adv/details',uauth,async(req,res)=>{
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

router.post('/adv/moredetails',uauth,async(req,res)=>{
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

router.get('/adv/count',uauth,async(req,res)=>{
    
    Case.count({}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).send({"total":result});
        }
      });
})

router.post('/adv/update/case/details',uauth,async(req,res)=>{
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

router.post('/adv/update/case/date',uauth,async(req,res)=>{
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

router.get('/adv/allCases',uauth,async(req,res)=>{
    try{
        var user=await Case.find({})
        if(!user)
        {
            res.status(404).send({err:"No data found"})
        }
        res.status(200).json({payload:user})
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

  router.post('/send/email',uauth,async function(req,res){
    try{
        var mailOptions={
                from : 'sandeepsharma600600@gmail.com',
                to : req.body.to,
                subject : req.body.subject,
                html : req.body.message
            }
        console.log(mailOptions)
        console.log(process.env.password)
        transporter.sendMail(mailOptions, function(error, response){
        if(error){
                console.log(error)
            res.status(401).json("error")
        }else{
                console.log("Message sent: ");
            res.status(200).json("sent")
            }
        });
    }

    catch(e)
    {
        res.status(400).send()
    }
});
module.exports=router