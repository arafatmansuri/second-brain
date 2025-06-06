function Input({
  onChange,
  placeholder,
}: {
  onChange: () => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

export default Input;
