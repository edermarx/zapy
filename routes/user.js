// ==================== EXTERNAL IMPORTS ==================== //

const express = require('express');
const bcrypt = require('bcrypt');

// ==================== INTERNAL IMPORTS ==================== //

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

// ==================== GLOBAL VARIABLES ==================== //

const app = express();

const Users = db.ref(`${token}/users`);

// ==================== FUNCTIONS ==================== //

const canAccess = (req, res) => new Promise(async (resolve, reject) => {
  if (process.env.ENV_MODE !== 'production') resolve(true);
  // TODO: remove this line ^^ after development
  try {
    // Only the user and admin can see user data
    const user = await Users.child(req.session.userID).once('value');
    if (
      req.params.id !== req.session.userID
      && !user.val().admin
      && process.env.ENV_MODE === 'production'
    ) {
      handleError(null, res, 'access-denied');
      resolve(false);
    }
    resolve(true);
  } catch (err) {
    reject(err);
  }
});

// ==================== ROUTES ==================== //

// -------------------- REGISTER -------------------- //

app.post('/', async (req, res) => {
  if (
    !req.body.username
    || !req.body.password
    || !req.body.password2
    || !req.body.alias
  ) {
    handleError(null, res, 'missing-data');
    return;
  }
  try {
    const userCheck = await Users.orderByChild('username')
      .equalTo(req.body.username)
      .once('value');

    if (userCheck.val()) {
      handleError(null, res, 'user-already-exists');
      return;
    }

    if (req.body.password !== req.body.password2) {
      handleError(null, res, 'passwords-dont-match');
      return;
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    const data = await Users.push({
      username: req.body.username,
      password: hash,
      alias: req.body.alias,
      admin: false,
      timestamp: new Date().getTime(),
    });

    req.session.userID = data.key;
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// -------------------- LOGIN -------------------- //

app.post('/login', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    handleError(null, res, 'missing-data');
    return;
  }
  try {
    const users = await Users.orderByChild('username')
      .equalTo(req.body.username)
      .once('value');

    if (!users.val()) {
      handleError(null, res, 'user-not-found');
      return;
    }

    const user = Object.values(users.val())[0]; // get first object of the object

    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      req.session.userID = Object.keys(users.val())[0];
      res.send('ok');
      return;
    }

    handleError(null, res, 'wrong-password');
  } catch (err) {
    handleError(err, res);
  }
});

// -------------------- ACCESS CONTROL -------------------- //

app.use((req, res, next) => {
  if (!req.session.userID && process.env.ENV_MODE !== 'development') {
    handleError(null, res, 'unauthenticated');
    return;
  }
  next();
});
// All routes bellow need a session token

// -------------------- CONTACTS -------------------- //

app.use('/contact', require('./contact')(Users, canAccess, handleError));

// -------------------- LIST USERS -------------------- //

app.get('/', async (req, res) => {
  // Only admin can list all users
  try {
    const user = await Users.child(req.session.userID).once('value');
    if (!user.val().admin) {
      handleError(null, res, 'access-denied');
      return;
    }
    const users = await Users.once('value');
    res.send(users);
  } catch (err) {
    handleError(err, res);
  }
});

// -------------------- DETAIL USER -------------------- //

app.get('/:id', async (req, res) => {
  const access = await canAccess(req, res);
  if (!access) return;

  try {
    const user = await Users.child(req.params.id).once('value');
    res.send(user);
  } catch (err) {
    handleError(err, res);
  }
});

// -------------------- EDIT USER -------------------- //

app.patch('/:id', async (req, res) => {
  const access = await canAccess(req, res);
  if (!access) return;

  if (!req.body) {
    handleError(null, res, 'missing-data');
    return;
  }

  try {
    await Users.child(req.params.id).update(req.body);
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// -------------------- DELETE USER -------------------- //

app.delete('/:id', async (req, res) => {
  const access = await canAccess(req, res);
  if (!access) return;

  try {
    await Users.child(req.params.id).remove();
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// ==================== EXPORT ==================== //

module.exports = app;

// ================================================ //
