"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const api_response_utils_1 = require("../../../utils/api-response.utils");
const errors_1 = require("../../../errors");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.COOKIE_NAME = "refreshToken";
        this.REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
        this.register = async (req, res, next) => {
            try {
                const result = await this.authService.register(req.body);
                this.setCookie(res, result.refreshToken);
                return api_response_utils_1.ApiResponse.success(res, "User registered successfully", { user: result.user, accessToken: result.accessToken }, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const result = await this.authService.login(email, password);
                this.setCookie(res, result.refreshToken);
                return api_response_utils_1.ApiResponse.success(res, "Login successful", { user: result.user, accessToken: result.accessToken });
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                this.clearCookie(res);
                return api_response_utils_1.ApiResponse.success(res, "Logged out successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                const token = req.cookies[this.COOKIE_NAME];
                if (!token) {
                    throw new errors_1.UnauthorizedError("Refresh token is missing");
                }
                const result = await this.authService.refreshToken(token);
                return api_response_utils_1.ApiResponse.success(res, "Access token refreshed successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCurrentUser = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const user = await this.authService.getCurrentUser(userId);
                return api_response_utils_1.ApiResponse.success(res, "Current user fetched successfully", { user });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const updatedUser = await this.authService.updateProfile(userId, req.body);
                return api_response_utils_1.ApiResponse.success(res, "Profile updated successfully", { user: updatedUser });
            }
            catch (error) {
                next(error);
            }
        };
        this.changePassword = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { currentPassword, newPassword } = req.body;
                await this.authService.changePassword(userId, currentPassword, newPassword);
                return api_response_utils_1.ApiResponse.success(res, "Password changed successfully");
            }
            catch (error) {
                next(error);
            }
        };
    }
    setCookie(res, token) {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie(this.COOKIE_NAME, token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: this.REFRESH_TOKEN_MAX_AGE,
        });
    }
    clearCookie(res) {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie(this.COOKIE_NAME, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });
    }
}
exports.AuthController = AuthController;
