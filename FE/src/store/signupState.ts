import { atom } from "recoil";

export const signUpAtom = atom({
  key: "signUpAtom",
  default: {
    username: "",
    password: "",
  },
});
