const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;
const findOrCreate = require('mongoose-findorcreate')
const passportLocalMongoose = require('passport-local-mongoose')

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
// UserSchema.plugin(encrypt, {secret:process.env.SECRETS, encryptedFields: ['password']})
UserSchema.plugin(passportLocalMongoose)
UserSchema.plugin(findOrCreate);

const User = new mongoose.model('User', UserSchema)

module.exports = User