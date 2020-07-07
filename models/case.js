var mongoose=require('mongoose')

var caseSchema=new mongoose.Schema({
    case_no:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        default:"Not provided"
    },
    phone:{
        type:String,
        default:"Not provided"
    },
    email:
    {
        type:String,
        default:"Not provided"
    },
    judge:
    {
        type:String,
        default:"Not provided"
    },
    party:
    {
        party1:{
            type:String,
            default:"Not provided"
        },
        party2:{
            type:String,
            default:"Not provided"
        }
    },
    desc:
    {
        type:String,
        default:"not provided"
    },
    date:
    [{
        date:
        {
            type:String,
            default:"Not provided"
        },
        msg:{
            type:String,
            default:"Not provided"
        },
        time:
        {
            type:String,
            default:"10 AM"
        },
        details:
        {
            type:String,
            default:"Not provided"
        },
        files:
        [{
            path:{
                type:Buffer
            }
        }]
    }]
    
})

var Case=mongoose.model('Case',caseSchema)
module.exports=Case