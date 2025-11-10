const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Enter a name'],
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,'Please Enter a password']
    },
    email:{
        type:String,
        required:[true,'Please Enter a email'],
        unique:true,
        trim:true
    }
},{
    timestamps:true
})

module.exports=mongoose.model("User",userSchema)