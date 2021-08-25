const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

const UserSchema = mongoose.Schema({
    
        googleId:{
            type: String,
            default: ''
        },
        firstName:{
            type: String,
            default: ''
        },
        lastName:{
            type: String,
            default: ''
        },
        noIC:{
            type: Long,
            default: 0
        },
        email:{
            type: String,
            default: ''
        },
        password:{
            type: String,
            default: ''
        },
        gender:{
            type: String,
            default: ''
        },
        noTel:{
            type: Long,
            default: 0,        
        },
        states:{
            type: String,
            default: ''
        },
        location:{
            type: String,
            default: ''
        },
        avatarUri:{
            type:String,
            default: ''
        },
        cloudinaryID:{
            type:String,
            default: ''
        },
        favouriteUri:{
            type: Array
        },
        whatsappLink:{
            type: String,
            default: ''
        },
        messengerLink:{
            type: String,
            default: ''
        },
        wechatLink:{
            type: String,
            default: ''
        },
        instagramLink:{
            type: String,
            default: ''
        },
        following:{
            type: Array,
            default: []
        },
        activated:{
            type: Boolean,
            default: true
        }
})

const User = mongoose.model('User', UserSchema);
module.exports = User