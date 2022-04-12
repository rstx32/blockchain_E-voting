import express, { urlencoded } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import flash from 'connect-flash'
import bcrypt from 'bcryptjs'
import { net } from './p2p.js'
import expressLayouts from 'express-ejs-layouts'
dotenv.config({ path: './config/.env' })

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
  .use(expressLayouts)
  .use(express.static('public'))
  .use(
    session({
      cookie: { maxAge: 1000 * 60 * 60 },
      secret: process.env.SECRET_SESSION,
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

// p2p mesh network
await net.join()

// if voter already voting, redirect to myvote
const isVoterVoted = (req, res, next) => {
  if (isVoted(req.user)) {
    req.flash('errorMessage', 'You were already vote!')
    res.redirect('/myvote')
  } else {
    next()
  }
}

// if voter has not logged in
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    req.flash('messageFailure', 'You must logged in first!')
    res.redirect('login')
  }
}

// if voter already logged in, redirect to homepage
// for login page purpose only
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
    layout: 'auth/login',
    flashMessage: {errorMessage,successMessage},
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
    successRedirect: '/',
    successFlash: {
      type: 'messageSuccess',
      message: 'Welcome to EvB dashboard!',
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
  res.redirect('/profile')
})

function paginator(array, queryPage, queryLimit) {
  let page = Number(queryPage),
    limit = Number(queryLimit),
    offset = (page - 1) * limit,
    paginatedItems = array.slice(offset).slice(0, queryLimit),
    totalPages = Math.ceil(array.length / limit)

  return {
    page: page,
    limit: limit,
    hasPrevPage: page - 1 ? true : false,
    hasNextPage: totalPages > page ? true : false,
    total: array.length,
    totalPages: totalPages,
    data: paginatedItems,
  }
}

// route untuk daftar blockchain
app.get('/blocks', isLoggedIn, (req, res) => {
  // if query is empty, then add default query
  if (Object.keys(req.query).length === 0) {
    req.query = {
      limit: 5,
      page: 1,
    }
  }

  const blocks = getBlocks()
  const result = paginator(blocks, req.query.page, req.query.limit)
  const user = req.user

  res.render('blocks', {
    layout: 'layouts/main-layout',
    title: 'Blocks',
    user,
    blocks: result,
  })
})

// profile page
app.get('/profile', isLoggedIn, async (req, res) => {
  const voter = await getVoter(req.user)
  const user = req.user

  res.render('profile', {
    layout: 'layouts/main-layout',
    title: 'My Profile',
    user,
    voter,
  })
})

// form vote
app.get('/vote', isLoggedIn, isVoterVoted, async (req, res) => {
  const candidate = await getCandidates()
  const voter = await getVoter(req.user)
  const user = req.user
  const url = process.env.API_URL

  res.render('vote', {
    layout: 'layouts/main-layout',
    title: 'Vote Now!',
    user,
    candidate,
    voter,
    url,
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
  const voting = getBlock(req.user)
  const successMessage = req.flash('successMessage')
  const errorMessage = req.flash('errorMessage')
  const user = req.user

  res.render('myvote', {
    layout: 'layouts/main-layout',
    title: 'My Vote',
    user,
    voting,
    flashMessage: {successMessage, errorMessage}
  })
})

// halaman rekapitulasi
app.get('/recap', isLoggedIn, async (req, res) => {

  const recap = await getCandidatesRecap()
  const user = req.user
  const url = process.env.API_URL

  res.render('recap', {
    layout: 'layouts/main-layout',
    title: 'Recapitulation',
    user,
    recap,
    url,
  })
})

// list nodes
app.get('/nodes', isLoggedIn, (req, res) => {
  const user = req.user
  const nodes = net.nodes
  const thisNode = net.networkId

  res.render('nodes', {
    layout: 'layouts/main-layout',
    title: 'Node List',
    user,
    nodes,
    thisNode,
  })
})

// route untuk page not found
app.use((req, res) => {
  res.status(404)
  res.render('404', {
    layout: '404',
    title: '404 : page not found'
  })
})

// running express
app.listen(process.env.HTTP_PORT, () => {
  console.log(`EvB listening on port : http://localhost:${process.env.HTTP_PORT}/`)
})
