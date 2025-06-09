export function Input({
  placeholder,
  reference,
}: {
  placeholder?: string;
  reference?: any;
}) {
  return (
    <input
      type="text"
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
      placeholder={placeholder}
      ref={reference}
    />
  );
}
