import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";

export type UserData = {
  _id: string;
  username: string | undefined;
  password: string | undefined;
  shared: boolean;
  _v: number;
  refreshToken?: string;
};
type UserFormData = {
  username?: string | undefined;
  password?: string | undefined;
  credentials?: boolean;
  endpoint?: string;
  method?: "GET" | "POST" | "DELETE" | "PUT";
};
const authUser = async ({
  username,
  password,
  credentials,
  endpoint,
  method,
}: UserFormData): Promise<UserData> => {
  const user = await axios(`${BACKEND_URL}/api/v1/user/${endpoint}`, {
    method: method,
    data: {
      username,
      password,
    },
    withCredentials: credentials,
  });
  return user.data.user;
};
export const useAuthMutation = () =>
  useMutation(
    async ({
      username,
      password,
      credentials = false,
      endpoint,
      method = "POST",
    }: UserFormData): Promise<UserData> =>
      await authUser({ username, password, credentials, endpoint, method }),
    {
      onError: (error: any) => {
        if (!error.response) {
          throw new Error("Network Error");
        }
      },
    }
  );

export const useUserQuery = () => {
  const user = useQuery({
    queryKey: ["userQuery"],
    queryFn: async ({ credentials = true }: UserFormData) => {
      return await authUser({
        credentials,
        endpoint: "getuser",
        method: "GET",
      });
    },
  });
  return user;
};

export const useRefreshTokenMutation = () => {
  const navigate = useNavigate();
  return useMutation(
    async () => {
      await authUser({
        credentials: true,
        endpoint: "refreshtokens",
        method: "POST",
      });
    },
    {
      onError: () => {
        navigate("/signin");
      },
    }
  );
};
