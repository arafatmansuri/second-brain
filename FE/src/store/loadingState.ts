import { atom } from "recoil";

export const loadingAtom = atom({
  key: "loadingAtom",
  default: false,
});

export const popupAtom = atom({
  key: "popupAtom",
  default: { popup: false, message: "" },
});

export const isCopyAtom = atom({
  key: "isCopyAtom",
  default: false,
});
