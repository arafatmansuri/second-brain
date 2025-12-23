import { useForm, type SubmitHandler } from "react-hook-form";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ui } from "../components";
import { useAuthMutation } from "../queries/AuthQueries/queries";
import { addContentModalAtom } from "../store/AddContentModalState";
import { userAtom } from "../store/userState";
import { popupAtom } from "../store/loadingState";
import { useEffect } from "react";

function Profile() {
  const user = useRecoilValue(userAtom);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ username: string }>();
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const updateProfileMuatation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const setUser = useSetRecoilState(userAtom);
  const updateProfile: SubmitHandler<{ username: string }> = (data) => {
    if (data.username === user.username) {
      return;
    }
    updateProfileMuatation.mutate({
      endpoint: "updateprofile",
      method: "PUT",
      username: data.username,
      credentials:true
    });
  };
  useEffect(() => {
    if (updateProfileMuatation.isSuccess) {
      setUser(updateProfileMuatation.data)
      setIsPopup({ popup: true, message: "Profile updated successfully" });
    }
    setTimeout(() => {
      setIsPopup({ popup: false, message: "" });
    }, 1000);
  }, [updateProfileMuatation.isSuccess]);
  
  return (
    <div
      className={`sm:w-[80%] lg:w-[82%] w-full ${
        isModalOpen.open ? "bg-slate-500 opacity-70 border-none" : "bg-white"
      }`}
    >
      <div className={`p-3 w-full mb-5`}>
        <div className="flex justify-between items-center">
          <h1 className="font-bold md:text-3xl text-2xl text-purple-800">
            {user.username}
          </h1>
          <ui.MenuButton size="md" />
        </div>
        <div className="flex flex-col gap-2 w-full pt-5">
          <h1 className="font-semibold md:text-2xl text-xl">Update Profile</h1>
          <hr className="text-gray-500 mb-1" />
          <form
            onSubmit={handleSubmit(updateProfile)}
            className="flex flex-col gap-2 sm:w-[70%] lg:w-[50%] w-full"
          >
            <label className="font-semibold">Username</label>
            <ui.Input
              placeholder="Username"
              formHook={{
                ...register("username", { minLength: 3, required: true }),
              }}
              isWidthFull={true}
              defaultValue={user.username}
            />
            {errors.username?.type == "required" && (
              <span className="text-red-500 text-sm -mt-2 self-start">
                Username cannot be empty
              </span>
            )}
            {errors.username?.type == "minLength" && (
              <span className="text-red-500 text-sm -mt-2 self-start">
                Username must be atleast of 3 chars
              </span>
            )}
            <label className="font-semibold">Email</label>
            <ui.Input
              placeholder="Email"
              // formHook={{ ...register("title", { minLength: 3 }) }}
              isWidthFull={true}
              defaultValue={user.email}
              isDisabled={true}
            />
            {updateProfileMuatation.error && !errors.username && (
              <ui.ErrorBox
                errorMessage={
                  updateProfileMuatation.error.message
                    ? updateProfileMuatation.error.message
                    : updateProfileMuatation.error.message
                }
              />
            )}
            <ui.Button
              varient="green"
              text="Update Profile"
              size="md"
              textVisible={true}
              classes="w-36"
              loading={updateProfileMuatation.isPending}
              type="submit"
              isCenterText={true}
              widthFull={false}
            />
          </form>
        </div>
      </div>
      <div className="p-3 w-full">
        <h1 className="text-red-500 font-semibold md:text-2xl text-xl mb-1">
          Delete Account
        </h1>
        <hr className="text-gray-500 mb-1" />
        <span className="mb-3 text-gray-700 text-sm block">
          Once you delete your account, there is no going back. Please be
          certain.
        </span>
        <ui.Button
          varient="danger"
          text="Delete Account"
          size="md"
          textVisible={true}
          classes="w-36"
          onClick={() => setIsModalOpen({ open: true, modal: "deleteAccount" })}
          type="submit"
          isCenterText={true}
          widthFull={false}
        />
      </div>
    </div>
  );
}

export default Profile;
