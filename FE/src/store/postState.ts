import { atom } from "recoil";
export interface PostData {
  link: string;
  tags: string[];
  title: string;
  type: "youtube" | "tweet";
  userId: string;
  __v: number;
  _id: string;
}
export const postAtom = atom<PostData[]>({
  key: "postAtom",
  default:[]
});
