const express=require('express')
const app=express()
require('dotenv').config()
var db = require('./config/keys')
var mongoose = require('mongoose')
mongoose.connect(db.mongoDB, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology:true
})
const userRoute=require('./router/admin')
var port= process.env.PORT || 3000
app.use(express.json())
app.use(userRoute)


app.listen(port,()=>{
    console.log('server running')
})