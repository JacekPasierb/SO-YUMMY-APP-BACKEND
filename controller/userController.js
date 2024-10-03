const bcrypt = require("bcrypt");
require("dotenv").config();
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");

const {
  getUserByEmail,
  addUser,
  findUser,
  getUserById,
  updateUser,
} = require("../services/user/userServices");

const { send } = require("../utils/sendGrid");
const handleError = require("../utils/handleErrors");
const User = require("../models/userModel");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const checkEmail = await getUserByEmail({ email });
    if (checkEmail) {
      throw handleError(409, "Email is already in use");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await addUser({
      email,
      password: hashPassword,
      name,
      verificationToken: nanoid(),
      token: null,
    });

    const emailToSend = {
      to: newUser.email,
      subject: "SO YUMMY APP email verification",
      html: `
       <div style="text-align: center;">
       <h1>SO YUMMY APP</h1>
       <p style="font-size:16px;">Verify your e-mail address by clicking on this link - <a href="https://so-yummy-app-backend.vercel.app/api/users/verify/${newUser.verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Verification Link</strong></a></p>
       </div>
       `,
    };

    send(emailToSend);

    return res.status(201).json({
      status: "Created",
      code: 201,
      message: "Register Success !",
      data: {
        token: newUser.token,
        user: {
          email: newUser.email,
          name: newUser.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const updatedUser = await updateUser(_id, req.body);

    const { name, avatar } = updatedUser;

    return res.status(200).json({
      status: "User data updated successfully",
      code: 200,
      data: {
        user: {
          name,
          avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const toogleTheme = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const updatedUser = await updateUser(_id, req.body);

    const { isDarkTheme} = updatedUser;

    return res.status(200).json({
      status: "User data updated successfully",
      code: 200,
      data: {
        user: {
          isDarkTheme
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw handleError(404);
    }
    user.set("verify", true);
    user.verificationToken = null;

    await user.save();

    return res.status(200).json({
      status: "OK",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail({ email });
    if (!user) {
      throw handleError(401, "Invalid Email or Password");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw handleError(401, "Invalid Email or Password");
    }

    if (!user.verify) {
      throw handleError(403, "email is not verifed");
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });
    user.token = token;
    await user.save();

    res.status(200).json({
      status: "OK",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          userId: user._id,
          isDarkTheme: user.isDarkTheme,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail({ email });

    if (!user) {
      throw handleError(404, "User not found");
    }

    if (user.verify) {
      throw handleError(400, "Email is already verified");
    }

    const emailToSend = {
      to: user.email,
      subject: "SO YUMMY APP email verification",
      html: `
       <div style="text-align: center;">
       <h1>SO YUMMY APP</h1>
       <p style="font-size:16px;">Verify your e-mail address by clicking on this link - <a href="https://so-yummy-app-backend.vercel.app/api/users/verify/${user.verificationToken}" target="_blank" rel="noopener noreferrer nofollow"><strong>Verification Link</strong></a></p>
       </div>
       `,
    };

    await send(emailToSend);

    return res.status(200).json({
      status: "OK",
      message: "Verification email sent!",
    });
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    const _id = req.user;

    const { email, name, id, token, avatar } = await getUserById(_id);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        userId: id,
        email,
        name,
        token,
        avatar,
        isDarkTheme,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await updateUser(_id, { token: null });
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  signin,
  currentUser,
  logout,
  update,
  resendVerificationEmail,
  toogleTheme,
};
