import { IAuthService } from "../interface/auth.service.interface";
import { IUserRepository } from "../interface/user.repository.interface";
import { IUser, AuthResponse } from "../types";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../../../errors";
import { JwtUtils } from "../../../utils/jwt.utils";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../../../config/cloudinary.config";
import { verifyGoogleToken } from "../../../utils/google-auth.utils";
import { EmailService } from "../../../services/email.service";

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: Partial<IUser>): Promise<AuthResponse & { refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    let user;

    if (existingUser) {
      const providers = existingUser.providers || ((existingUser as any).provider ? [(existingUser as any).provider] : (existingUser.googleId ? ["GOOGLE"] : ["LOCAL"]));
      if (providers.includes("LOCAL")) {
        throw new BadRequestError("Email is already registered");
      }

      existingUser.password = userData.password;
      if (!existingUser.providers) {
        existingUser.providers = ["GOOGLE", "LOCAL"];
      } else if (!existingUser.providers.includes("LOCAL")) {
        existingUser.providers.push("LOCAL");
      }

      await existingUser.save();
      user = existingUser;
    } else {
      user = await this.userRepository.create({
        ...userData,
        providers: ["LOCAL"],
      });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const providers = user.providers || ((user as any).provider ? [(user as any).provider] : (user.googleId ? ["GOOGLE"] : ["LOCAL"]));
    if (!providers.includes("LOCAL")) {
      throw new BadRequestError("This account uses Google Sign-In. Please sign in with Google or set a password using recovery.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const payload = JwtUtils.verifyRefreshToken(token);

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError("User not found or session expired");
    }

    const newPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = JwtUtils.generateAccessToken(newPayload);

    return {
      accessToken: newAccessToken,
    };
  }

  async getCurrentUser(id: string): Promise<Omit<IUser, "password">> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.formatUser(user);
  }

  async updateProfile(id: string, profileData: Partial<IUser>): Promise<Omit<IUser, "password">> {
    if (profileData.password) {
      delete profileData.password;
    }

    const updatedUser = await this.userRepository.update(id, profileData);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return this.formatUser(updatedUser);
  }

  async changePassword(id: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const providers = user.providers || ((user as any).provider ? [(user as any).provider] : (user.googleId ? ["GOOGLE"] : ["LOCAL"]));
    if (!providers.includes("LOCAL")) {
      throw new BadRequestError("Password changes are unavailable for Google accounts. Please use Forgot Password to create a password.");
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new BadRequestError("Incorrect current password");
    }

    user.password = newPass;
    await user.save();
  }

  async updateProfileImage(id: string, fileBuffer: Buffer): Promise<Omit<IUser, "password">> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.profileImage) {
      const publicId = getPublicIdFromUrl(user.profileImage);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error("Cloudinary delete error during replacement:", err);
        }
      }
    }

    const uploadResult = await uploadToCloudinary(fileBuffer);

    const updatedUser = await this.userRepository.update(id, {
      profileImage: uploadResult.secure_url,
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found during image update");
    }

    return this.formatUser(updatedUser);
  }

  async deleteProfileImage(id: string): Promise<Omit<IUser, "password">> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.profileImage) {
      const publicId = getPublicIdFromUrl(user.profileImage);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error("Cloudinary delete error during deletion:", err);
        }
      }
    }

    const updatedUser = await this.userRepository.update(id, {
      profileImage: "",
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found during image deletion");
    }

    return this.formatUser(updatedUser);
  }

  async googleLogin(idToken: string): Promise<AuthResponse & { refreshToken: string }> {
    const profile = await verifyGoogleToken(idToken);
    let user = await this.userRepository.findByEmail(profile.email);

    if (user) {
      if (!user.providers) {
        const oldProvider = (user as any).provider || (user.googleId ? "GOOGLE" : "LOCAL");
        user.providers = [oldProvider];
      }

      if (!user.providers.includes("GOOGLE")) {
        user.providers.push("GOOGLE");
      }

      if (!user.googleId) {
        user.googleId = profile.googleId;
      }

      if (!user.profileImage && profile.picture) {
        user.profileImage = profile.picture;
      }

      await user.save();
    } else {
      user = await this.userRepository.create({
        name: profile.name,
        email: profile.email,
        providers: ["GOOGLE"],
        googleId: profile.googleId,
        profileImage: profile.picture || "",
        isEmailVerified: true,
      });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const crypto = require("crypto");
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await EmailService.sendResetPasswordEmail(email, plainToken);
  }

  async resetPassword(email: string, token: string, newPass: string): Promise<void> {
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.findByEmail(email);
    if (
      !user ||
      user.resetPasswordToken !== hashedToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestError("Invalid or expired password reset link");
    }

    user.password = newPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    if (!user.providers) {
      const oldProvider = (user as any).provider || (user.googleId ? "GOOGLE" : "LOCAL");
      user.providers = [oldProvider];
    }
    if (!user.providers.includes("LOCAL")) {
      user.providers.push("LOCAL");
    }

    await user.save();
  }

  private formatUser(user: any): Omit<IUser, "password"> {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }
}
