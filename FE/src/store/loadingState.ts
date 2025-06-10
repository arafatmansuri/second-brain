import { atom } from "recoil";

export const loadingAtom = atom({
  key: "loadingAtom",
  default: false,
});

export const popupAtom = atom({
  key: "popupAtom",
  default: { popup: false, message: "" },
});
