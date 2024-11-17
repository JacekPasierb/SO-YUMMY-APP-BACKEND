import { User, IUser } from "../models/user";
import { Types } from "mongoose";

interface UserQuery {
  email?: string;
  _id?: Types.ObjectId;
  [key: string]: any;
}

const getUserByEmail = async ({
  email,
}: {
  email: string;
}): Promise<IUser | null> => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getUserById = async (_id: Types.ObjectId): Promise<IUser | null> => {
  try {
    return await User.findById(_id);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const addUser = async ({
  email,
  password,
  name,
  verificationToken,
  token,
}: {
  email: string;
  password: string;
  name: string;
  verificationToken: string;
  token:string | null;
}): Promise<IUser | null> => {
  try {
    return await User.create({
      email,
      password,
      name,
      verificationToken,
      token,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const findUser = async (query: UserQuery): Promise<IUser | null> => {
  try {
    console.log("qqq", query);
    return await User.findOne(query);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateUser = async (
  id: Types.ObjectId,
  body: Partial<IUser>
): Promise<IUser | null> => {
  try {
    return await User.findByIdAndUpdate(id, body, { new: true });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { getUserByEmail, addUser, findUser, getUserById, updateUser };
