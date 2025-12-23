import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { type PostData } from "../../store/postState";
type PostFormData = {
  method: string;
  endpoint: string;
  data?: {
    title?: string;
    link?: string;
    type?: string;
    tags?: string[];
    userId?: string;
    file?: File | null;
    description?: string;
    query?: string;
    fileName?: string;
    fileType?: string;
    fileKey?: string;
    fileSize?:number;
  };
  contentType?: string;
};
const fetchPosts = async <T>({
  method,
  endpoint,
  data,
  contentType = "application/json",
}: PostFormData): Promise<T> => {
  try {
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
    if (endpoint.includes("askai")) {
      return posts.data.answer;
    }
    if (endpoint.includes("uploadUrl")) {
      return posts.data;
    }
    return posts.data.content;
  } catch (err: any) {
    throw {
      message: err.response?.data?.message || "Unknown error",
      status: err?.status,
    };
  }
};

export const useGetPosts = (): UseQueryResult<PostData[], {message:string,status:number}> => {
  const posts: UseQueryResult<PostData[], {message:string,status:number}> = useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<PostData[]> => {
      return await fetchPosts<PostData[]>({
        method: "GET",
        endpoint: "displayall",
      });
    },
    retry: false,
  });
  return posts;
};

export const usePostMutation = <T>() => {
  const queryClient = useQueryClient();
  return useMutation<T, { message: string,status:number }, PostFormData>({
    mutationKey: ["PostMutation"],
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
