import { memo } from "react";
import { useRecoilState } from "recoil";
import { typeAtom } from "../../store/typeState";

const contentTypes = [
  "select",
  "youtube",
  "tweet",
  "document",
  "video",
  "image",
  "article",
];
export const Select = memo<{ reference?: any; formHook?: any }>(
  ({ reference, formHook }) => {
    const [contentType, setContentType] = useRecoilState(typeAtom);
    function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
      setContentType(event.currentTarget.value);
    }
    return (
      <select
        ref={reference}
        {...formHook}
        className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
        onChange={onChange}
        value={contentType}
      >
        {contentTypes.map((type) => (
          <option
            key={type}
            disabled={type == "select"}
            value={type}
            label={type == "document" ? "pdf" : type}
            className=""
          >
            {type}
          </option>
        ))}
      </select>
    );
  },
);
