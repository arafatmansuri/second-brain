import { useRecoilValue } from "recoil";
import { addContentModalAtom } from "../../store/AddContentModalState";
import CrossIcon from "../icons/CrossIcon";
import Button from "./Button";
import Input from "./Input";
//controlled component
function CreateContentModal({ onClose }: { onClose: () => void }) {
  const isModalOpen = useRecoilValue(addContentModalAtom);
  return (
    <div
      className={`${isModalOpen ? "flex" : "hidden"} w-screen h-screen
       fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded flex flex-col items-center gap-3 min-w-80">
        <div className="flex self-end cursor-pointer w-full justify-between font-medium text-purple-800" onClick={onClose}>
          <h1>Add Content</h1>
          <CrossIcon />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Input onChange={() => {}} placeholder="Title" />
          <Input onChange={() => {}} placeholder="Link" />
        </div>
        <Button varient="primary" text="Submit" size="md" textVisible={true} widthFull={true} loading={false} />
      </div>
    </div>
  );
}

export default CreateContentModal;
