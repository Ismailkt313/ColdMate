export interface User {
  _id: string;
  name: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface RefreshTokenData {
  accessToken: string;
}

export interface MeData {
  user: User;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}
