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
      status: "success",
      code: 201,
      data: {
        token: newUser.token,
        email: newUser.email,
        name: newUser.name,
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

    if (!updatedUser) {
      throw handleError(404, "User Not Found");
    }

    const { email, name, id, token } = updatedUser;

    return res.status(200).json({
      status: "User data updated successfully",
      code: 201,
      data: {
        id,
        email,
        name,
        token,
      },
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
      throw handleError(404);
    }
    user.set("verify", true);
    user.verificationToken = null;

    await user.save();

    return res.status(200).json({
      status: "Success",
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
      throw handleError(400, "Invalid Email or Password");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("passwordMatch", passwordMatch);
    if (!passwordMatch) {
      throw handleError(400, "Invalid Email or Password");
    }

    if (!user.verify) {
      throw handleError(401, "email is not verifed");
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
        },
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
      throw handleError(404, "User Not Found");
    }

    const { email, name, id, token } = user;

    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        id,
        email,
        name,
        token,
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

module.exports = { register, verifyEmail, signin, currentUser, logout, update };
