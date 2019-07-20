// ==================== EXTERNAL IMPORTS ==================== //

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
require('dotenv').config();

// ==================== INTERNAL IMPORTS ==================== //

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

// ==================== USER SESSION ==================== //

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// ==================== FUNCTIONS ==================== //

// returns the full path of the passed view
const getViewPath = view => path.join(__dirname, `views/${view}/${view}.ejs`);

// ==================== ROUTES ==================== //

app.use('/api/user', require('./routes/user'));

// ==================== VIEWS ==================== //

app.get('/', (req, res) => {
  res.render(getViewPath('home'));
});

app.get('/cadastro', (req, res) => {
  res.render(getViewPath('register'));
});

app.get('/login', (req, res) => {
  res.render(getViewPath('login'));
});

app.get('/chat', (req, res) => {
  res.render(getViewPath('chat'));
});

// ==================== START SERVER ==================== //

app.listen(process.env.PORT || 3000, () => {
  console.log('READY');
});

// ====================================================== //