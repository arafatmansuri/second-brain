import ShareIcon from "../icons/ShareIcon";
interface CardProps {
  title: string;
  link: string;
  type: "youtube" | "tweet";
}
function Card({ title, link, type }: CardProps) {
  return (
    <div className="bg-white rounded-xl p-5 min-w-72 max-w-72 border border-gray-200 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <div className="flex justify-between items-center gap-2 text-gray-500">
          <ShareIcon size="md" />
          <h3 className="font-bold text-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <a href={link} target="_blank">
            <ShareIcon />
          </a>
          <ShareIcon />
        </div>
      </div>
      {type === "youtube" && (
        <iframe
          className="w-full mt-5 rounded-sm"
          src={link.replace("watch?v=", "embed/")}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      )}
      {type === "tweet" && (
        <blockquote className="twitter-tweet">
          <a href={link.replace("x.com", "twitter.com")}></a>
        </blockquote>
      )}
    </div>
  );
}

export default Card;
