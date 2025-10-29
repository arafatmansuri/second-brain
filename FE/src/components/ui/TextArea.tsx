export function TextArea({
  placeholder,
  reference,
  formHook
}: {
  placeholder?: string;
  reference?: any;
  formHook?:any;
}) {
  return (
    <textarea
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500 resize-none"
      placeholder={placeholder}
      ref={reference}
      {...formHook}
      rows={4}
      cols={40}
      
    />
  );
}
