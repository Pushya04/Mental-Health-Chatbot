const mongoose=require('mongoose')

const chatSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    date:{
        type:Date,
        default:Date.now
    },
    chat:[]  // array of question and answer
})
const chat=mongoose.model("chats",chatSchema)
module.exports=chat