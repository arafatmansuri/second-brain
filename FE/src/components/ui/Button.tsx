import type { ReactElement } from "react";
import { icons } from "../index";

export interface ButtonProps {
  varient: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  textVisible?: boolean;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  widthFull?: boolean;
  loading?: boolean;
  classes?: string;
  type?: "submit" | "reset" | "button" | undefined;
}
const variantStyles = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary: "bg-purple-200 text-purple-500 hover:bg-purple-300",
};
const sizeStyles = {
  lg: "py-2 px-5 gap-1 text-lg",
  sm: "h-9 px-3 gap-1 text-sm",
  md: "md:h-10 md:px-4 h-8 px-1 gap-2 md:text-md text-sm font-medium",
};
const defaultStyles = `rounded-md flex items-center cursor-pointer`;
export function Button({
  size,
  text,
  varient,
  endIcon,
  loading = false,
  onClick,
  startIcon,
  textVisible = true,
  widthFull,
  classes,
  type
}: ButtonProps) {
  return (
    <button
      className={`${defaultStyles} ${variantStyles[varient]} 
      ${sizeStyles[size]} ${
        widthFull && "w-full flex items-center justify-center"
      } disabled:cursor-progress disabled:opacity-70 ${classes}`}
      onClick={onClick}
      disabled={loading}
      type={type}
    >
      {startIcon}
      <span className={`${!textVisible ? "hidden" : "md:block"}`}>
        {loading ? <icons.Loader /> : text}
      </span>
      {endIcon}
    </button>
  );
}
