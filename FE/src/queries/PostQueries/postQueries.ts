import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { type PostData } from "../../store/postState";

const getPosts = async (
  method: string,
  endpoint: string
): Promise<PostData[]> => {
  const posts = await axios(`${BACKEND_URL}/api/v1/content/displayall`, {
    method: method,
    withCredentials: true,
  });
  return posts.data.content;
};

export const useGetPosts = () => {
  const posts = useQuery(
    {
      queryKey: ["getPosts"],
      queryFn: async () => {
        return await getPosts("GET", "displayall");
      },
    },
    {
      // onSuccess: (data: PostData[]) => setPosts(data),
    }
  );
  return posts;
};
