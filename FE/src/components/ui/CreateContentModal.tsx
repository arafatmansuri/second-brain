import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { popupAtom } from "../../store/loadingState";
import { userAtom } from "../../store/userState";
import { icons, ui } from "../index";
//controlled component
export function CreateContentModal() {
  const user = useRecoilValue(userAtom);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const setIsPopup = useSetRecoilState(popupAtom);
  const titleRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const linkRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const typeRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <select value={"select"}></select>
  );
  const addPostMutation = usePostMutation();
  function onClose() {
    setIsModalOpen(false);
    titleRef.current.value = "";
    linkRef.current.value = "";
    typeRef.current.value = "select";
  }
  async function addContent() {
    const title = titleRef.current?.value?.toString();
    const link = linkRef.current?.value?.toString();
    const type = typeRef.current?.value?.toString();
    addPostMutation.mutate({
      method: "POST",
      endpoint: "add",
      data: {
        title: title,
        link: link,
        type: type,
        tags: [],
        userId: user._id,
      },
    });
  }
  useEffect(() => {
    typeRef.current.value = "select";
  }, []);
  useEffect(() => {
    if (addPostMutation.status == "success") {
      setTimeout(() => {
        setIsPopup({ popup: true, message: "Content Added Successfully" });
        setIsModalOpen(false);
        titleRef.current.value = "";
        linkRef.current.value = "";
        typeRef.current.value = "select";
      }, 500);
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 3000);
    }
  }, [
    addPostMutation.data,
    addPostMutation.status,
    setIsModalOpen,
    setIsPopup,
  ]);
  if (addPostMutation.isError) {
    console.log(addPostMutation.error);
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
          <icons.CrossIcon />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <ui.Input reference={titleRef} placeholder="Title" />
          <ui.Input reference={linkRef} placeholder="Link" />
          <ui.Select reference={typeRef} />
        </div>
        {addPostMutation.isError && (
          <ui.ErrorBox
            errorMessage={addPostMutation?.error?.response.data.message}
          />
        )}
        <ui.Button
          onClick={addContent}
          varient="primary"
          text="Submit"
          size="md"
          textVisible={true}
          widthFull={true}
          loading={addPostMutation.isLoading}
        />
      </div>
    </div>
  );
}
