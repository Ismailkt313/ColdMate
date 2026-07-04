import { IUser, AuthResponse } from "../types";

export interface IAuthService {
  register(userData: Partial<IUser>): Promise<AuthResponse & { refreshToken: string }>;
  login(email: string, password: string): Promise<AuthResponse & { refreshToken: string }>;
  refreshToken(token: string): Promise<{ accessToken: string }>;
  getCurrentUser(id: string): Promise<Omit<IUser, "password">>;
  updateProfile(id: string, profileData: Partial<IUser>): Promise<Omit<IUser, "password">>;
  changePassword(id: string, currentPass: string, newPass: string): Promise<void>;
}
