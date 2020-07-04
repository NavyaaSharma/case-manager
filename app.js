const express=require('express')
var cors = require('cors')
const app=express()
 
app.use(cors())
require('dotenv').config()
var db = require('./config/keys')
var mongoose = require('mongoose')
mongoose.connect(db.mongoDB, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology:true
})
const userRoute=require('./router/admin')
const clientRoute=require('./router/client')

var port= process.env.PORT || 3000

app.use(express.json())
app.use(userRoute)
app.use(clientRoute)

app.listen(port,()=>{
    console.log('server running')
})