function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const error = new Error('Validation failed');
      error.status = 400;
      error.details = details;
      return next(error);
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validate };
