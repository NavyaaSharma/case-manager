var mongoose=require('mongoose')
var validator=require('validator')
var bcrypt=require('bcryptjs')
var jwt=require('jsonwebtoken')

var userSchema=new mongoose.Schema({
    email:
    {
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error('email is not valid')
            }
        }
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

userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
    delete user.password
    delete user.tokens
    return userObject
}
userSchema.methods.generateToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},'mysecret',{expiresIn:'1d'})
    //user.tokens=user.tokens.concat({token})
    //await user.save()
    return token
}
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
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
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8)
        next()
    }
})

var User=mongoose.model('User',userSchema)
module.exports=User