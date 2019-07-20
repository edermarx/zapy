module.exports = (err, res, type) => {
  const errorCodes = {
    'access-denied': 403,
    'unauthenticated': 401,
    'missing-data': 400,
    'user-already-exists': 403,
    'passwords-dont-match': 403,
    'user-not-found': 403,
    'wrong-password': 403,
  };

  if (!err) err = type;
  console.log(err);
  res.status(errorCodes[type] || 500).send(err);
};