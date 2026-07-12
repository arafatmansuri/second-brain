import { BACKEND_URL } from "../../config";

const BASE_V1_URL = `${BACKEND_URL}/api/v1/content`;
export const contentV1APIs = {
  createContent: `${BASE_V1_URL}/add`,
  updateContent: (id: string) => `${BASE_V1_URL}/update/${id}`,
  deleteContent: (id: string) => `${BASE_V1_URL}/delete/${id}`,
  displayContent: `${BASE_V1_URL}/displayall`,
  shareContent: (reqType: "private" | "copy") => `${BASE_V1_URL}/share?reqtype=${reqType}`,
  askAI: `${BASE_V1_URL}/askai`,
  displaySharedContent: (brain: string) => `${BASE_V1_URL}/display?share=${brain}`,
  generateUploadUrl: `${BASE_V1_URL}/uploadUrl`,
};
const BASE_V2_URL = `${BACKEND_URL}/api/v2/contents`;
export const contentV2APIs = {
  createContent: `${BASE_V2_URL}/`,
  updateContent: (id: string) => `${BASE_V2_URL}/${id}`,
  deleteContent: (id: string) => `${BASE_V2_URL}/${id}`,
  displayContent: (brain: string) => `${BASE_V2_URL}?share=${brain}`,
  shareContent: (reqType: "private" | "copy") => `${BASE_V2_URL}/share&reqtype=${reqType}`,
  askAI: `${BASE_V2_URL}/askai`,
  displaySharedContent: `${BASE_V2_URL}/display`,
  generateUploadUrl: `${BASE_V2_URL}/uploadUrl`,
};
