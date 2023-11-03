const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const { registerSchema } = require("../schemas/userSchema");
const { getUserByEmail, addUser, findUser } = require("../services/user/userServices");
const { handle409, handle201, handle404, handle200 } = require("../utils/handleErrors");
const { send } = require("../utils/sendGrid");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "Bad Request",
        code: 400,
        ResponseBody: {
          message: `Input data validation error: ${error.message}`,
        },
      });
    }
    const checkEmail = await getUserByEmail({ email });
    if (checkEmail) {
      return handle409(res, "Email is already in use");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await addUser({
      email,
      password: hashPassword,
      name,
      verificationToken: nanoid(),
      token: null,
    });
    send(newUser.email, newUser.verificationToken);

    handle201(res, "Registration successful", {
      token: newUser.token,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  try {
      const { verificationToken } = req.params;
      console.log(verificationToken);
      const user = await findUser({ verificationToken } );
console.log("uuuu",user);
    if (!user) {
      return handle404(res);
    }
    user.set("verify", true);
      user.verificationToken = null;
      console.log("end",user);
      await user.save();
      console.log("działa");
    return handle200(res, "Success")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, verifyEmail };
