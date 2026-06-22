import { useMutation } from '@tanstack/react-query';

import { userApi } from '@/lib/api/auth';
import type { ChangePasswordPayload, UpdateProfilePayload } from '@/lib/api/types';
import { useAuthStore } from '@/lib/store/auth-store';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userApi.updateProfile(data),
    onSuccess: (user) => setUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => userApi.changePassword(data),
  });
}
