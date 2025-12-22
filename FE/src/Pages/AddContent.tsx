import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { icons, ui } from "../components";
import { useRefreshTokenMutation } from "../queries/AuthQueries/queries";
import { usePostMutation } from "../queries/PostQueries/postQueries";
import { popupAtom } from "../store/loadingState";
import type { PostData } from "../store/postState";
import { typeAtom } from "../store/typeState";
import { userAtom } from "../store/userState";
type createContentInputs = {
  title: string;
  link: string;
  type: string;
  tags: string;
  description: string;
  file: FileList | null;
};
//controlled component
function AddContent() {
  const user = useRecoilValue(userAtom);
  const [isFileError, setIsFileError] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const setIsPopup = useSetRecoilState(popupAtom);
  const { register, handleSubmit, setValue, getValues } =
    useForm<createContentInputs>();
  const contentType = useRecoilValue(typeAtom);
  const addPostMutation = usePostMutation<PostData>();
  const getUploadUrlMutation = usePostMutation<{ uploadUrl: string }>();
  const refreshTokenMutation = useRefreshTokenMutation();
  const navigate = useNavigate();
  function onClose() {
    setValue("title", "");
    setValue("link", "");
    setValue("description", "");
    setValue("tags", "");
    setValue("type", "select");
    setValue("file", null);
  }
  const addContent: SubmitHandler<createContentInputs> = async (data) => {
    const file: File | null = data.file ? data.file[0] : null;
    const MAX_PDF_SIZE_MB = 10;
    if (file && file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      setIsFileError(true);
      console.log(file.type);
      return;
    }
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
            fileSize: file.size,
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
                fileSize: file.size,
                fileType: file.type,
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
    if (addPostMutation.status == "success") {
      navigate("/dashboard");
      setTimeout(() => {
        setIsPopup({ popup: true, message: "Content Added Successfully" });
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
    <div className={`flex sm:w-[70%] lg:w-[45%] w-full h-screen sm:pl-5`}>
      <form
        onSubmit={handleSubmit(addContent)}
        className="p-4 flex flex-col items-center gap-3 w-[100%]"
      >
        <div
          className="flex self-end cursor-pointer w-full justify-between font-medium text-purple-800 items-center"
          onClick={onClose}
        >
          <h1 className="font-bold md:text-xl">Add Content</h1>
          <ui.MenuButton size="sm" />
        </div>
        <div className="flex flex-col gap-2 w-full sm:pt-5">
          <ui.Input
            placeholder="Title"
            formHook={{ ...register("title", { minLength: 3 }) }}
            isWidthFull={true}
          />
          <ui.Select formHook={{ ...register("type") }} />
          {(contentType == "youtube" || contentType == "tweet") && (
            <ui.Input
              type="text"
              placeholder="Link"
              formHook={{ ...register("link") }}
            />
          )}
          {contentType == "document" ||
            (contentType == "image" && (
              <input type="radio" value={"link"} name="link" />
            ))}
          {(contentType == "document" ||
            contentType == "video" ||
            contentType == "image") && (
            <ui.Input type="file" formHook={{ ...register("file") }} />
          )}
          <ui.TextArea
            placeholder={contentType == "article" ? "Article" : "Description"}
            formHook={{ ...register("description") }}
          />
          <div className="flex gap-2 relative">
            <ui.Input
              placeholder="Tags"
              formHook={{ ...register("tags") }}
              isWidthFull={true}
            />
            <ui.Button
              size="md"
              text="Add"
              varient="secondary"
              classes=""
              textVisible={true}
              onClick={() =>
                getValues("tags") &&
                setTags((prev) => [...prev, getValues("tags")])
              }
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
        {(addPostMutation.isError && (
          <ui.ErrorBox errorMessage={addPostMutation?.error?.message} />
        )) ||
          (isFileError && (
            <ui.ErrorBox
              errorMessage={"Please upload a PDF smaller than 10 MB."}
            />
          )) ||
          (getUploadUrlMutation.isError && (
            <ui.ErrorBox errorMessage={getUploadUrlMutation?.error?.message} />
          ))}

        <div className="flex sm:grid-cols-2 w-full gap-2">
          <ui.Button
            varient="primary"
            text="Submit"
            size="md"
            textVisible={true}
            classes="flex-1"
            loading={addPostMutation.isPending}
            type="submit"
            isCenterText={true}
          />
          <ui.Button
            varient="secondary"
            text="Cancel"
            size="md"
            textVisible={true}
            type="button"
            onClick={() => navigate("/dashboard")}
            isCenterText={true}
          />
        </div>
      </form>
    </div>
  );
}
export default AddContent;
