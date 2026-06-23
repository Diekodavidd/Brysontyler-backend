const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
name:{
   type:String,
   required:true,
   trim:true
},
email:{
   type:String,
   required:true,
   unique:true,
   lowercase:true,
   trim:true
},
password:{
   type:String,
   required:true
},
role: { type: String, enum: ['fan', 'creator', 'admin'], default: 'fan' },
coinBalance: { type: Number, default: 0 },
isKYCVerified: { type: Boolean, default: false },
kycStatus: {
    type: String,
    enum: ["not_started", "pending", "approved", "rejected"],
    default: "not_started"
},
kycVerifiedAt: Date,
isVerifiedCreator: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);