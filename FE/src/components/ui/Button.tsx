import type { ReactElement } from "react";

export interface ButtonProps {
  varient: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  widthFull?: boolean;
  loading?: boolean;
}
const variantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-200 text-purple-500",
};
const sizeStyles = {
  lg: "py-2 px-5 gap-1 text-lg",
  sm: "h-9 px-3 gap-1 text-sm",
  md: "md:h-10 md:px-4 h-8 px-1 gap-2 md:text-md text-sm",
};
const defaultStyles = "rounded-md flex items-center cursor-pointer";
function Button(props: ButtonProps) {
  return (
    <button
      className={`${defaultStyles} ${variantStyles[props.varient]} 
      ${sizeStyles[props.size]} ${
        props.widthFull && "w-full flex items-center justify-center"
      }`}
      onClick={props.onClick}
    >
      {props.startIcon}
      <span className="hidden md:inline-block">{props.text}</span>
      {props.endIcon}
    </button>
  );
}
export default Button;
