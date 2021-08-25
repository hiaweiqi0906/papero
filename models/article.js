const mongoose = require('mongoose')
const marked = require('marked')
// const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const replySchema = new mongoose.Schema({
  userId:{
    type: String
  },
  replys:{
    type: String
  },
  replyAt:{
    type: Date,
    default: Date.now
  },
  replyTo:{
    type: String
  },
  replyToEmail:{
    type: String
  },
  replyToName:{
    type: String
  }
})

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
  },
  reply: [replySchema]
})

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: ''
  },
  createdBy:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  numOfLikes:{
    type: Number,
    default: 0
  },
  comment: [commentSchema]
})

articleSchema.pre('validate', function(next) {
  // if (this.title) {
  //   this.slug = slugify(this.title, { lower: true, strict: true })
  // }

  // if (this.markdown) {
  //   this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
  // }

  next()
})

articleSchema.index({title: 'text', content: 'text'});

const Article = mongoose.model('Article', articleSchema)
Article.createIndexes()
module.exports = Article