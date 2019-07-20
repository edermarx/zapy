const express = require('express');
const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const app = express();

const Users = db.ref(`${token}/users`);

// list
// TODO: check if user is admin
app.get('/', async (req, res) => {
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
    // TODO: check if user already exists
    // TODO: encrypt and save user password
    // TODO: start user session
    // TODO: check if passwords match
    const data = await Users.push(req.body);
    res.send(data.key);
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
