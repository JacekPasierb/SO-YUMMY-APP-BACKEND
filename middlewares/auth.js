const passport = require("passport");
const handleError = require("../utils/handleErrors");

const auth = (req, res, next) => {
  const authorization = req.headers.authorization;
  log("dupaa");
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err || user.token !== authorization.split(" ")[1]) {
      throw handleError(401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
