const handleError = require("../utils/handleErrors");

const validateBody = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(handleError(400, error.message));
    }
    next();
  };

  return func;
};

module.exports = validateBody;
