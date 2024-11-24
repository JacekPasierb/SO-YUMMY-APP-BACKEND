import { Schema, model, Document, Model, Types } from "mongoose";

const emailRegexp = /^\S+@\S+\.\S+$/;

interface ISubscribe extends Document {
  owner: Types.ObjectId;
  email: string;
}

const subscribeSchema = new Schema<ISubscribe>(
  {
    owner: {
      type: Types.ObjectId,
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

const Subscribe: Model<ISubscribe> = model("subscribe", subscribeSchema);

export default Subscribe; 
export type { ISubscribe };