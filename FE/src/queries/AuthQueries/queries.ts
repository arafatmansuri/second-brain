import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import type { userData } from "../../store/userState";

export type UserData = userData;
export type MfaMethod = {
  type: "email" | "totp";
  isEnabled: boolean;
};
export type AuthResponse = {
  message?: string;
  user?: UserData & { mfas?: MfaMethod[] };
  qrCode?: string;
  manualKey?: string;
  otpauthURL?: string;
  backupCodes?: string[];
};
export type UserFormData = {
  username?: string;
  password?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  otp?: string;
  code?: string;
  credentials?: boolean;
  endpoint?: string;
  method?: "GET" | "POST" | "DELETE" | "PUT";
};
const authUser = async <T>({
  username,
  password,
  email,
  otp,
  code,
  newPassword,
  oldPassword,
  credentials,
  endpoint,
  method,
}: UserFormData): Promise<T> => {
  try {
    const user = await axios(`${BACKEND_URL}/api/v2/users/${endpoint}`, {
      method: method,
      data: {
        username,
        password,
        email,
        otp,
        code,
        newPassword,
        oldPassword,
      },
      withCredentials: credentials,
    });
    return user.data as T;
  } catch (err: any) {
    throw {
      message: err.response?.data?.message || "Unknown error",
      status: err?.status,
    };
  }
};

export const useUserQuery = ({ credentials }: UserFormData) => {
  return useQuery<userData, { message: string; status: number }>({
    queryKey: ["userQuery", credentials],
    queryFn: async () => {
      const data = await authUser<{ user: userData }>({
        credentials: true,
        endpoint: "getuser",
        method: "GET",
      });
      return data.user;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAuthMutation = () =>
  useMutation<AuthResponse, { message: string; status: number }, UserFormData>(
    async ({
      username,
      password,
      email,
      otp,
      code,
      newPassword,
      oldPassword,
      credentials = false,
      endpoint,
      method = "POST",
    }: UserFormData): Promise<AuthResponse> =>
      await authUser<AuthResponse>({
        username,
        otp,
        code,
        password,
        email,
        newPassword,
        oldPassword,
        credentials,
        endpoint,
        method,
      }),
    {
      onError: (error: any) => {
        if (!error.response) {
          throw new Error("Network Error");
        }
      },
    },
  );

export const useRefreshTokenMutation = () => {
  return useMutation(async () => {
    await authUser({
      credentials: true,
      endpoint: "refreshtokens",
      method: "POST",
    });
  });
};
export const googleAuth = (code: string) =>
  axios.get(`${BACKEND_URL}/api/v2/users/auth/google?code=${code}`, {
    withCredentials: true,
  });
// axios.get(`${BACKEND_URL}/api/v1/auth/google?code=${code}`, {
//   withCredentials: true,
// });
