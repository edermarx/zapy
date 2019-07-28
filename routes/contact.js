module.exports = (Users, canAccess) => {
  // ==================== EXTERNAL IMPORTS ==================== //

  const express = require('express');
  const app = express();

  // ==================== INTERNAL IMPORTS ==================== //

  const handleErrors = require('../providers/handle-error');

  // ==================== ROUTES ==================== //

  // -------------------- LIST CONTACTS -------------------- //

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

  // -------------------- ADD CONTACT -------------------- //

  app.post('/:id', async (req, res) => {
    try {
      const access = await canAccess(req, res);
      if (!access) return;

      const user = (await Users.orderByChild('username')
        .equalTo(req.body.contact)
        .once('value')).val();

      if (!user) {
        handleErrors(null, res, 'user-not-found');
        return;
      }
      const [userID, contactUser] = Object.entries(user)[0];

      const checkUser = await Users.child(req.params.id)
        .child('contacts')
        .orderByChild('username')
        .equalTo(req.body.contact)
        .once('value');

      if (checkUser.val()) {
        handleErrors(null, res, 'contact-duplicata');
        return;
      }

      await Users.child(req.params.id).child('contacts').push({
        username: contactUser.username,
        alias: contactUser.alias,
        userID,
      });

      res.send('ok');
    } catch (err) {
      handleErrors(err, res);
    }
  });

  // -------------------- DELETE CONTACT -------------------- //

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
