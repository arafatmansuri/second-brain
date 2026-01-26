import { EyeIcon, EyeOff } from "lucide-react";
import React, { memo, useState } from "react";

export const Input = memo<{
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  formHook?: any;
  defaultValue?: string;
  reference?: any;
  isWidthFull?: boolean;
  isDisabled?: boolean;
  label?: string;
  acceptedFileTypes?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onclick?: () => void;
}>(
  ({
    placeholder,
    reference,
    type = "text",
    formHook,
    defaultValue,
    isWidthFull = true,
    isDisabled = false,
    label,
    acceptedFileTypes,
    onChange,
    onclick,
  }) => {
    const [isVisible, setIsVisibile] = useState(false);
    return (
      <div
        className={`${type != "radio" && "w-full"} relative ${
          type == "radio" ? "flex flex-row-reverse gap-2 justify-end" : ""
        }`}
      >
        {label && (
          <label
            htmlFor={label.toLowerCase().replace(/\s+/g, "-")}
            className="block mb-1 font-semibold"
          >
            {label}
          </label>
        )}
        <input
          ref={reference}
          type={type != "password" ? type : isVisible ? "text" : "password"}
          className={`px-4 py-2 border rounded block border-gray-300 focus:outline-purple-500 placeholder:select-none ${
            isWidthFull && !(type == "radio") ? "w-full" : "w-auto"
          } ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder={placeholder}
          {...formHook}
          defaultValue={defaultValue}
          disabled={isDisabled}
          onChange={onChange}
          id={label ? label.toLowerCase().replace(/\s+/g, "-") : undefined}
          onClick={onclick}
          accept={acceptedFileTypes}
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
  },
);
