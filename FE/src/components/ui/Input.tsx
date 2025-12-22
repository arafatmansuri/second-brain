import { EyeIcon, EyeOff } from "lucide-react";
import React, { useState } from "react";

export function Input({
  placeholder,
  reference,
  type = "text",
  formHook,
  defaultValue,
  isWidthFull = true,
  isDisabled = false,
}: {
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  formHook?: any;
  defaultValue?: string;
  reference?: any;
  isWidthFull?: boolean;
  isDisabled?: boolean;
}) {
  const [isVisible, setIsVisibile] = useState(false);
  return (
    <div className="w-full relative">
      <input
        ref={reference}
        type={type != "password" ? type : isVisible ? "text" : "password"}
        className={`px-4 py-2 border rounded block border-gray-300 focus:outline-purple-500 placeholder:select-none ${
          isWidthFull ? "w-full" : "w-auto"
        } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        {...formHook}
        defaultValue={defaultValue}
        disabled={isDisabled}
      />
      {type === "password" && (
        <EyeIcon
          className={`${!isVisible ? "absolute top-2.5 right-4" : "hidden"}`}
          onClick={() => setIsVisibile(true)}
        />
      )}
      {type === "password" && (
        <EyeOff
          className={`${isVisible ? "absolute top-2.5 right-4" : "hidden"}`}
          onClick={() => setIsVisibile(false)}
        />
      )}
    </div>
  );
}
