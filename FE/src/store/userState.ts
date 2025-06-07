import axios from "axios";
import { atom, selector } from "recoil";
import { BACKEND_URL } from "../config";
export interface userData {
  _id: string;
  username: string;
  password: string;
  shared: boolean;
  _v: number;
  refreshToken: string;
}
export const userAtom = atom({
  key: "userAtom",
  default: selector<userData>({
    key: "userAtomSelector",
    get: async (): Promise<userData> => {
      await axios.post(
        `${BACKEND_URL}/api/v1/user/refreshtokens`,
        {},
        { withCredentials: true }
      );
      const response = await axios.get(`${BACKEND_URL}/api/v1/user/getuser`, {
        withCredentials: true,
      });
      return response.data.user;
    },
  }),
});
