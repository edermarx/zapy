const express = require('express');

const app = express();

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const Messages = db.ref(`${token}/messages`);

// list messages
app.get('/:chatID', async (req, res) => {
  // TODO: canAcess?
  // TODO: trycatch
  const messages = (await Messages.child(req.params.chatID).once('value')).val();
  res.send(messages);
});

// send message
app.post('/:chatID', async (req, res) => {
  // TODO: canAcess?
  // TODO: trycatch
  await Messages.child(req.params.chatID).push({
    // sender: req.session.user,
    content: req.body.message,
    timestamp: new Date().getTime(),
  });
  res.send('ok');
});

// delete messages
app.delete('/:chatID/:messageID', async (req, res) => {
  try {
    await Messages.child(req.params.chatID).child(req.params.messageID).remove();
    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = app;