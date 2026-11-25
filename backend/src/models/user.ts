import mongoose from "mongoose";
import { collectionName } from "../utils/config";

export type UserRole = "owner" | "walker";

export interface UserData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new mongoose.Schema<UserData>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["owner", "walker"],
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: {
      id?: string;
      _id?: mongoose.Types.ObjectId;
      __v?: number;
      passwordHash?: string;
    }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model<UserData>("User", userSchema, collectionName("users"));

export default User;