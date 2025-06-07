import axios from "axios";
import { atom, selector } from "recoil";
import { BACKEND_URL } from "../config";
export interface PostData {
  link: string;
  tags: string[];
  title: string;
  type: "youtube" | "tweet";
  userId: string;
  __v: number;
  _id: string;
}
export const postAtom = atom({
  key: "postAtom",
  default: selector<PostData[]>({
    key: "postAtomSelector",
    get: async (): Promise<PostData[]> => {
      const posts = await axios.get(
        `${BACKEND_URL}/api/v1/content/displayall`,
        {
          withCredentials: true,
        }
      );
      return posts.data.content;
    },
  }),
});
