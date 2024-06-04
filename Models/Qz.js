const mongoose=require("mongoose")

const quizSchema=new mongoose.Schema({
    name:{type:String},
    // user 
    category:{type:String},
    createdOn:{type:Date,default:Date.now},
    impression:{type:Number,default:0},
    timer:{type:Number,enum:[null,0,5,10], default:null},
    optionType:{type:String, enum:["text","img","text&img"],default:"text"},
    questions:[]

})

const Qz=mongoose.model("Qz",quizSchema)
module.exports=Qz