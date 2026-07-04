"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const errors_1 = require("../../../errors");
const jwt_utils_1 = require("../../../utils/jwt.utils");
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(userData) {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new errors_1.BadRequestError("Email is already registered");
        }
        const newUser = await this.userRepository.create(userData);
        const payload = {
            id: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
        };
        const accessToken = jwt_utils_1.JwtUtils.generateAccessToken(payload);
        const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken(payload);
        return {
            user: this.formatUser(newUser),
            accessToken,
            refreshToken,
        };
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = jwt_utils_1.JwtUtils.generateAccessToken(payload);
        const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken(payload);
        return {
            user: this.formatUser(user),
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(token) {
        const payload = jwt_utils_1.JwtUtils.verifyRefreshToken(token);
        const user = await this.userRepository.findById(payload.id);
        if (!user) {
            throw new errors_1.UnauthorizedError("User not found or session expired");
        }
        const newPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const newAccessToken = jwt_utils_1.JwtUtils.generateAccessToken(newPayload);
        return {
            accessToken: newAccessToken,
        };
    }
    async getCurrentUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        return this.formatUser(user);
    }
    async updateProfile(id, profileData) {
        if (profileData.password) {
            delete profileData.password;
        }
        const updatedUser = await this.userRepository.update(id, profileData);
        if (!updatedUser) {
            throw new errors_1.NotFoundError("User not found");
        }
        return this.formatUser(updatedUser);
    }
    async changePassword(id, currentPass, newPass) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        const isMatch = await user.comparePassword(currentPass);
        if (!isMatch) {
            throw new errors_1.BadRequestError("Incorrect current password");
        }
        user.password = newPass;
        await user.save();
    }
    formatUser(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }
}
exports.AuthService = AuthService;
