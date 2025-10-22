import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useRefreshTokenMutation } from "../../queries/AuthQueries/queries";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { popupAtom } from "../../store/loadingState";
import type { PostData } from "../../store/postState";
import { typeAtom } from "../../store/typeState";
import { userAtom } from "../../store/userState";
import { icons, ui } from "../index";
type createContentInputs = {
  title: string;
  link: string;
  type: string;
  tags: string;
  description: string;
  file: FileList | null;
};
//controlled component
export function CreateContentModal() {
  const user = useRecoilValue(userAtom);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const [tags, setTags] = useState<string[]>([]);
  const setIsPopup = useSetRecoilState(popupAtom);
  const { register, handleSubmit, setValue, getValues } =
    useForm<createContentInputs>();
  const contentType = useRecoilValue(typeAtom);
  const addPostMutation = usePostMutation<PostData>();
  const getUploadUrlMutation = usePostMutation<{ uploadUrl: string }>();
  const refreshTokenMutation = useRefreshTokenMutation();
  function onClose() {
    setIsModalOpen({ open: false, modal: "create" });
    setValue("title", "");
    setValue("link", "");
    setValue("description", "");
    setValue("tags", "");
    setValue("type", "select");
    setValue("file", null);
  }
  const addContent: SubmitHandler<createContentInputs> = async (data) => {
    const file: File | null = data.file ? data.file[0] : null;
    if (
      (data.type == "image" ||
        data.type == "video" ||
        data.type == "document") &&
      file
    ) {
      let uploadUrl = "";
      getUploadUrlMutation.mutate(
        {
          endpoint: "uploadUrl",
          method: "POST",
          data: {
            fileName: file.name,
            fileType: file.type,
          },
        },
        {
          async onSuccess(data1) {
            uploadUrl = (await data1).uploadUrl;
            addPostMutation.mutate({
              method: "POST",
              endpoint: "add",
              data: {
                title: data.title,
                tags: tags,
                userId: user._id,
                description: data.description,
                link: data.link,
                type: data.type == "document" ? "raw" : data.type,
                fileKey: file.name,
              },
            });
            await axios.put(uploadUrl, file, {
              headers: {
                "Content-Type": file.type,
              },
              
              // onUploadProgress: (progressEvent) => {
              //   const progress = Math.round(
              //     (progressEvent.loaded * 100) / progressEvent.total
              //   );
              //   setUploadProgress(progress);
              // },
            });
          },
        }
      );
    } else
      addPostMutation.mutate({
        method: "POST",
        endpoint: "add",
        data: {
          title: data.title,
          tags: tags,
          userId: user._id,
          description: data.description,
          link: data.link,
          type: data.type == "document" ? "raw" : data.type,
          // file: file,
        },
        // contentType: "multipart/form-data",
      });
  };
  useEffect(() => {
    setValue("type", "select");
  }, [isModalOpen]);
  useEffect(() => {
    if (addPostMutation.status == "success") {
      setTimeout(() => {
        setIsPopup({ popup: true, message: "Content Added Successfully" });
        setIsModalOpen({ open: false, modal: "create" });
        setValue("title", "");
        setValue("link", "");
        setValue("description", "");
        setValue("tags", "");
        setValue("type", "select");
        setValue("file", null);
        setTags([]);
      }, 500);
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 3000);
    }
  }, [addPostMutation.status]);
  useEffect(() => {
    if (
      addPostMutation.status == "error" &&
      addPostMutation?.error.status == 401
    ) {
      refreshTokenMutation.mutate();
    }
    // if (refreshTokenMutation.status == "success") {
    //   handleSubmit(addContent)
    // }
  }, [addPostMutation.error?.message, addPostMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "create" ? "flex" : "hidden"
      } w-screen h-screen
       fixed top-0 left-0 justify-center items-center`}
    >
      <form
        onSubmit={handleSubmit(addContent)}
        className="bg-white p-4 shadow-md rounded flex flex-col items-center gap-3 min-w-96"
      >
        <div
          className="flex self-end cursor-pointer w-full justify-between font-medium text-purple-800"
          onClick={onClose}
        >
          <h1>Add Content</h1>
          <icons.CrossIcon size="sm" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <ui.Input
            placeholder="Title"
            formHook={{ ...register("title", { minLength: 3 }) }}
          />
          <ui.Select formHook={{ ...register("type") }} />
          {(contentType == "youtube" || contentType == "tweet") && (
            <ui.Input
              type="text"
              placeholder="Link"
              formHook={{ ...register("link") }}
            />
          )}
          {(contentType == "document" ||
            contentType == "video" ||
            contentType == "image") && (
            <ui.Input type="file" formHook={{ ...register("file") }} />
          )}
          <ui.TextArea
            placeholder={contentType == "article" ? "Article" : "Description"}
            formHook={{ ...register("description") }}
          />
          <div className="flex gap-2">
            <ui.Input placeholder="Tags" formHook={{ ...register("tags") }} />
            <ui.Button
              size="sm"
              text="add"
              varient="secondary"
              classes="py-2"
              textVisible={true}
              widthFull={false}
              onClick={() => setTags((prev) => [...prev, getValues("tags")])}
            />
          </div>
          <div className="flex gap-2">
            {tags.map((tag, index) => (
              <ui.Button
                key={index}
                size="md"
                text={tag}
                varient="secondary"
                endIcon={
                  <icons.CrossIcon
                    size="sm"
                    onClick={() => setTags((p) => p.filter((t) => t != tag))}
                  />
                }
              />
            ))}
          </div>
        </div>
        {addPostMutation.isError && (
          <ui.ErrorBox errorMessage={addPostMutation?.error?.message} />
        )}
        <ui.Button
          varient="primary"
          text="Submit"
          size="md"
          textVisible={true}
          widthFull={true}
          loading={addPostMutation.isPending}
          type="submit"
        />
      </form>
    </div>
  );
}
