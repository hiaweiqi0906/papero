const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

const UserSchema = mongoose.Schema({
    
        firstName:{
            type: String,
            require: true
        },
        lastName:{
            type: String,
            require: true
        },
        noIC:{
            type: Long,
            require: true
        },
        email:{
            type: String,
            require: true
        },
        password:{
            type: String,
            require: true
        }  ,
        gender:{
            type: String,
            require: true
        },
        noTel:{
            type: Long,
            require: true,        
        },
        states:{
            type: String,
            require: true
        },
        location:{
            type: String,
            require: true
        }
})

const User = mongoose.model('User', UserSchema);
module.exports = User