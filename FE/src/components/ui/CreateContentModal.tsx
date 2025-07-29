import { useEffect } from "react";
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
  const setIsPopup = useSetRecoilState(popupAtom);
  const { register, handleSubmit, setValue } = useForm<createContentInputs>();
  const contentType = useRecoilValue(typeAtom);
  const addPostMutation = usePostMutation<PostData>();
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
    addPostMutation.mutate({
      method: "POST",
      endpoint: "add",
      data: {
        title: data.title,
        tags: data.tags.split(" "),
        userId: user._id,
        description: data.description,
        link: data.link,
        type: data.type == "document" ? "raw" : data.type,
        file: data.file ? data.file[0] : null,
      },
      contentType: "multipart/form-data",
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
    // if (refreshTokenMutation.status == "success") {
    //   handleSubmit(addContent)
    // }
  }, [addPostMutation?.error?.response.status, addPostMutation.status]);
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
          <ui.Input placeholder="Tags" formHook={{ ...register("tags") }} />
        </div>
        {addPostMutation.isError && (
          <ui.ErrorBox
            errorMessage={addPostMutation?.error?.response.data.message}
          />
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
