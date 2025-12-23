import { useEffect, useState } from "react";
import { BsLinkedin, BsTwitterX } from "react-icons/bs";
import { MdEmail, MdWhatsapp } from "react-icons/md";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { icons, ui } from "..";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { isCopyAtom, popupAtom } from "../../store/loadingState";
import { postAtom } from "../../store/postState";
import { userAtom } from "../../store/userState";
import { Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useMediaQuery } from "../../hooks/useMediaQuery";
type shareTypes =
  | "whatsapp"
  | "copy"
  | "tweeter"
  | "facebook"
  | "email"
  | "linkedin";
export function ShareContentMoal() {
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const [shareType, setShareType] = useState<shareTypes>("copy");
  const setIsPopup = useSetRecoilState(popupAtom);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isCopy, setIsCopy] = useRecoilState(isCopyAtom);
  const setUser = useSetRecoilState(userAtom);
  const posts = useRecoilValue(postAtom);
  const shareContentMutation = usePostMutation<{
    link: string;
    contentCount: number;
  }>();
  function ShareContent({ type }: { type?: shareTypes }) {
    shareContentMutation.mutate({
      endpoint: "share?reqtype=copy",
      method: "PUT",
    });
    setShareType(type || "copy");
  }
  useEffect(() => {
    if (shareContentMutation.status == "success") {
      setUser((prev) => ({ ...prev, shared: !prev.shared }));
      if (shareContentMutation.data?.link !== "" && !isCopy) {
        setIsPopup({ message: "Your Brain set to Public", popup: true });
        const link = `https://www.secondbrain.services/dashboard/${shareContentMutation.data?.link}`;
        switch (shareType) {
          case "tweeter": {
            const twitterUrl = `https://twitter.com/intent/tweet?text=Check out my Second Brain: ${encodeURIComponent(
              link
            )}`;
            window.open(twitterUrl, "_blank");
            break;
          }
          case "facebook": {
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              link
            )}`;
            window.open(facebookUrl, "_blank");
            break;
          }
          case "email": {
            const emailUrl = `mailto:?subject=Check out my Second Brain&body=Check out my Second Brain: ${encodeURIComponent(
              link
            )}`;
            window.open(emailUrl, "_blank");
            break;
          }
          case "linkedin": {
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              link
            )}`;
            window.open(linkedinUrl, "_blank");
            break;
          }
          case "whatsapp": {
            const whatsappUrl = `https://api.whatsapp.com/send?text=Check out my Second Brain: ${encodeURIComponent(
              link
            )}`;
            window.open(whatsappUrl, "_blank");
            break;
          }
          case "copy":
            navigator.clipboard.writeText(link);
            setIsCopy(true);
            setIsPopup({ message: "Link Copied to Clipboard", popup: true });
            break;
          default:
            navigator.clipboard.writeText(link);
            setIsCopy(true);
            setIsPopup({ message: "Link Copied to Clipboard", popup: true });
            break;
        }
      }
      setTimeout(() => {
        setIsCopy(false);
        setIsPopup({ message: "", popup: false });
      }, 3000);
    }
  }, [shareContentMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "share" ? "flex" : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center p-5 z-10`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 w-96">
        <div className="flex self-end w-full justify-between font-bold text-purple-800 text-lg">
          <h1>Share Your Second Brain</h1>
          <icons.CrossIcon
            size="sm"
            onClick={() => {
              setIsModalOpen({ open: false, modal: "share" });
            }}
            className="cursor-pointer"
          />
        </div>
        <p className="text-sm text-gray-500 w-[89%] self-start">
          Share your entire collection of notes, documents, tweets, and videos
          with others. They'll be able to your content into their own Second
          Brain.
        </p>
        <div className="md:grid flex md:grid-cols-3 gap-2 self-start flex-wrap">
          <ui.Button
            onClick={() => ShareContent({ type: "copy" })}
            varient="primary"
            text={isCopy ? "Copied" : "Copy"}
            size="sm"
            // classes="px-4"
            isCenterText={true}
            textVisible={isDesktop && true}
            widthFull={false}
            startIcon={isCopy ? <icons.Copied /> : <icons.CopyIcon />}
            loading={shareContentMutation.isPending && shareType == "copy"}
          />
          <ui.Button
            onClick={() => ShareContent({ type: "whatsapp" })}
            varient="green"
            text={"Whatsapp"}
            size="sm"
            isCenterText={true}
            // classes="px-4"
            textVisible={isDesktop && true}
            widthFull={false}
            startIcon={<FaWhatsapp className="size-4" />}
            loading={shareContentMutation.isPending && shareType == "whatsapp"}
          />
          <ui.Button
            onClick={() => ShareContent({ type: "email" })}
            varient="google"
            text={"Email"}
            size="sm"
            // classes="px-4 py-4"
            textVisible={isDesktop && true}
            widthFull={false}
            isCenterText={true}
            startIcon={<Mail className="size-5" />}
            loading={shareContentMutation.isPending && shareType == "email"}
          />
          <ui.Button
            onClick={() => ShareContent({ type: "linkedin" })}
            varient="blue"
            text={"LinkedIn"}
            size="sm"
            classes="px-4"
            textVisible={isDesktop && true}
            widthFull={false}
            startIcon={<BsLinkedin className="size-4" />}
            loading={shareContentMutation.isPending && shareType == "linkedin"}
          />
          <ui.Button
            onClick={() => ShareContent({ type: "tweeter" })}
            varient="black"
            text={"Tweeter"}
            size="sm"
            classes="px-4"
            textVisible={isDesktop && true}
            widthFull={false}
            isCenterText={true}
            startIcon={<BsTwitterX className="size-4" />}
            loading={shareContentMutation.isPending && shareType == "tweeter"}
          />
        </div>
        <span className="text-sm text-center w-full text-gray-400">
          {posts.length} items will be shared
        </span>
      </div>
    </div>
  );
}
