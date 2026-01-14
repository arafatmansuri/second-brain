/**
 * Detects media type (image, video, audio, other) from a URL.
 * Tries HTTP headers first, then falls back to file extension.
 */
export async function detectMediaType(url: string): Promise<string> {
  // Helper: Check by file extension
  function getTypeFromExtension(url: string) {
    if (url !== "" && !url.includes(".")) return "unknown";
    const extension = url.split(".")?.pop()?.split(/\#|\?/)[0].toLowerCase();
    if (!extension) return "unknown";

    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const videoTypes = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
    // const audioTypes = ["mp3", "wav", "ogg", "aac", "flac"];
    const pdfTypes = ["pdf"];
    if (imageTypes.includes(extension)) return "image";
    if (videoTypes.includes(extension)) return "video";
    // if (audioTypes.includes(extension)) return "audio";
    if (pdfTypes.includes(extension)) return "pdf";
    return "unknown";
  }

  // 1️⃣ Try HTTP HEAD request for Content-Type
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("Content-Type");

    if (contentType) {
      if (contentType.startsWith("image/")) return "image";
      if (contentType.startsWith("video/")) return "video";
      //   if (contentType.startsWith("audio/")) return "audio";
      if (contentType.startsWith("application/pdf")) return "pdf";
      return "other";
    }
  } catch (error) {
    console.warn(
      "HEAD request failed, falling back to extension check:",
      error
    );
  }

  // 2️⃣ Fallback: Check by file extension
  return getTypeFromExtension(url);
}

export async function isCorrectMediaType(
  url: string,
  expectedType: string
): Promise<boolean> {
  return detectMediaType(url).then((detectedType) => {
    if (expectedType === "raw") return detectedType === "pdf";
    else if (expectedType == "image") return detectedType === "image";
    else if (expectedType == "video") return detectedType === "video";
    return detectedType === expectedType;
  });
}
export function isCorrectMediaTypeByFile(
  fileType: string,
  expectedType: string
): boolean {
  if (expectedType === "raw") return fileType === "application/pdf";
  else if (expectedType == "image") return fileType.startsWith("image/");
  else if (expectedType == "video") return fileType.startsWith("video/");
  return false;
}
