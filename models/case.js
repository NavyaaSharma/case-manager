var mongoose=require('mongoose')

var caseSchema=new mongoose.Schema({
    case_no:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        default:"none"
    },
    judge:
    {
        type:String,
        required:true
    },
    party:
    {
        party1:{
            type:String,
            required:true
        },
        party2:{
            type:String,
            required:true
        }
    },
    desc:
    {
        type:String
    },
    date:
    [{
        date:
        {
            type:String,
            
        },
        msg:{
            type:String
        },
        time:
        {
            type:String
        },
        details:
        {
            type:String
        }
    }]
})

var Case=mongoose.model('Case',caseSchema)
module.exports=Case