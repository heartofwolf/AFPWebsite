import { apiRequest } from "./queryClient";

export interface AdminAuthState {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
}

class AdminAuth {
  private _isAuthenticated = false;

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  async login(password: string): Promise<boolean> {
    try {
      await apiRequest("POST", "/api/admin/login", { password });
      this._isAuthenticated = true;
      return true;
    } catch (error) {
      this._isAuthenticated = false;
      return false;
    }
  }

  logout() {
    this._isAuthenticated = false;
  }

  async changePassword(newPassword: string): Promise<boolean> {
    try {
      await apiRequest("POST", "/api/admin/change-password", { newPassword });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const adminAuth = new AdminAuth();
