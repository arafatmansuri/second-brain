import { useRecoilValue } from "recoil";
import { popupAtom } from "../../store/loadingState";

export function Popup() {
  const isPopup = useRecoilValue(popupAtom);
  return (
    <div
      className={`${
        isPopup.popup ? "flex" : "hidden"
      } md:w-[25%] md:h-[12%] h-[10%] w-fit justify-between text-black fixed bottom-16 md:right-14 right-5 items-center rounded-md z-10 bg-purple-300 text-nowrap gap-3`}
    >
      <p className="font-bold text-purple-900 pl-4 text-center">
        {isPopup.message}
      </p>
      <span
        className={`md:w-[10%] w-7 h-full ${
          isPopup.message.includes("Deleted") ? "bg-red-500" : "bg-green-500"
        } text-white rounded-tr-md rounded-br-md`}
      ></span>
    </div>
  );
}
