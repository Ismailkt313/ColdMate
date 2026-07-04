"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt_1.default.genSalt(10);
        this.password = await bcrypt_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt_1.default.compare(candidatePassword, this.password);
};
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
