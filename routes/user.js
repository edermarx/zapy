const express = require('express');
const bcrypt = require('bcrypt');

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const app = express();

const Users = db.ref(`${token}/users`);

const canAccess = (req, res) => new Promise(async (resolve, reject) => {
  try {
    // Only the user and admin can see user data 
    const user = await Users.child(req.session.userID).once('value');
    if (req.params.id !== req.session.userID && !user.val().admin) {
      handleError(null, res, 'access-denied');
      resolve(false);
    }
    resolve(true);
  } catch (err) {
    reject(err);
  }
});

// create
app.post('/', async (req, res) => {
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

// login
app.post('/login', async (req, res) => {
  const users = await Users.orderByChild('username')
    .equalTo(req.body.username)
    .once('value');

  if (!users.val()) {
    handleError(null, res, 'username-invalid');
    return;
  }

  const user = Object.values(users.val())[0]; // get first property of the object
  
  const match = await bcrypt.compare(req.body.password, user.password);

  if(match){
    req.session.userID = Object.keys(users.val())[0];
    res.send('ok');
    return;
  }

  handleError(null, res, 'wrong-password');
});

// All actions bellow need a session token
app.use((req, res, next) => {
  if (!req.session.userID) {
    res.redirect('/cadastro');
    return;
  }
  next();
});

// list
app.get('/', async (req, res) => {
  // Only admin can list all users
  const user = await Users.child(req.session.userID).once('value');
  if (!user.val().admin) {
    handleError(null, res, 'access-denied');
    return;
  }
  try {
    const users = await Users.once('value');
    res.send(users);
  } catch (err) {
    handleError(err, res);
  }
});

// detail
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


// update
app.patch('/:id', async (req, res) => {
  const access = await canAccess(req, res);
  if (!access) return;

  try {
    await Users.child(req.params.id).update(req.body);
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// delete
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

module.exports = app;
