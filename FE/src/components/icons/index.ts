export { Brain } from "./Brain";
export { CrossIcon } from "./CrossIcon";
export { Loader } from "./Loader";
export { Menu } from "./Menu";
export { PlusIcon } from "./PlusIcon";
export { ShareIcon } from "./ShareIcon";
export { TrashIcon } from "./TrashIcon";
export { TwitterIcon } from "./Twitter";
export { YoutubeIcon } from "./YoutubeIcon";

export interface IconProps {
  size?: "sm" | "md" | "lg";
}

export const iconSizeVariants = {
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
};
