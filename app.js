// ==================== EXTERNAL IMPORTS ==================== //

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
require('dotenv').config();

// ==================== INTERNAL IMPORTS ==================== //

const handleError = require('./providers/handle-error');

// ==================== GLOBAL VARIABLES ==================== //

const app = express();

// ==================== MIDDLEWARE ==================== //

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// use ejs template tag engine
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// serving static files
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// ==================== USER SESSION ==================== //

const sess = {
  secret: process.env.SESSION_TOKEN,
  resave: false,
  saveUninitialized: true,
  cookie: {},
};

// if (process.env.ENV_MODE === 'production') {
//   app.set('trust proxy', 1); // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }
// TODO: uncomment this ^^ after development

app.use(expressSession(sess));

// ==================== FUNCTIONS ==================== //

// returns the full path of the passed view
const getViewPath = view => path.join(__dirname, `views/${view}/${view}.ejs`);

// ==================== VIEWS AND ROUTES ==================== //

app.get('/cadastro', (req, res) => {
  res.render(getViewPath('register'));
});

app.get('/login', (req, res) => {
  res.render(getViewPath('login'));
});

app.use('/api/user', require('./routes/user'));

// -------------------- ACCESS CONTROL -------------------- //

app.use((req, res, next) => {
  if (!req.session.userID && process.env.ENV_MODE !== 'development') {
    if (req.method === 'GET') {
      res.redirect('/login');
      return;
    }
    handleError(null, res, 'unauthenticated');
    return;
  }
  next();
});

// ------------------------------------------------------- //


app.use('/api/message', require('./routes/message'));

app.get('/', (req, res) => {
  res.render(getViewPath('home'));
});

app.get('/chat', (req, res) => {
  res.render(getViewPath('chat'));
});

// ==================== START SERVER ==================== //

app.listen(process.env.PORT || 3000, () => {
  console.log('READY');
});

// ====================================================== //
