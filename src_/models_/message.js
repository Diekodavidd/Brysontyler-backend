const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
{

conversationId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Conversation",
required:true
},

sender:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

receiver:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

text:String,

attachments:[
{
url:String,
type:String
}
],

read:{
type:Boolean,
default:false
},

edited:{
type:Boolean,
default:false
},

deleted:{
type:Boolean,
default:false
}

},
{
timestamps:true
});

module.exports =
mongoose.model("Message",MessageSchema);