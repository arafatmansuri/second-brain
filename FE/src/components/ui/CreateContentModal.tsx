import CrossIcon from "../icons/CrossIcon";
import Button from "./Button";
import Input from "./Input";

//controlled component
function CreateContentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`${open ? "flex" : "hidden"} w-screen h-screen
       fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded flex flex-col items-center">
        <div className="self-end cursor-pointer" onClick={onClose}>
          <CrossIcon />
        </div>
        <div className="">
          <Input onChange={() => {}} placeholder="Title" />
          <Input onChange={() => {}} placeholder="Link" />
        </div>
        <Button varient="primary" text="submit" size="md" />
      </div>
    </div>
  );
}

export default CreateContentModal;
