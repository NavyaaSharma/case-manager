var mongoose=require('mongoose')
var validator=require('validator')
var bcrypt=require('bcryptjs')
var jwt=require('jsonwebtoken')

var clientSchema=new mongoose.Schema({
    phone:{
        type:String,
        unique:true,
        required:true
    },
    password:
    {
        type:String,
        required:true
    },
    name:
    {
        type:String
    }
})

clientSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
    delete user.password
    return userObject
}
clientSchema.methods.generateToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},'mysecret',{expiresIn:'1d'})
    return token
}
clientSchema.statics.findByCredentials=async(phone,password)=>{
    const user=await Client.findOne({phone})
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        throw new Error('Unable to login')
    }
    return user
}
clientSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8)
        next()
    }
})

var Client=mongoose.model('Client',clientSchema)
module.exports=Client