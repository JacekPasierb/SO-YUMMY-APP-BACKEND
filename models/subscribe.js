const { Schema, model } = require("mongoose");


const emailRegexp = /^\S+@\S+\.\S+$/;

const subscribeSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
  },
  { versionKey: false }
);



const Subscribe = model("subscribe", subscribeSchema);

module.exports = Subscribe;
