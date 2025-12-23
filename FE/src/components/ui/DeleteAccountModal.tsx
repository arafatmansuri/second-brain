import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { icons, ui } from "..";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { popupAtom } from "../../store/loadingState";

export function DeleteAccountModal() {
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const setIsPopup = useSetRecoilState(popupAtom);
  const navigate = useNavigate();
  const deleteAccountMutation = useAuthMutation();
  function deleteAccount() {
    deleteAccountMutation.mutate({
      endpoint: "deleteAccount",
      method: "DELETE",
      credentials: true,
    });
  }
  useEffect(() => {
    if (
      deleteAccountMutation.status == "success" &&
      deleteAccountMutation.variables?.method == "DELETE"
    ) {
      setIsPopup({ message: "Your account has been deleted", popup: true });
      deleteAccountMutation.mutate({
        endpoint: "signout",
        method: "POST",
        credentials: true,
      });
      setTimeout(() => {
        navigate("/");
        setIsPopup({ message: "", popup: false });
      }, 1000);
    }
  }, [deleteAccountMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "deleteAccount"
          ? "flex"
          : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center p-5`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 md:w-[45%]">
        <div className="flex w-full justify-between font-bold text-red-600 text-lg items-center">
          <h1>Are you sure you want to delete your account?</h1>
          <icons.CrossIcon
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setIsModalOpen({ open: false, modal: "deleteAccount" });
            }}
          />
        </div>
        <p className="text-sm text-gray-500 w-[89%] self-start">
          Deleting your account will remove all your notes, documents, tweets,
          and videos permanently. This action cannot be undone.
        </p>
        <div className="flex gap-2 self-start w-full">
          <ui.Button
            onClick={() =>
              setIsModalOpen({ open: false, modal: "deleteAccount" })
            }
            varient="google"
            text={"Cancel"}
            classes="flex-1 py-5"
            isCenterText={true}
            size="md"
            textVisible={true}
          />
          <ui.Button
            onClick={deleteAccount}
            varient="danger"
            text={"Delete Account"}
            size="md"
            classes="px-2 py-5"
            textVisible={true}
            widthFull={false}
            loading={deleteAccountMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
