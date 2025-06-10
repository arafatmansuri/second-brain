import { useRecoilValue } from "recoil";
import { popupAtom } from "../../store/loadingState";

export function Popup() {
  const isPopup = useRecoilValue(popupAtom);
  return (
    <div
      className={`${
        isPopup.popup ? "flex" : "hidden"
      } w-[28%] h-[12%] justify-between text-black fixed bottom-16 right-14 items-center rounded-md z-10 bg-purple-300`}
    >
      <p className="font-bold text-purple-900 pl-4 text-center">
        {isPopup.message}
      </p>
      <span
        className={`w-[20%] h-full ${
          isPopup.message.includes("Deleted") ? "bg-red-500" : "bg-green-500"
        } text-white rounded-tr-md rounded-br-md`}
      ></span>
    </div>
  );
}
