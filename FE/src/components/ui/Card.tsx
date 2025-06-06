import ShareIcon from "../icons/ShareIcon";
import TrashIcon from "../icons/TrashIcon";
import TwitterIcon from "../icons/Twitter";
import YoutubeIcon from "../icons/YoutubeIcon";
interface CardProps {
  title: string;
  link: string;
  type: "youtube" | "tweet";
}
function Card({ title, link, type }: CardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 max-h-96 min-h-96 flex flex-col gap-2 md:w-[30%] w-[86%]">
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center gap-2 text-gray-500">
          {type == "tweet" ? <TwitterIcon /> : <YoutubeIcon size="md" />}
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <a href={link} target="_blank">
            <ShareIcon />
          </a>
          <TrashIcon />
        </div>
      </div>
      {type === "youtube" && (
        //store Ids of video and render them
        <iframe
          className="rounded-sm mt-3"
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

export default Card;
