const passport = require("passport");
const handleError = require("../utils/handleErrors");

const auth = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log("authorziation0",authorization);
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err || user.token !== authorization.split(" ")[1]) {
      console.log("token",user.token);
      throw handleError(401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
