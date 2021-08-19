const mongoose = require('mongoose')
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

const SellerSchema= mongoose.Schema({
    email:{
        type: String,
        required: true
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
    }
})

const Seller = mongoose.model('Seller', SellerSchema)
module.exports = Seller