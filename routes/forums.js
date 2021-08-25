const express = require('express')
const Article = require('../models/article')
const User = require('../models/User')
const router = express.Router()
const mongoose = require('mongoose')
const db = require('../config/keys').MongoURI;
var conn = mongoose.createConnection(db);
router.get('/new', (req, res) => {
  res.render('forums/new', { article: new Article() })
})

router.get('/mypost', async (req, res) => {
  req.session.isAuth = true
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('forums/mypost', { article: articles })
})

router.get('/search=:searchResults/page=:currentPage/total=:totalPages', async (req, res) => {

  let skip = (req.params.currentPage - 1) * 10
  let result = await conn.db.collection("articles").aggregate([
    {
      '$search': {
        'index': 'articles_index',
        'text': {
          'query': `${req.params.searchResults}`,
          'path': {
            'wildcard': '*'
          }
        }
      },
    }, {
      '$skip': skip
    }, {
      '$limit': 10
    }
  ]).toArray()
let userList =[]
for(let i=0; i<result.length; i++){
  let user = await User.findById(result[i].userId)
        userList.push(user)
}


  res.render('forums/search_results', { user: req.user, searchResults: req.params.searchResults, userList: userList, articles: result, currentPage: req.params.currentPage, pages: req.params.totalPages  })

  //res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
})

router.post('/search', async (req, res) => {
  let result = await conn.db.collection("articles").aggregate([
    {
      '$search': {
        'index': 'articles_index',
        'text': {
          'query': `${req.body.searchbar}`,
          'path': {
            'wildcard': '*'
          }
        }
      },

    }
  ]).toArray()
  console.log(result.length)
  let newLink = '/forums/search=' + req.body.searchbar + '/page=1/total=' + (Math.ceil(result.length / 10))
  res.redirect(newLink)
})

// router.post('/search', async (req, res) => {
//   Article
//     .find({ $text: { $search: req.body.searchbar } })
//     .sort({ uploadedAt: 'desc' })
//     .skip((1 - 1) * 10)
//     .limit(10)
//     .exec(async function (err, doc) {
//       if (err) console.log(err)
//       // res.render("forums/index", { user: req.user, articles: doc });
//       let comments = []
//       let userList = []
//       let subcomments = []
//       for (let i = 0; i < doc.length; i++) {
//         if (doc[i].comment.length != 0) {
//           //console.log(articles[i].comment[0].userId)
//           for (let j = 0; j < doc[i].comment.length; j++) {
//             let uId = doc[i].comment[j].userId
//             let user = await User.findById(uId)
//             if (user) {
//               let details = {
//                 userImg: user.avatarUri || 'https://res.cloudinary.com/papero/image/upload/v1629211384/r6x1tgd7dr9tgdf87aum.png',
//                 userName: user.firstName + ' ' + user.lastName,
//                 commentText: doc[i].comment[j].comments,
//                 commentAt: doc[i].comment[j].commentAt
//               }
//               subcomments.push(details)
//             } else {

//               subcomments.push({})
//             }
//           }
//           // articles[i].comment.forEach(async (comment) =>{
//           //   //console.log(comment)

//           // })
//           comments[i] = subcomments

//         } else {
//           comments[i] = false
//         }
//         let user = await User.findById(doc[i].userId)
//         userList.push(user)
//         subcomments = []
//       }
//       // articles.forEach((article) => {
//       //   comments.push(article.comment)
//       // })
//       res.render('forums/index', { user: req.user, articles: doc, comments: comments, userList: userList })
//     });
// })

router.get('/users/:id', async (req, res) => {
  let comments = []
  let subcomments = []
  const blogger = await User.findById(req.params.id)
  let articles = await Article.find({ userId: req.params.id }).sort({ createdAt: 'desc' })
  for (let i = 0; i < articles.length; i++) {
    if (articles[i].comment.length != 0) {
      for (let j = 0; j < articles[i].comment.length; j++) {
        let uId = articles[i].comment[j].userId
        let user = await User.findById(uId)
        if (user) {
          let details = {
            userImg: user.avatarUri || 'https://res.cloudinary.com/papero/image/upload/v1629211384/r6x1tgd7dr9tgdf87aum.png',
            userName: user.firstName + ' ' + user.lastName,
            commentText: articles[i].comment[j].comments,
            commentAt: articles[i].comment[j].commentAt
          }
          subcomments.push(details)
        } else {
          subcomments.push({})
        }
      }

      comments[i] = subcomments

    } else {
      comments[i] = false
    }
    subcomments = []
  }
  res.render('forums/users', { user: req.user, blogger: blogger, articles: articles, comments: comments })
})

router.get('/', async (req, res) => {
  req.session.isAuth = true
  let articles = []

  if (req.user) {
    if ((req.user.following.length > 0)) {
      let followingArticles = await Article.find({ userId: { $in: req.user.following } })
        .sort({ createdAt: 'desc' })
      let generalArticles = await Article.find().sort({ createdAt: 'desc' })
      articles = followingArticles.concat(generalArticles)
    } else {
      articles = await Article.find().sort({ createdAt: 'desc' })
    }
  } else {
    articles = await Article.find().sort({ createdAt: 'desc' })
  }


  let comments = []
  let subcomments = []

  let userList = []
  let userIds = []

  for (let i = 0; i < articles.length; i++) {
    
    let user = await User.findById(articles[i].userId)
    userList.push(user)
    // userIds.push(articles[i].userId)
    subcomments = []
  }
  // articles.forEach((article) => {
  //   comments.push(article.comment)
  // // })
  // await User.find({ _id: { $in: userIds } }, function (err, docs) {
  //   if (err) console.log(err)
  //   userList = docs
  res.render('forums/index', { user: req.user, userList: userList, articles: articles })

  // })

})

router.post('/reply_comment/:articleId', async (req, res) => {
  const article = await Article.findById(req.params.articleId)
  let newReply = {
    userId: req.user._id,
    replys: req.body.reply,
    replyAt: Date.now(),
    replyTo: req.body.replyToId
  }
  article.comment.forEach((comments) => {
    if (comments._id == req.body.commentID) {
      comments.reply.push(newReply)
    }
  })
  article.save()
  res.redirect('/forums')
})

router.post('/reply_reply/:articleId', async (req, res) => {
  const user = await User.findById(req.body.replyToId)
  const article = await Article.findById(req.params.articleId)
  let newReply = {
    userId: req.user._id,
    replys: req.body.reply,
    replyAt: Date.now(),
    replyTo: req.body.replyToId
  }
  article.comment.forEach((comments) => {
    if (comments._id == req.body.commentID) {
      comments.reply.push(newReply)
    }
  })
  article.save()
  res.redirect('/forums')
})

router.post('/follow/:id', async (req, res) => {
  let user = await User.findById(req.user._id)
  user.following.push(req.params.id)
  user.save()
  res.redirect('/forums')
})

router.get('/following', async (req, res) => {
  let user = await User.findById(req.user._id)
  res.render('forums/following', { following: user.following })
})

router.post('/comment/:id', async (req, res) => {
  let article = await Article.findById(req.params.id)
  let comment = article.comment
  const userId = req.user._id
  const comments = req.body.comments

  const commentAt = Date.now

  comment.push({ userId, comments, commentAt })
  Article.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.params.id) }, {
    comment: comment
  }, (err, doc) => {
    if (err) throw err
    else {
      res.redirect('/forums')
    }
  })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('forums/edit', { article: article })
})

router.get('/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  if (article == null) res.redirect('/')
  else {
    let comments = article.comment
    let replys = []
    let subReplys = []
    let userList = []
    let userIds = []
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].reply.length > 0) {
        for (let j = 0; j < comments[i].reply.length; j++) {
          let uId = comments[i].reply[j].userId
          let user = await User.findById(uId)
          if (user) {
            let details = {
              userImg: user.avatarUri || 'https://res.cloudinary.com/papero/image/upload/v1629211384/r6x1tgd7dr9tgdf87aum.png',
              userName: user.firstName + ' ' + user.lastName,
              userDetails: user,
              replyText: comments[i].reply[j].replys,
              replyAt: comments[i].reply[j].replyAt,
              replyId: comments[i].reply[j]._id
            }
            subReplys.push(details)
          } else {
            subReplys.push({})
          }
        }
        replys[i] = subReplys
      } else {
        replys[i] = false
      }
      let user = await User.findById(comments[i].userId)
      userList.push(user)
      subReplys = []
    }

    res.render('forums/show', { user: req.user, userList: userList, article: article, replys: replys })
  }
  //res.render('forums/show', { article: article })
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res, next) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.content = req.body.content
    article.userId = req.user._id
    article.createdBy = req.user.firstName + ' ' + req.user.lastName
    try {
      article = await article.save()
      res.redirect(`/forums/`)
    } catch (e) {
      console.log(e)
      res.render(`forums/${path}`, { article: article })
    }
  }
}

module.exports = router