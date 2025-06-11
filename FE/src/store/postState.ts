import { atom } from "recoil";
export interface PostData {
  link: string;
  tags?: { tagName: string; _id: string; _v: number }[];
  title: string;
  type: "youtube" | "tweet";
  userId: string;
  __v: number;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}
export const postAtom = atom<PostData[]>({
  key: "postAtom",
  default: [],
});
