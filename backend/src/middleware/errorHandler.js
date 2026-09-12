function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.status ? err.message : 'Internal server error';

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.name === 'ValidationError' && !err.status) {
    status = 400;
    message = err.message;
  }

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message, details: err.details });
}

module.exports = { errorHandler };
