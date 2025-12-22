import { EyeClosed, EyeClosedIcon, EyeIcon, EyeOff } from "lucide-react";
import React, { useState } from "react";

export function Input({
  placeholder,
  reference,
  type="text",
  formHook,
  defaultValue,
}: {
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  formHook?: any;
  defaultValue?: string;
  reference?: any;
}) {
  const [isVisible, setIsVisibile] = useState(false);
  return (
    <div className="w-full relative">
      <input
        ref={reference}
        type={type != "password" ? type : isVisible ? "text" : "password"}
        className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500 placeholder:select-none"
        placeholder={placeholder}
        {...formHook}
        defaultValue={defaultValue}
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
