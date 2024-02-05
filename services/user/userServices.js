const User = require("../../models/userModel");

const getUserByEmail = ({ email }) => {
  try {
    return User.findOne({ email });
  } catch (error) {
    return false;
  }
};
const getUserById = (_id) => {
  try {
    return User.findById(_id);
  } catch (error) {
    return false;
  }
};

const addUser = ({ email, password, name, verificationToken, token }) => {
  try {
    return User.create({
      email,
      password,
      name,
      verificationToken,
      token,
    });
  } catch (error) {
    return false;
  }
};

const findUser = async (query) => {
  try {
    return await User.findOne(query);
  } catch (error) {
    console.error(error.message);
  }
};

const updateUser = (email, body) => {
  try {
    return User.findByIdAndUpdate(email, body, { new: true });
  } catch (err) {
    return false;
  }
};

module.exports = { getUserByEmail, addUser, findUser, getUserById, updateUser };
