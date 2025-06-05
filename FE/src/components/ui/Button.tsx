import type { ReactElement } from "react";

export interface ButtonProps {
  varient: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
}
const variantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-200 text-purple-500",
};
const sizeStyles = {
  lg: "py-3 px-6 gap-1 text-lg",
  sm: "h-9 px-3 gap-1 text-sm",
  md: "h-10 px-4 gap-2 text-md",
};
const defaultStyles = "rounded-md flex items-center cursor-pointer";
function Button(props: ButtonProps) {
  console.log(props.size);
  return (
    <button
      className={`${defaultStyles} ${variantStyles[props.varient]} 
      ${sizeStyles[props.size]}`}
      onClick={props.onClick}
    >
      {props.startIcon}
      <span>{props.text}</span>
      {props.endIcon}
    </button>
  );
}
export default Button;
