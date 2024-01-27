const Subscribe = require("../models/subscribe");

const getSubscribeByOwner = ({ owner }) => {
  try {
    return Subscribe.findOne({ owner });
  } catch (error) {
    return false;
  }
};

const getSubscribeByEmail = ({ email }) => {
  try {
    return Subscribe.findOne({ email });
  } catch (error) {
    return false;
  }
};

const createSubscribe = ({ body, owner }) => {
  try {
    return Subscribe.create({
      ...body,
      owner,
    });
  } catch (error) {
    return false;
  }
};

module.exports = { getSubscribeByOwner, getSubscribeByEmail, createSubscribe };
