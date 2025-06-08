import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";

type UserData = {
  _id: string;
  username: string | undefined;
  password: string | undefined;
  shared: boolean;
  _v: number;
  refreshToken?: string;
};
type UserFormData = {
  username: string | undefined;
  password: string | undefined;
  credentials?: boolean;
  endpoint: string;
};
const authUser = async ({
  username,
  password,
  credentials,
  endpoint
}: UserFormData): Promise<UserData> => {
  const user = await axios.post(
    `${BACKEND_URL}/api/v1/user/${endpoint}`,
    {
      username,
      password,
    },
    { withCredentials: credentials }
  );
  return user.data.user;
};
export const useAuthMutation = () =>
  useMutation(
    async ({
      username,
      password,
      credentials = false,
      endpoint
    }: UserFormData): Promise<UserData> =>
      await authUser({ username, password, credentials,endpoint }),
    {
      onError: (error: any) => {
        if (!error.response) {
          throw new Error("Network Error");
        }
      },
    }
  );
