import { useRecoilValue } from "recoil";
import { ui } from "../components";
import { userAtom } from "../store/userState";

function Profile() {
  const user = useRecoilValue(userAtom);
  return (
    <div className={`sm:w-[80%] lg:w-[82%] w-full`}>
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
          <div className="flex flex-col gap-2 sm:w-[70%] lg:w-[50%] w-full">
            <label className="font-semibold">Username</label>
            <ui.Input
              placeholder="Username"
              // formHook={{ ...register("title", { minLength: 3 }) }}
              isWidthFull={true}
              defaultValue={user.username}
            />
            <label className="font-semibold">Email</label>
            <ui.Input
              placeholder="Email"
              // formHook={{ ...register("title", { minLength: 3 }) }}
              isWidthFull={true}
              defaultValue={user.email}
              isDisabled={true}
            />
            <ui.Button
              varient="green"
              text="Update Profile"
              size="md"
              textVisible={true}
              classes="w-36"
              // loading={addPostMutation.isPending}
              type="submit"
              isCenterText={true}
              widthFull={false}
            />
          </div>
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
          // loading={addPostMutation.isPending}
          type="submit"
          isCenterText={true}
          widthFull={false}
        />
      </div>
    </div>
  );
}

export default Profile;
