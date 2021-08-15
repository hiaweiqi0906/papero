const express = require('express')
const Article = require('../models/article')
const router = express.Router()

router.get('/new', (req, res) => {
  res.render('forums/new', { article: new Article() })
})

router.get('/mypost', async (req, res) => {
  req.session.isAuth = true
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('forums/mypost', { article: articles })
})

router.get('/', async (req, res) => {
  req.session.isAuth = true
  let articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('forums/index', { user: req.user, articles: articles })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('forums/edit', { article: article })
})

router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('forums/show', { article: article })
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
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.createdBy = req.body.createdBy
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`forums/${path}`, { article: article })
    }
  }
}

module.exports = router