import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "sonner";

function EditProfile() {
  const { user } = useSelector((store) => store.auth);
  const imageref = useRef();
  const [input, setInput] = useState({
    profilePicture: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePicture: file });
    }
  };
  const selectedChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };
  const [loading, setLoading] = useState(false);

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePicture) formData.append("profilePicture", input.profilePicture);
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        const updatedUserData = {
          ...user,
          bio: response.data.user?.bio,
          profilePicture: response.data.user?.profilePicture,
          gender: response.data.user?.gender,
        };
        dispatch(setAuthUser(updatedUserData))
        navigate(`/profile/${user._id}`)
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false)
    }
  };
  return (
    <div className="flex max-w-2xl mx-auto pl-10 ">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center  gap-3">
            <Avatar>
              <AvatarImage
                src={user?.profilePicture}
                alt="post_image"
                className="w-5 h-5 rounded-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600">
                {user?.bio || "Bio here ..."}
              </span>
            </div>
          </div>

          <input ref={imageref} onChange={fileChangeHandler} type="file" className="hidden" />
          <Button
            onClick={() => imageref?.current.click()}
            className="bg-[#0095F6] h-8 hover:bg-[#2889c9]"
          >
            Change photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            name="bio"
            className="focus-visible:ring-transparent "
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
          />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectedChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#0095F6] hover:bg-[#3c779f]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#3c779f]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default EditProfile;
