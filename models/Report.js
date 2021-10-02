const mongoose = require('mongoose')

const ReportSchema = mongoose.Schema({
    type: String,
    reportId: String,
    comment: String,
    category: String,
    date: Date,
    settled: Boolean
})

const Report = mongoose.model('Report', ReportSchema)
module.exports = Report