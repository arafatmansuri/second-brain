import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { postAtom } from "../../store/postState";
import { userAtom } from "../../store/userState";
import { icons, ui } from "../index";
//controlled component
export function CreateContentModal() {
  const user = useRecoilValue(userAtom);
  const setPosts = useSetRecoilState(postAtom);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  // const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
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
        link: link,
        title: title,
        type: type,
        userId: user._id,
        tags: [],
      },
    });
  }
  useEffect(() => {
    typeRef.current.value = "select";
  }, []);
  useEffect(() => {
    if (addPostMutation.status == "success") {
      setPosts((prev) => [...prev, addPostMutation.data]);
      setTimeout(() => {
        setIsModalOpen(false);
        titleRef.current.value = "";
        linkRef.current.value = "";
        typeRef.current.value = "select";
      }, 500);
    }
  }, [addPostMutation.data, addPostMutation.status, setIsModalOpen, setPosts]);
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
