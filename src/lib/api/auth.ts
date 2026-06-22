import { apiGet, apiPatch, apiPost } from './client';
import type {
  AuthTokens,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleSignInPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
  VerifyEmailPayload,
} from './types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const userApi = {
  register: (data: RegisterPayload) => apiPost<AuthResponse>('/auth/register', data),
  login: (data: LoginPayload) => apiPost<AuthTokens>('/auth/login', data),
  googleSignIn: (data: GoogleSignInPayload) => apiPost<AuthTokens>('/auth/google', data),
  verifyEmail: (data: VerifyEmailPayload) =>
    apiPost<{ message: string }>('/auth/verify-email', data),
  resendVerification: (data: ResendVerificationPayload) =>
    apiPost<{ message: string }>('/auth/resend-verification', data),
  forgotPassword: (data: ForgotPasswordPayload) =>
    apiPost<{ message: string }>('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordPayload) =>
    apiPost<{ message: string }>('/auth/reset-password', data),
  changePassword: (data: ChangePasswordPayload) =>
    apiPost<{ message: string }>('/auth/change-password', data),
  logout: () => apiPost<{ message: string }>('/auth/logout'),
  getProfile: () => apiGet<User>('/users/me'),
  updateProfile: (data: UpdateProfilePayload) => apiPatch<User>('/users/me', data),
  savePushToken: (token: string) => apiPost<void>('/users/me/push-token', { token }),
};
