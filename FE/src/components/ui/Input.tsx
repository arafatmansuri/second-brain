export function Input({
  placeholder,
  reference,
  type,
  formHook,
  defaultValue
}: {
  placeholder?: string;
  type?:string,
  formHook?:any,
  defaultValue?:string,
  reference: any
}) {
  return (
    <input
      ref={reference}
      type={type ? type: "text"}
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
      placeholder={placeholder}
      {...formHook}
      defaultValue={defaultValue}
    />
  );
}
