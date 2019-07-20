const express = require('express');
const { db, token } = require('../providers/database'); 

const app = express();

const users = db.ref(`${token}/users`);

// list
app.get('/', (req, res) => {
  users.once('value').then((data) => {
    res.send(data.val());
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
});

// detail
app.get('/:id', (req, res) => {
  users.ref(req.params.id).once('value').then((data) => {
    res.send('ok');
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
});

// create
app.post('/', (req, res) => {
  // TODO: check if user already exists
  // TODO: encrypt and save user password
  users.push(req.body).then((data) => {
    res.send('ok');
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
});

// update
app.patch('/:id', (req, res) => {
  users.ref(req.params.id).update(req.body).then((data) => {
    res.send(data.val());
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
});

// update
app.delete('/:id', (req, res) => {
  users.ref(req.params.id).remove().then((data) => {
    res.send(data.val());
  }).catch((err) => {
    console.log(err);
    res.send(err);
  });
});

module.exports = app;
