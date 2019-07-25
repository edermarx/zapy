module.exports = (err, res, type) => {
  const errorCodes = {
    'access-denied': 403, 
    'unauthenticated': 401, 
    'missing-data': 400,
    'user-already-exists': 400,
    'passwords-dont-match': 400,
    'user-not-found': 400,
    'wrong-password': 400,
  };

  console.log(err || type);
  res.status(errorCodes[type] || 500).send(err || type);
};