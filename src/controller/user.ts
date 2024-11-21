import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import {
  getUserByEmail,
  addUser,
  findUser,
  getUserById,
  updateUser,
} from "../services/user";

import handleError from "../utils/handleErrors";
import { User, IUser } from "../models/user";
import { sendVerificationEmail } from "../utils/emailService";

dotenv.config();

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const checkEmail = await getUserByEmail({ email });
    if (checkEmail) {
      return next(handleError(409, "Email is already in use"));
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await addUser({
      email,
      password: hashPassword,
      name,
      verificationToken: nanoid(),
      token: null,
    });
    if (!newUser) {
      throw handleError(500, "Failed to create user");
    }

    if (!newUser.verificationToken) {
      throw handleError(500, "Verification token generation failed");
    }

    const emailToSend = {
      to: newUser.email,
      verificationToken: newUser.verificationToken,
    };

    sendVerificationEmail(emailToSend);

    res.status(201).json({
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
    return;
  } catch (error) {
    next(error);
  }
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("req.user",req.user);
    
    if (!req.user) {
      return next(handleError(401, "Unauthorized"));
    }
    const userId = (req.user as IUser)._id;
    console.log("userId", userId);
    console.log("body", req.body);

      // Sprawdź, czy wystąpił błąd multer
      if (req.fileValidationError) {
         res.status(400).json({ error: req.fileValidationError });
         return
        }

    const updatedUser = await updateUser(userId, req.body);
    console.log("updatedUser", updatedUser);

    if (!updatedUser) {
      throw handleError(404, "User not found");
    }

    const { name, avatar } = updatedUser;

    res.status(200).json({
      status: "User data updated successfully",
      code: 200,
      data: {
        user: {
          name,
          avatar,
        },
      },
    });
    return;
  } catch (error) {
    console.error("Error during update:", error);
    next(error);
  }
};

const toogleTheme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id } = req.user as IUser;
    const { isDarkTheme } = req.body;

    const updatedUser = await updateUser(_id, { isDarkTheme });

    if (!updatedUser) {
      throw handleError(404, "User not found");
    }

    res.status(200).json({
      status: "User data updated successfully",
      code: 200,
      data: {
        isDarkTheme: updatedUser.isDarkTheme,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw handleError(404);
    }
    user.set("verify", true);
    user.verificationToken = null;

    await user.save();

    res.status(200).json({
      status: "OK",
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
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

    const token = jwt.sign(payload, process.env.SECRET as string, {
      expiresIn: "1h",
    });
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

const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail({ email });

    if (!user) {
      throw handleError(404, "User not found");
    }

    if (user.verify) {
      throw handleError(400, "Email is already verified");
    }

    if (!user.verificationToken) {
      throw handleError(500, "Verification token generation failed");
    }

    const emailToSend = {
      to: user.email,
      verificationToken: user.verificationToken,
    };

    await sendVerificationEmail(emailToSend);

    res.status(200).json({
      status: "OK",
      message: "Verification email sent!",
    });
    return;
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser)._id;

    const user = await getUserById(userId);

    if (!user) {
      throw handleError(404, "User not found");
    }

    const { email, name, id, token, avatar, isDarkTheme } = user;

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

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.user as IUser;
    await updateUser(_id, { token: null });
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

export {
  register,
  verifyEmail,
  signin,
  currentUser,
  logout,
  update,
  resendVerificationEmail,
  toogleTheme,
};
