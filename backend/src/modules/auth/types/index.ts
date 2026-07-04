export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  providers?: ("LOCAL" | "GOOGLE")[];
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  phone?: string;
  profileImage?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  role: string;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  preferredCommunication: string;
  followUpEnabled: boolean;
  followUpAfterDays: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<IUser, "password">;
  accessToken: string;
}
