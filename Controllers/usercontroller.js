const UserRouter = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../Models/usermodel");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

//TO REGISTER USER!!
UserRouter.post("/createuser", async (req, res) => {
  const { username, email, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: encryptedPassword,
  });
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.json("User Already existing");
    } else {
      user.save();
      res.json("Data Successfully Stored");
    }
  } catch (err) {
    res.json("Error Occured");
  }
});

//TO LOGIN USER
UserRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign({email: user.email},'process.env.JWT_SECRET_KEY',{expiresIn: '1d'})
          res.json({
            message: "Success",
            data: token
          });
        } else {
          res.json("Invalid Password");
        }
      });
    } else {
      res.json("No record found!!, Please Create User");
    }
  });
});

//TO GET USER DATA IN HOME PAGE
UserRouter.post('/userdata', async (req,res) => {
  const {token} = req.body;
  try{
    const user = jwt.verify(token,'process.env.JWT_SECRET_KEY')
    const useremail = user.email
    User.findOne({email: useremail}).then((data) => {
      res.json({
        message: "VERIFIED",
        data: data
      })
    }).catch((err) => {
      res.json({
        message: "EXPIRED"
      })
    })
  }catch(err){
    console.log(err)
  }
})

//FOR SEND PASSWORD RESET LINK IN MAIL
UserRouter.post('/forgot-password', (req,res) => {
  const {email} = req.body;
  User.findOne({email})
  .then(user => {
    if(!user){
      return res.json({
        message: "User not existed"
      })
    }
    else{
    const token = jwt.sign({id: user._id},`process.env.JWT_SECRET_KEY`,{expiresIn: "1d"})
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'badhrirajan2211@gmail.com',
        pass: 'iswakqmzrwtefjfg'
      }
    });
    
    var mailOptions = {
      from: 'badhrirajan2211@gmail.com',
      to: email,
      subject: 'Reset your Password',
      text: ``
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        res.json("Email sent successfully!!")
      }
    });
  }
  })
})

//RESET PASSWORD
UserRouter.post('/reset-password/:id/:token', (req,res) => {
  const {id,token} = req.params
  const {password} = req.body

  jwt.verify(token,'process.env.JWT_SECRET_KEY',(err,decoded) => {
    if(err){
      res.json({
        message: "Error"
      })
    } else{
      bcrypt.hash(password, 10)
      .then(hash => {
        User.findByIdAndUpdate({_id:id},{password: hash})
        .then(u => res.json("Password Updated Successfully!! Now try to login!!"))
        .catch(err => res.json("Error"))
      })
      .catch(err => res.json("Error"))
    }
  })
})

module.exports = UserRouter;
