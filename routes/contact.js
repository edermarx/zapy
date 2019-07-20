module.exports = (Users, canAccess) => {
  const express = require('express');
  const app = express();

  const handleErrors = require('../providers/handle-error');

  // list
  app.get('/:id', async (req, res) => {
    try {
      const access = await canAccess(req, res);
      if (!access) return;

      const user = (await Users.child(req.params.id).once('value')).val();
      res.send(user.contacts || []);
    } catch (err) {
      handleErrors(err, res);
    }
  });

  // add
  app.post('/:id', async (req, res) => {
    try {
      const access = await canAccess(req, res);
      if (!access) return;

      const users = await Users.orderByChild('username')
        .equalTo(req.body.contact)
        .once('value');

      if (!users.val()) {
        handleError(null, res, 'user-not-found');
        return;
      }

      await Users.child(req.params.id).child('contacts').push(Object.keys(users.val())[0]);
      res.send('ok');
    } catch (err) {
      handleErrors(err, res);
    }
  });

  app.delete('/:id', async (req, res) => {
    const access = await canAccess(req, res);
    if (!access) return;
    try {
      await Users.child(req.params.id)
        .child('contacts')
        .child(req.body.contactId)
        .remove();
      res.send('ok');
    } catch (err) {
      handleErrors(err, res);
    }
  });

  return app;
};