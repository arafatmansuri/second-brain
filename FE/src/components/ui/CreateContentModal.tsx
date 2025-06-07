import axios from "axios";
import React, { useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BACKEND_URL } from "../../config";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { loadingAtom } from "../../store/loadingState";
import { userAtom } from "../../store/userState";
import CrossIcon from "../icons/CrossIcon";
import Button from "./Button";
import Input from "./Input";
//controlled component
function CreateContentModal({ onClose }: { onClose: () => void }) {
  const user = useRecoilValue(userAtom);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
  const titleRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const linkRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const typeRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  async function addContent() {
    setIsLoading(true);
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const type = typeRef.current?.value;
    await axios.post(
      `${BACKEND_URL}/api/v1/content/add`,
      {
        title: title?.toString(),
        link: link?.toString(),
        type: type?.toString(),
        tags: [],
        userId: user._id,
      },
      { withCredentials: true }
    );
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(false);
      titleRef.current.value = "";
      linkRef.current.value = "";
      typeRef.current.value = "";
    }, 500);
  }

  return (
    <div
      className={`${isModalOpen ? "flex" : "hidden"} w-screen h-screen
       fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded flex flex-col items-center gap-3 min-w-80">
        <div
          className="flex self-end cursor-pointer w-full justify-between font-medium text-purple-800"
          onClick={onClose}
        >
          <h1>Add Content</h1>
          <CrossIcon />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Input reference={titleRef} placeholder="Title" />
          <Input reference={linkRef} placeholder="Link" />
          <Input reference={typeRef} placeholder="Type" />
        </div>
        <Button
          onClick={addContent}
          varient="primary"
          text="Submit"
          size="md"
          textVisible={true}
          widthFull={true}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

export default CreateContentModal;
