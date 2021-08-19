const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const commentSchema = new mongoose.Schema({
  userId:{
    type: String
  },
  comments:{
    type: String
  },
  commentAt:{
    type: Date,
    default: Date.now
  }
})

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  markdown: {
    type: String,
    required: true
  },
  createdBy:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sanitizedHtml: {
    type: String,
    required: true
  },
  comment: [commentSchema]
})

// articleSchema.pre('validate', function(next) {
//   if (this.title) {
//     this.slug = slugify(this.title, { lower: true, strict: true })
//   }

//   if (this.markdown) {
//     this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
//   }

//   next()
// })

module.exports = mongoose.model('Article', articleSchema)