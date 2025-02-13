import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { addUser, findUser, getUserById, updateUser } from "../services/user";

import handleError from "../utils/handleErrors";
import { IUser } from "../models/user";
import { sendVerificationEmail } from "../utils/emailService";
import multer from "multer";

dotenv.config();

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const checkEmail = await findUser({ email });
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
    const userId = (req.user as IUser)._id;

    if (req.fileValidationError) {
      res.status(400).json({ error: req.fileValidationError });
      return;
    }

    const updatedUser = await updateUser(userId, req.body);

    if (!updatedUser) {
      res.status(500).json({ message: "Failed to update user" });
      return;
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
    // if (
    //   error instanceof multer.MulterError &&
    //   error.code === "LIMIT_FILE_SIZE"
    // ) {
    //   res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    //   return;
    // }
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
      throw handleError(500, "Failed to update user");
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
    const user = await findUser({ verificationToken });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const update = await updateUser(user._id, {
      verify: true,
      verificationToken: null,
    });

    if (!update) {
      res.status(500).json({ message: "Failed to update user" });
      return;
    }

    res.redirect(`https://so-yummy-jack.netlify.app/signin?verified=true`);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await findUser({ email });
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

    await updateUser(user._id, { token });

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
    const user = await findUser({ email });

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
    const clearToken = await updateUser(_id, { token: null });

    if (!clearToken) {
      throw handleError(
        404,
        "Failed to logout: User not found or update unsuccessful"
      );
    }
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
