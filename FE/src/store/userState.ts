import { atom } from "recoil";
export interface userData {
  _id: string;
  username: string;
  password: string;
  shared: boolean;
  _v: number;
  refreshToken: string;
}
export const userAtom = atom<userData>({
  key: "userAtom",
  default: {
    _id: "",
    username: "",
    password: "",
    shared: false,
    _v: 0,
    refreshToken: "",
  },
});
