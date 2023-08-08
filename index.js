const express = require('express')
const app = express()
const UserRouter = require('./Controllers/usercontroller')
const cors = require('cors')
const mongoose = require('mongoose')
const URL = "mongodb+srv://Badhrirajan:Badhri2211@cluster0.gxfd2vs.mongodb.net/UserCollection"

const port = 5000

async function Connect(){
    try{
        mongoose.connect(URL)
        await console.log("Database connection successfull")
    }
    catch(err){
        console.log("Error in connecting database",err)
    }
}

Connect();

app.listen(port, '0.0.0.0', () => {
    console.log("Server Started in PORT", port)
})

app.get('/', (req,res) => {
    res.status(200).json({
        message: "API CREATED SUCCESSFULLY!!"
    })
})

app.use(cors())
app.use(express.json())
app.use('/', UserRouter)