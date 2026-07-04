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

  /**
   * Register a new user, sets access token
   */
  static async register(userData: Record<string, any>): Promise<StandardResponse<AuthData>> {
    const res = await api.post<StandardResponse<AuthData>>("/auth/register", userData);
    if (res.data.success && res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  }

  /**
   * Log out user, clears token from store & clears HTTP cookie on backend
   */
  static async logout(): Promise<StandardResponse<any>> {
    try {
      const res = await api.post<StandardResponse<any>>("/auth/logout");
      return res.data;
    } finally {
      setAccessToken("");
    }
  }

  /**
   * Fetch current logged in user details
   */
  static async me(): Promise<StandardResponse<{ user: User }>> {
    const res = await api.get<StandardResponse<{ user: User }>>("/auth/me");
    return res.data;
  }

  /**
   * Silently refresh access token (useful for app initialization)
   */
  static async refresh(): Promise<string> {
    const res = await api.post<StandardResponse<{ accessToken: string }>>("/auth/refresh-token");
    if (res.data.success && res.data.data.accessToken) {
      const token = res.data.data.accessToken;
      setAccessToken(token);
      return token;
    }
    throw new Error("Token refresh failed");
  }
}
