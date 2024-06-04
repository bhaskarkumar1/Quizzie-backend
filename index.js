const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./Models/User");
const Qz=require("./Models/Qz")
const PORT =7000 || process.env.PORT;
const cors=require("cors")
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.SECRET_KEY;
app.use(express.json());
app.use(cors())
let verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  // console.log(token)
  if (!token) res.json({ status: "No Token Found !" });
  else {
    try {
      let isToken = jwt.verify(token, SECRET_KEY);
    //   console.log(isToken);
      next();
    } catch (err) {
      res.json({ "verify Token": err });
    }
  }
};

app.get("/health", (req, res) => {
  res.send("Api health Good! ");
});

app.get("/protected", verifyToken, (req, res) => {
  res.send("Protected Route!");
});

// signup route started !

app.post("/auth/signup", async (req, res) => {
  // console.log(req.body)
  let { name, email, password } = req.body;
  // console.log(name,email,password)
  // res.send("ok")
  try{
  let isPresent = await User.findOne({ email: email });
  
  // console.log("ispresent",isPresent)
  if (!isPresent) {
    try {
      let hashpwd = await bcrypt.hash(password, 10);
      let doc = new User({
        name: name,
        email: email,
        password: hashpwd,
        // "usercreated":Date.now()
      });
      await doc.save();
      console.log("Signup Success !");
      res.json({ status: "SignUp Success !" });
    } catch (err) {
      console.log("error in creating User:", err);
      res.json({ status: "SignUp Error !" });
    }
  } else {
    console.log("Email already Exist !");
    res.json({ status: "Email already Exists !" });
  }}catch(err){
    console.log(err)

  }
  // res.send("Sign up sucess !")
});

// signup route ended

app.post("/auth/login", async (req, res) => {
  let { email, password } = req.body;
//   console.log(email, password);
  let isPresent = await User.findOne({ email: email });
  if (isPresent) {
    // console.log(isPresent)
    let isMatch = await bcrypt.compare(password, isPresent.password);
    // console.log("isMatch",isMatch)
    if (isMatch) {
      let token = jwt.sign({ email: isPresent.email }, SECRET_KEY, {
        expiresIn: "4h",
      });
      // res.json({"status": "Login Success !"})
      res.json({ token: token });
    } else {
      res.json({ status: "Error in Credentials!" });
    }
  } else {
    res.json({ status: "Email is not registered !" });
  }

  // res.send("hii")
});


app.post("/create-quiz",verifyToken,async(req,res)=>{
  // let {questions}=req.body
  console.log(req.body)

  let{quizName, category, optionType,questions}=req.body
  console.log(req.body)
try{
  let newQz=new Qz({name:quizName, category:category, optionType:optionType,questions:questions})
  await newQz.save()
  console.log("success")
   res.send("data success saved!")
}catch(error){
  res.send(error)
  console.log("error",error)

}

// res.send(req.body)
})

app.get("/getall",async(req,res)=>{
  try{
    let data=await Qz.find({})
    res.send(data)
    console.log("success")
  }catch(err){
    console.log(err)
  }

})


app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Qz.findOneAndDelete({ "_id": id });
    console.log("Delete Success!");
    res.status(200).send("Delete Success!");
  } catch (err) {
    console.error("Error deleting Qz", err);
    res.status(500).send("Error deleting Qz");
  }
});


let connectionFunc = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Db Connected Success !");
    app.listen(PORT, () => {
      console.log(`Server started on Port ${PORT}`);
    });
  } catch (err) {
    console.log("error :", err);
  }
};
connectionFunc();
