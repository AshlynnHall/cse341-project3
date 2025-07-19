const express = require('express');
const { MongoClient } = require('mongodb');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Redirect HTTP to HTTPS (for Render)
app.use((req, res, next) => {
  if (
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Session and Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: 'fitness', 
    collectionName: 'sessions'
  })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Auth routes
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/whoami', (req, res) => {
  res.json({ user: req.user });
});

app.get('/auth/failure', (req, res) => {
  res.send('GitHub authentication failed');
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

// Auth middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Protect POST/PUT/DELETE routes for workouts, exercises, goals
app.use(['/workouts', '/exercises', '/goals'], (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return ensureAuthenticated(req, res, next);
  }
  next();
});

// Register routers
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const workoutsRoutes = require('./routes/workouts');
app.use('/workouts', workoutsRoutes);

const exercisesRoutes = require('./routes/exercises');
app.use('/exercises', exercisesRoutes);

const goalsRoutes = require('./routes/goals');
app.use('/goals', goalsRoutes);

// Swagger setup
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Home route
app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running!');
});

// MongoDB connection and server start
const client = new MongoClient(process.env.MONGODB_URI);

async function start() {
  try {
    await client.connect();
    app.locals.db = client.db('fitness');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Connected to DB and listening on ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to DB', err);
  }
}

start();