import { IAuthService } from "../interface/auth.service.interface";
import { IUserRepository } from "../interface/user.repository.interface";
import { IUser, AuthResponse } from "../types";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../../../errors";
import { JwtUtils } from "../../../utils/jwt.utils";

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: Partial<IUser>): Promise<AuthResponse & { refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    if (existingUser) {
      throw new BadRequestError("Email is already registered");
    }

    const newUser = await this.userRepository.create(userData);

    const payload = {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      user: this.formatUser(newUser),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
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

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new BadRequestError("Incorrect current password");
    }

    user.password = newPass;
    await user.save();
  }

  private formatUser(user: any): Omit<IUser, "password"> {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }
}
