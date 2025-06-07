import axios from "axios";
import React, { useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { BACKEND_URL } from "../../config";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { loadingAtom } from "../../store/loadingState";
import { postAtom } from "../../store/postState";
import { userAtom } from "../../store/userState";
import CrossIcon from "../icons/CrossIcon";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
//controlled component
function CreateContentModal() {
  const user = useRecoilValue(userAtom);
  const setPosts = useSetRecoilState(postAtom);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
  const titleRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const linkRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const typeRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <select value={"select"}></select>
  );
  function onClose() {
    setIsLoading(false);
    setIsModalOpen(false);
    titleRef.current.value = "";
    linkRef.current.value = "";
    typeRef.current.value = "select";
  }
  async function addContent() {
    setIsLoading(true);
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const type = typeRef.current?.value;
    try {
      const post = await axios.post(
        `${BACKEND_URL}/api/v1/content/add`,
        {
          title: title?.toString(),
          link: link?.toString(),
          type: type?.toString(),
          tags: [],
          userId: user?._id,
        },
        { withCredentials: true }
      );
      setPosts((prev) => [...prev, post.data.content]);
      setTimeout(() => {
        setIsLoading(false);
        setIsModalOpen(false);
        titleRef.current.value = "";
        linkRef.current.value = "";
        typeRef.current.value = "select";
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      console.log(err.response.data.message);
    }
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
          <Select reference={typeRef} />
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
