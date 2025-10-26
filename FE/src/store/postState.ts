import { atom } from "recoil";
export interface PostData {
  link: string;
  tags?: { tagName: string; _id: string; _v: number }[];
  title: string;
  type: "youtube" | "tweet" | "document" | "video" | "image" | "article";
  userId: string;
  __v: number;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  isProcessing?: boolean;
}
export const postAtom = atom<PostData[]>({
  key: "postAtom",
  default: [],
});
