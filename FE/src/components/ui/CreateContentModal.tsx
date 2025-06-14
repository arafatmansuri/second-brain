import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useRefreshTokenMutation } from "../../queries/AuthQueries/queries";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { popupAtom } from "../../store/loadingState";
import type { PostData } from "../../store/postState";
import { typeAtom } from "../../store/typeState";
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
  const tagsRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input value={"input"}></input>
  );
  const textAreaRef =
    useRef<React.TextareaHTMLAttributes<HTMLTextAreaElement>>();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const contentType = useRecoilValue(typeAtom);
  const addPostMutation = usePostMutation<PostData>();
  const refreshTokenMutation = useRefreshTokenMutation();
  function onClose() {
    setIsModalOpen({ open: false, modal: "create" });
    titleRef.current.value = "";
    linkRef.current.value = "";
    typeRef.current.value = "select";
    tagsRef.current.value = "";
    textAreaRef.current.value = "";
  }
  async function addContent() {
    const title = titleRef.current?.value?.toString();
    const link = linkRef.current?.value?.toString();
    const type = typeRef.current?.value?.toString();
    const tags = tagsRef.current?.value?.toString().split(" ") || [];
    const desc = textAreaRef.current.value?.toString();
    if (
      (fileRef.current && fileRef.current.files) ||
      type == "youtube" ||
      type == "tweet" ||
      type == "article"
    ) {
      const file = fileRef.current?.files
        ? fileRef.current?.files[0]
        : undefined;
      const fileBlob = file && new Blob([file], { type: file.type });
      addPostMutation.mutate({
        method: "POST",
        endpoint: "add",
        data: {
          title: title,
          link: link,
          type: type,
          tags: tags,
          userId: user._id,
          file: fileBlob,
          description: desc,
        },
        contentType: "multipart/form-data",
      });
    } else {
      console.log("No file found");
    }
  }
  useEffect(() => {
    typeRef.current.value = "select";
  }, [isModalOpen]);
  useEffect(() => {
    if (addPostMutation.status == "success") {
      setTimeout(() => {
        setIsPopup({ popup: true, message: "Content Added Successfully" });
        setIsModalOpen({ open: false, modal: "create" });
        titleRef.current.value = "";
        typeRef.current.value = "";
        tagsRef.current.value = "";
        textAreaRef.current.value = "";
        if (fileRef.current) {
          fileRef.current.value = ""; // Clear the file input
        }
        linkRef.current.value = "";
      }, 500);
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 3000);
    }
  }, [addPostMutation.status]);
  useEffect(() => {
    if (
      addPostMutation.status == "error" &&
      addPostMutation?.error?.response.status == 401
    ) {
      refreshTokenMutation.mutate();
    }
    if (refreshTokenMutation.status == "success") {
      addContent();
    }
  }, [addPostMutation?.error?.response.status, addPostMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "create" ? "flex" : "hidden"
      } w-screen h-screen
       fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded flex flex-col items-center gap-3 min-w-96">
        <div
          className="flex self-end cursor-pointer w-full justify-between font-medium text-purple-800"
          onClick={onClose}
        >
          <h1>Add Content</h1>
          <icons.CrossIcon size="sm" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <ui.Input reference={titleRef} placeholder="Title" />
          <ui.Select reference={typeRef} />
          {(contentType == "youtube" || contentType == "tweet") && (
            <ui.Input type="text" reference={linkRef} placeholder="Link" />
          )}
          {(contentType == "document" ||
            contentType == "video" ||
            contentType == "image") && (
            <ui.Input type="file" reference={fileRef} placeholder="Link" />
          )}
          <ui.TextArea
            reference={textAreaRef}
            placeholder={contentType == "article" ? "Article" : "Description"}
          />
          <ui.Input reference={tagsRef} placeholder="Tags" />
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
