const contentTypes = ["select", "youtube", "tweet"];
function Select({ reference }: { reference?: any }) {
  return (
    <select
      ref={reference}
      className="px-4 py-2 border rounded block border-gray-300 w-full focus:outline-purple-500"
    >
      {contentTypes.map((type) => (
        <option
          value={type}
          disabled={type == "select"}
          className=""
        >
          {type}
        </option>
      ))}
    </select>
  );
}

export default Select;
