import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function SuggestedUsers() {
  const { suggestedUsers } = useSelector((store) => store.auth);
  // console.log("SuggestedUsers", suggestedUsers);
  return (
    <div className="my-10 ">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="cursor-pointer font-medium">See All</span>
      </div>
      {suggestedUsers?.map((user) => {
        return (
          <div key={user?._id} className="flex items-center justify-between my-5">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage
                    src={user?.profilePicture}
                    alt="post_image"
                    className="w-5 h-5 rounded-full"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}>{user?.userName}</Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {user?.bio || "Bio here ..."}
                </span>
              </div>
            </div>
            <span className="text-[#3BADF8] font-bold cursor-pointer hover:text-[#349ce1]">Follow</span>
          </div>
        );
      })}
    </div>
  );
}

export default SuggestedUsers;
