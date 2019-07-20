const express = require('express');
const bcrypt = require('bcrypt');

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const app = express();

const Users = db.ref(`${token}/users`);

// list
// TODO: check if user is admin
app.get('/', async (req, res) => {
  console.log(req.session.username);
  try {
    const users = await Users.once('value');
    res.send(users.val());
  } catch (err) {
    handleError(err, res);
  }
});

// detail
app.get('/:id', (req, res) => {
  // TODO: return if it's not the user
  try {
    const user = Users.ref(req.params.id).once('value');
    res.send(user.val());
  } catch (err) {
    handleError(err, res);
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

    if(req.body.password !== req.body.password2){
      handleError(null, res, 'passwords-dont-match');
      return;
    }
    
    const hash = await bcrypt.hash(req.body.password, 10);
    
    await Users.push({
      username: req.body.username,
      password: hash,
      alias: req.body.alias,
      timestamp: new Date().getTime(),
    });

    req.session.user = req.body.username;
    res.send('ok');
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
