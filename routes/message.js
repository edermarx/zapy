const express = require('express');
const atob = require('atob');

const app = express();

const { db, token } = require('../providers/database');
const handleError = require('../providers/handle-error');

const Messages = db.ref(`${token}/messages`);
const Users = db.ref(`${token}/users`);

const canAccess = (req, res) => new Promise(async (resolve, reject) => {
  if (process.env.ENV_MODE !== 'production') resolve(true);
  // TODO: remove this line ^^ after development
  try {
    // Only the users of the chat and admin can see the messages
    const user = await Users.child(req.session.userID).once('value');
    const conversation = atob(req.params.chatID).split('(*-*)');

    if (
      conversation.indexOf(req.session.userID) === -1
      && !user.val().admin
      && process.env.ENV_MODE !== 'development'
    ) {
      handleError(null, res, 'access-denied');
      resolve(false);
    }

    resolve(true);
  } catch (err) {
    reject(err);
  }
});

// list messages
app.get('/:chatID', async (req, res) => {
  try {
    const access = await canAccess(req, res);
    if (!access) return;

    const messages = (await Messages.child(req.params.chatID).once('value')).val();
    res.send(messages);
  } catch (err) {
    handleError(err, res);
  }
});

// send message
app.post('/:chatID', async (req, res) => {
  try {
    const access = await canAccess(req, res);
    if (!access) return;

    await Messages.child(req.params.chatID).push({
      sender: req.session.userID,
      content: req.body.message,
      timestamp: new Date().getTime(),
    });

    const conversation = atob(req.params.chatID).split('(*-*)');
    conversation.forEach((userInvolved) => {
      Users.child(userInvolved).child('hasMessage').push(req.params.chatID);
    });

    conversation.filter(userInvolved => userInvolved !== req.session.userID)
      .forEach(async (otherUser) => {
        const username = (await Users.child(req.session.userID).child('username').once('value')).val();
        await Users.child(otherUser).child('contacts').push({
          username,
          userID: req.session.userID,
        });
      });

    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

// delete message
app.delete('/:chatID/:messageID', async (req, res) => {
  try {
    const access = await canAccess(req, res);
    if (!access) return;

    const messageObj = await Messages.child(req.params.chatID).child(req.params.messageID);
    const message = await messageObj.once('value');
    if (message.val().sender !== req.session.userID) {
      handleError(null, res, 'access-denied');
      return;
    }

    await messageObj.remove();

    res.send('ok');
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = app;
