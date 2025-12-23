import { atom } from "recoil";
export interface userData {
  _id: string;
  username: string;
  password: string;
  email: string;
  shared: boolean;
  _v: number;
  refreshToken: string;
  method:"oauth" | "normal";
}
export const userAtom = atom<userData>({
  key: "userAtom",
  default: {
    _id: "",
    username: "",
    password: "",
    email: "",
    shared: false,
    _v: 0,
    refreshToken: "",
    method: "normal",
  },
});
