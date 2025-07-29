const regex = {
  youtube:
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?/,
  tweet: /(https:\/\/x\.com\/[A-Za-z0-9]{0,}\/status\/)([0-9]{0,})/,
};
export const generateContentLink = (
  link: string | undefined,
  contentType: "image" | "video" | "article" | "raw" | "tweet" | "youtube"
): { contentLink: string | undefined; id: string | undefined } => {
  let match: string | null | RegExpMatchArray | undefined = null;
  let contentLink: string | undefined;
  let id: string | undefined;
  switch (contentType) {
    case "youtube":
      match = link?.match(regex[contentType]) || null;
      contentLink = match
        ? `https://www.youtube.com/embed/${match[1].toString()}`
        : undefined;
      //@ts-ignore
      id = link?.match(regex[contentType])[1];
      break;
      case "tweet":
        contentLink = link?.replace("x.com", "twitter.com") || undefined;
        //@ts-ignore
        id = link?.match(regex[contentType])[2];
      break;
    default:
      break;
  }
  return { contentLink, id };
};
