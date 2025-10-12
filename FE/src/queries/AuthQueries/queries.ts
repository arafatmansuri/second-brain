import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import type { userData } from "../../store/userState";

export type UserData = {
  _id: string;
  username: string | undefined;
  password: string | undefined;
  shared: boolean;
  _v: number;
  refreshToken?: string;
};
export type UserFormData = {
  username?: string | undefined;
  password?: string | undefined;
  credentials?: boolean;
  endpoint?: string;
  method?: "GET" | "POST" | "DELETE" | "PUT";
};
const authUser = async <T>({
  username,
  password,
  credentials,
  endpoint,
  method,
}: UserFormData): Promise<T> => {
  try {
    const user = await axios(`${BACKEND_URL}/api/v1/user/${endpoint}`, {
      method: method,
      data: {
        username,
        password,
      },
      withCredentials: credentials,
    });
    return user.data.user;
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
      return await authUser<userData>({
        credentials: true,
        endpoint: "getuser",
        method: "GET",
      });
    },
    retry: false,
  });
};

export const useAuthMutation = () =>
  useMutation<userData, { message: string; status: number }, UserFormData>(
    async ({
      username,
      password,
      credentials = false,
      endpoint,
      method = "POST",
    }: UserFormData): Promise<userData> =>
      await authUser({ username, password, credentials, endpoint, method }),
    {
      onError: (error: any) => {
        if (!error.response) {
          throw new Error("Network Error");
        }
      },
    }
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
  axios.get(`${BACKEND_URL}/api/v1/user/auth/google?code=${code}`, {
    withCredentials: true,
  });
