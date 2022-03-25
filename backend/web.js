import express, { urlencoded } from 'express'
import session from 'express-session'
import { getBlocks, newBlock } from './blockchain.js'
import { getCandidates, getVoterPasswd, getVoterPubKey, getVoter } from './getAPI.js'
import { verify, importRsaKey } from './verification.js'
import dotenv from 'dotenv'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import flash from 'connect-flash'
import bcrypt from 'bcryptjs'
dotenv.config({ path: './backend/config/.env' })

const app = express()
  .use(urlencoded({ extended: true }))
  .set('view engine', 'ejs')
  .use(express.static('public'))
  .use(
    session({
      cookie: { maxAge: 1000 * 60 * 60 },
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
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
  res.send(getBlocks())
})

// form vote
app.get('/vote', async (req, res) => {
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
app.post('/vote', async (req, res) => {
  const voterPubkey = await getVoterPubKey(req.body.voterID)
  const pubkey = await importRsaKey(voterPubkey.public_key)
  const isVerified = await verify(
    pubkey,
    req.body.signature,
    req.body.candidateID
  )

  if (isVerified) {
    req.flash('successMessage', 'voting sukses!')
    res.redirect('/vote')
  } else {
    req.flash('errorMessage', 'voting gagal!')
    res.redirect('/vote')
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
    `EvB listening on port : http://localhost:${process.env.HTTP_PORT}`
  )
})
