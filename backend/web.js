import express, { urlencoded } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import flash from 'connect-flash'
import bcrypt from 'bcryptjs'
dotenv.config({ path: './backend/config/.env' })

import {
  getBlocks,
  newBlock,
  isVoted,
  getBlock,
  getCandidatesRecap,
} from './blockchain.js'
import {
  getCandidates,
  getVoterPasswd,
  getVoterPubKey,
  getVoter,
} from './getAPI.js'
import { verify, importRsaKey } from './verification.js'

const app = express()
  .use(urlencoded({ extended: true }))
  .set('view engine', 'ejs')
  .use(express.static('public'))
  .use(
    session({
      cookie: { maxAge: 1000 * 60 * 60 },
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())

passport.serializeUser((user, done) => {
  done(null, user._id)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

// passport
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'password',
    },
    async (id, password, done) => {
      const voter = await getVoterPasswd(id)
      const isMatch = bcrypt.compareSync(password, voter.password)
      if (isMatch) {
        return done(null, voter)
      } else {
        return done(null, false)
      }
    }
  )
)

// if voter already voting
const isVoterVoted = (req, res, next) => {
  if(isVoted(req.user)){
    res.redirect('/myvote')
  }else{
    next()
  }
}

// if voter has not logged in
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    req.flash('messageFailure', 'you must logged in first!')
    res.redirect('login')
  }
}

// if voter already logged in, redirect to homepage
const hasLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/')
  } else {
    next()
  }
}

// login
app.get('/login', hasLoggedIn, async (req, res) => {
  const errorMessage = req.flash('messageFailure')
  const successMessage = req.flash('messageSuccess')
  res.render('auth/login', {
    errors: errorMessage,
    success: successMessage,
  })
})

app.post(
  '/login',
  passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: {
      type: 'messageFailure',
      message: 'wrong id or password!',
    },
    successRedirect: '/vote',
    successFlash: {
      type: 'messageSuccess',
      message: 'Welcome to EvB dashboard',
    },
  }),
  (req, res) => {}
)

// logout
app.get('/logout', (req, res) => {
  req.logout()
  req.flash('messageSuccess', 'Logged out')
  res.redirect('login')
})

// route homepage
app.get('/', isLoggedIn, (req, res) => {
  const successMessage = req.flash('messageSuccess')
  res.render('homepage', {
    title: 'homepage EvB',
    successMessage,
  })
})

// route untuk daftar blockchain
app.get('/blocks', (req, res) => {
  const blocks = getBlocks()
  res.render('blocks', {
    title: 'blocks',
    blocks,
  })
})

// form vote
app.get('/vote', isLoggedIn, isVoterVoted, async (req, res) => {
  const candidate = await getCandidates()
  const voter = await getVoter(req.user)
  const errorFlash = req.flash('errorMessage')
  const successFlash = req.flash('successMessage')
  res.render('formVoting', {
    candidate,
    title: 'form vote',
    voter,
    errorFlash,
    successFlash,
  })
})

// post form voting
// cek apakah signature terverifikasi
// cek apakah voter sudah melakukan voting
app.post('/vote', isLoggedIn, async (req, res) => {
  const voterPubkey = await getVoterPubKey(req.user)
  const pubkey = await importRsaKey(voterPubkey.public_key)
  const isVerified = await verify(
    pubkey,
    req.body.signature,
    req.body.candidateID
  )
  if (isVerified) {
    if (!isVoted(req.body.voterID)) {
      newBlock(req.body)
      req.flash('successMessage', 'voting sukses!')
      res.redirect('/myvote')
    } else {
      req.flash('errorMessage', 'anda sudah melakukan voting!')
      res.redirect('/vote')
    }
  } else {
    req.flash('errorMessage', 'voting gagal!')
    res.redirect('/vote')
  }
})

// halaman my vote
app.get('/myvote', isLoggedIn, async (req, res) => {
  const voter = await getVoter(req.user)
  const voting = getBlock(req.user)
  res.render('myvote', {
    title: 'My Vote',
    voter,
    voting,
  })
})

// halaman rekapitulasi
app.get('/recapitulation', async (req, res) => {
  const recap = await getCandidatesRecap()
  res.render('recapitulation', {
    title: 'recapitulation',
    recap,
  })
})

// route untuk page not found
app.use((req, res) => {
  res.status(404)
  res.send('404: page not found')
})

// menjalankan express
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `EvB listening on port : http://localhost:${process.env.HTTP_PORT}`
  )
})
