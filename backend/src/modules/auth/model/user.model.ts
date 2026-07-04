import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types";

export interface IUserDocument extends Omit<IUser, "_id" | "password">, Document {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    portfolio: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    preferredCommunication: {
      type: String,
      enum: ["email", "phone", "slack"],
      default: "email",
    },
    followUpEnabled: {
      type: Boolean,
      default: true,
    },
    followUpAfterDays: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUserDocument>("User", UserSchema);
