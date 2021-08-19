const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    userId:{
      type: String
    },
    comment:{
      type: String
    },
    commentAt:{
      type: Date,
      default: Date.now
    }
  })