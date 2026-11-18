module.exports = (error, req, res, next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ error: error.message || 'Internal server error' });
};
