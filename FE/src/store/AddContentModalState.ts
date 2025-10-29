import { atom } from "recoil";
interface Modal {
  open: boolean;
  modal: "share" | "" | "search";
}
export const addContentModalAtom = atom<Modal>({
  key: "addContentModalAtom",
  default: { open: false, modal: "" },
});
