import {
  BookText,
  ImageIcon,
  Newspaper,
  SquarePlay,
  Twitter,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { popupAtom } from "../../store/loadingState";
import { icons } from "../index";
interface CardProps {
  title: string;
  link: string;
  type: "youtube" | "tweet" | "document" | "video" | "image" | "article";
  tags?: { tagName: string; _id: string; _v: number }[];
  id: string;
  createdAt?: string;
  isLoading?: boolean;
  description?: string;
  isProcessing?:boolean;
  isCardInModal?: boolean;
}
export function Card({
  title,
  link,
  type,
  id,
  tags,
  createdAt,
  // isLoading,
  description,
  isProcessing,
  isCardInModal=false
}: CardProps) {
  const { brain } = useParams();
  const deletePostMutation = usePostMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const isModalOpen = useRecoilValue(addContentModalAtom);
  async function deletePost(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    const currentPostId = e.currentTarget.id;
    deletePostMutation.mutate({
      method: "DELETE",
      endpoint: `delete/${currentPostId}`,
    });
  }
  useEffect(() => {
    if (deletePostMutation.status == "success") {
      setIsPopup({ popup: true, message: "Content Deleted Successfully" });
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 3000);
    }
  }, [deletePostMutation.status, setIsPopup]);
  const date = createdAt ? new Date(createdAt) : new Date(Date.now());
  return (
    <div
      className={`${
        isModalOpen.open && isCardInModal ? "bg-slate-500 opacity-50 border-0" : "bg-white"
      } rounded-xl p-5 border border-gray-200 max-h-96 min-h-96 flex flex-col gap-2 lg:min-w-72 md:min-w-64 sm:min-w-60 w-[80%]`}
    >
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center gap-2 text-gray-500">
          {type == "tweet" && <Twitter />}
          {type == "youtube" && <SquarePlay />}
          {type == "image" && <ImageIcon />}
          {type == "document" && <BookText />}
          {type == "video" && <VideoIcon />}
          {type == "article" && <Newspaper />}
          <h3 className={`font-semibold text-black`}>
            {/* ${isLoading ? "bg-gray-800" : "bg-none"} */}
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          {isProcessing && <span
            className={`h-3 mr-1 w-3 rounded-full bg-yellow-500`}
            title={
              "Content is still being processed. AI searches might not find this content yet. Refresh after sometime"
            } // shows tooltip on hover
          ></span>}
          {/* <a href={link} target="_blank">
            <icons.ShareIcon />
          </a> */}
          <span
            id={id}
            onClick={deletePost}
            className={`${brain ? "hidden" : "block"}`}
          >
            <icons.TrashIcon />
          </span>
        </div>
      </div>
      {type === "youtube" && (
        //store Ids of video and render them
        <iframe
          className="rounded-sm mt-3 w-full"
          src={link}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      )}
      {type === "tweet" && (
        <div className={`overflow-y-auto overflow-x-auto max-h-72 rounded-md`}>
          <blockquote className="twitter-tweet">
            <a href={link}></a>
          </blockquote>
        </div>
      )}
      {type == "image" && (
        <img
          src={link}
          alt={title}
          className="w-full max-h-52 rounded-md mt-3"
        />
      )}
      {type == "video" && (
        <video
          src={link}
          className="w-full max-h-72 rounded-md mt-3"
          controls
        ></video>
      )}
      {type == "document" && (
        <iframe
          src={link}
          frameBorder="0"
          className="w-full max-h-72 rounded-md mt-3"
        ></iframe>
      )}
      {description && type !== "tweet" && (
        <div
          className={`text-wrap w-full ${
            type == "article"
              ? "text-md p-2 text-wrap max-h-72 overflow-y-auto text-left"
              : "text-xs p-2"
          }`}
        >
          {description}
        </div>
      )}
      {tags && (
        <div className="flex gap-2 text-purple-600 mt-1 flex-wrap">
          {tags?.map((tag, index) => (
            <span
              className="bg-purple-200 pl-2 pr-2 text-sm rounded-lg cursor-pointer hover:underline"
              key={index}
            >
              #{tag?.tagName?.toLowerCase()}
            </span>
          ))}
        </div>
      )}
      <div className="text-sm text-gray-400 mt-2 w-full text-nowrap">
        Added on{" "}
        {`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
      </div>
    </div>
  );
}
