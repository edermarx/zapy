const express = require('express');
const bcrypt = require('bcrypt');

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const app = express();

const Users = db.ref(`${token}/users`);

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

    if(req.body.password !== req.body.password2){
      handleError(null, res, 'passwords-dont-match');
      return;
    }
    
    const hash = await bcrypt.hash(req.body.password, 10);
    
    const data = await Users.push({
      username: req.body.username,
      password: hash,
      alias: req.body.alias,
      timestamp: new Date().getTime(),
    });

    req.session.userID = data.key;
    console.log(req.session.userID);
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// All actions bellow need a session token
app.use((req, res, next) => {
  if(!req.session.userID) {
    res.redirect('/cadastro');
    return;
  }
  next();
});

// list
// TODO: check if user is admin
app.get('/', async (req, res) => {
  try {
    const users = await Users.once('value');
    res.send(users);
  } catch (err) {
    handleError(err, res);
  }
});

// detail
app.get('/:id', async (req, res) => {
  if(req.params.id !== req.session.userID){
    handleError(null, res, 'access-denied');
    return;
  }
  try {
    const user = await Users.child(req.params.id).once('value');
    res.send(user);
  } catch (err) {
    handleError(err, res);
  }
});


// update
app.patch('/:id', async (req, res) => {
  // TODO: return if it's not the user
  try {
    await Users.child(req.params.id).update(req.body);
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// delete
app.delete('/:id', async (req, res) => {
  // TODO: return if it's not the user
  try {
    await Users.child(req.params.id).remove();
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = app;
