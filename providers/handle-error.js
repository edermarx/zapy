module.exports = (err, res, type) => {
  if (!err) err = type;
  console.log(err);
  res.send(err);
};