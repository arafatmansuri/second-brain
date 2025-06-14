import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { type PostData } from "../../store/postState";
type PostFormData = {
  method: string;
  endpoint: string;
  // data?: FormData
  data?: {
    title?: string;
    link?: string;
    type?: string;
    tags: string[];
    userId: string;
    file?: Blob;
    description?: string;
  };
  contentType?: string;
};
const fetchPosts = async <T>({
  method,
  endpoint,
  data,
  contentType = "application/json",
}: PostFormData): Promise<T> => {
  const posts = await axios(`${BACKEND_URL}/api/v1/content/${endpoint}`, {
    method: method,
    data: data,
    withCredentials: true,
    headers: {
      "Content-Type": contentType,
    },
  });
  if (method == "PUT" || endpoint.includes("display?share=")) {
    return posts.data;
  }
  return posts.data.content;
};

export const useGetPosts = (): UseQueryResult<PostData[], unknown> => {
  const posts: UseQueryResult<PostData[], unknown> = useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<PostData[]> => {
      return await fetchPosts<PostData[]>({
        method: "GET",
        endpoint: "displayall",
      });
    },
  });
  return posts;
};

export const usePostMutation = <T>(): UseMutationResult<
  T,
  unknown,
  PostFormData,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      method,
      endpoint,
      data,
      contentType,
    }: PostFormData): Promise<T> => {
      return await fetchPosts<T>({ method, endpoint, data, contentType });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
