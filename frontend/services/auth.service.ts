import api, { setAccessToken } from "../lib/axios";
import { AuthData, StandardResponse, User } from "../types/auth";

export class AuthService {
  /**
   * Log in user with email & password, sets access token
   */
  static async login(email: string, password: string): Promise<StandardResponse<AuthData>> {
    const res = await api.post<StandardResponse<AuthData>>("/auth/login", { email, password });
    if (res.data.success && res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  }

  static async register(userData: Record<string, any> | FormData): Promise<StandardResponse<AuthData>> {
    const headers: Record<string, string> = {};
    if (userData instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const res = await api.post<StandardResponse<AuthData>>("/auth/register", userData, { headers });
    if (res.data.success && res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  }

  static async logout(): Promise<StandardResponse<any>> {
    try {
      const res = await api.post<StandardResponse<any>>("/auth/logout");
      return res.data;
    } finally {
      setAccessToken("");
    }
  }

  static async me(): Promise<StandardResponse<{ user: User }>> {
    const res = await api.get<StandardResponse<{ user: User }>>("/auth/me");
    return res.data;
  }

  static async refresh(): Promise<string> {
    const res = await api.post<StandardResponse<{ accessToken: string }>>("/auth/refresh-token");
    if (res.data.success && res.data.data.accessToken) {
      const token = res.data.data.accessToken;
      setAccessToken(token);
      return token;
    }
    throw new Error("Token refresh failed");
  }

  static async uploadProfileImage(file: File): Promise<StandardResponse<{ user: User }>> {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await api.patch<StandardResponse<{ user: User }>>("/auth/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  static async deleteProfileImage(): Promise<StandardResponse<{ user: User }>> {
    const res = await api.delete<StandardResponse<{ user: User }>>("/auth/profile/image");
    return res.data;
  }

  static async googleLogin(idToken: string): Promise<StandardResponse<AuthData>> {
    const res = await api.post<StandardResponse<AuthData>>("/auth/google", { idToken });
    if (res.data.success && res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  }

  static async forgotPassword(email: string): Promise<StandardResponse<any>> {
    const res = await api.post<StandardResponse<any>>("/auth/forgot-password", { email });
    return res.data;
  }

  static async resetPassword(email: string, token: string, newPass: string): Promise<StandardResponse<any>> {
    const res = await api.post<StandardResponse<any>>("/auth/reset-password", {
      email,
      token,
      password: newPass,
    });
    return res.data;
  }
}
