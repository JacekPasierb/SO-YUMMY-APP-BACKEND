const bcrypt = require("bcrypt");
require("dotenv").config();
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const { registerSchema, signinSchema } = require("../schemas/userSchema");
const {
  getUserByEmail,
  addUser,
  findUser,
} = require("../services/user/userServices");
const {
  handle409,
  handle201,
  handle404,
  handle200,
  handle400,
  handle401,
} = require("../utils/handleErrors");
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

    const user = await findUser({ verificationToken });

    if (!user) {
      return handle404(res);
    }
    user.set("verify", true);
    user.verificationToken = null;

    await user.save();

    return handle200(res, "Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "Bad Request",
        code: 400,
        ResponseBody: {
          message: `Input data validation error: ${error.message}`,
        },
      });
    }

    const user = await getUserByEmail({ email });
    if (!user) {
      return handle400(res, "Invalid Email or Password");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("passwordMatch", passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    if (!user.verify) {
      return handle401(res, "email is not verifed");
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    handle200(res, `Welcome ${user.name}`, {
      token,
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    const _id = req.user;

    const user = await getUserById(_id);
    if (!user) {
      return handle404(res, "User Not Found");
    }

    const { email, name,  id, token } = user;
    handle201(res, "", {
      id,
      email,
      name,
      
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, signin, currentUser };
