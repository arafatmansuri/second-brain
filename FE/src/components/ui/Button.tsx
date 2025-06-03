import type { ReactElement } from "react";

export interface ButtonProps {
  varient: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement; //React element instead any
  endIcon?: ReactElement;
  onClick?: () => void;
}
const variantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-300 text-purple-600",
};
const sizeStyles = {
  lg: "py-3 px-6 gap-1 text-lg",
  sm: "py-2 px-3 gap-2 text-sm",
  md: "py-2 px-4 gap-2 text-md",
};
const defaultStyles = "m-3 rounded-md flex items-center";
function Button(props: ButtonProps) {
  console.log(props.size);
  return (
    <button
      className={`${defaultStyles} ${variantStyles[props.varient]} 
      ${sizeStyles[props.size]}
        `}
      onClick={props.onClick}
    >
      {props.startIcon}
      <span>{props.text}</span>
      {props.endIcon}
    </button>
  );
}
export default Button;
