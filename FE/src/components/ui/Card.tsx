import type React from "react";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { popupAtom } from "../../store/loadingState";
import { icons } from "../index";
interface CardProps {
  title: string;
  link: string;
  type: "youtube" | "tweet";
  id: string;
}
export function Card({ title, link, type, id }: CardProps) {
  const deletePostMutation = usePostMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
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
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 max-h-96 min-h-96 flex flex-col gap-2 md:w-[30%] w-[80%]">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center gap-2 text-gray-500">
          {type == "tweet" ? (
            <icons.TwitterIcon />
          ) : (
            <icons.YoutubeIcon size="md" />
          )}
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <a href={link} target="_blank">
            <icons.ShareIcon />
          </a>
          <span id={id} onClick={deletePost}>
            <icons.TrashIcon />
          </span>
        </div>
      </div>
      {type === "youtube" && (
        //store Ids of video and render them
        <iframe
          className="rounded-sm mt-3 w-full"
          src={link.replace("watch?v=", "embed/")}
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
            <a href={link.replace("x.com", "twitter.com")}></a>
          </blockquote>
        </div>
      )}
    </div>
  );
}
