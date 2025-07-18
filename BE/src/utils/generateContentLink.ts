const regex = {
  youtube:
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?/,
};
export const generateContentLink = (
  link: string | undefined,
  contentType:
    | "image"
    | "video"
    | "article"
    | "raw"
    | "tweet"
    | "youtube"
): string | null => {
  let match: string | null | RegExpMatchArray = null;
  switch (contentType) {
    case "youtube":
      match = link?.match(regex[contentType]) || null;
      match = match
        ? `https://www.youtube.com/embed/${match[1].toString()}`
        : null;
      break;
    case "tweet":
      match = link?.replace("x.com", "twitter.com") || null;
      break;
    default:
      break;
  }
  return match;
};
