const express = require('express')
const { getBlocks, newBlock } = require('./blockchain')
const { muatKandidat, auth, voted, isVoting} = require('./file')
const app = express()
const ejs = require('ejs')
require('dotenv').config({ path: './backend/config/.env' })

// body parser
app.use(express.urlencoded({ extended: true }))
// pake EJS view engine
app.set('view engine', 'ejs')
app.use(express.static('public'))

// route homepage
app.get('/', (req, res) => {
  res.render('homepage', {
    title: 'homepage EvB',
  })
})

// route untuk daftar blockchain
app.get('/blocks', (req, res) => {
  res.send(getBlocks())
})

// form vote
app.get('/vote', (req, res) => {
  const kandidat = muatKandidat()
  res.render('formVoting', {
    kandidat,
    title: 'form vote',
  })
})

// post form voting
app.post('/vote', (req, res) => {
  // autentikasi (email)
  if (auth(req.body.email)) {
    // cek apakah voters sudah voting
    if(!isVoting(req.body.email)){
      // buat block baru
      newBlock({
        voter: req.body.email,
        vote: req.body.kandidat,
        origin: req.ip,
      })
      // ubah status votingg ke true
      voted(req.body.email)
      // redirect ke daftar block
      res.redirect('/blocks')
    }else{
      res.send(`user ${req.body.email} sudah melakukan voting!`)
    }
  } else {
    res.send('gagal')
  }
})

// route untuk page not found
app.use((req, res) => {
  res.status(404)
  res.send('404: page not found')
})

// menjalankan express
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `EvB listening on port : http://localhost:${process.env.HTTP_PORT}/blocks`
  )
})
