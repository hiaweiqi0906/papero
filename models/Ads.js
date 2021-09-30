const mongoose = require('mongoose')

const AdsSchema = mongoose.Schema({
    type: String,
    imgId: String,
    imgUri: String,
    expiredDate: Date
})

const Ads = mongoose.model('Ads', AdsSchema)
module.exports = Ads