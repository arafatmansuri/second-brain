export function Input({
  placeholder,
  reference,
  type
}: {
  placeholder?: string;
  reference?: any;
  type?:string
}) {
  return (
    <input
      type={type ? type: "text"}
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
      placeholder={placeholder}
      ref={reference}
    />
  );
}
