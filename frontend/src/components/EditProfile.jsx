import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

function EditProfile() {
  const { user } = useSelector((store) => store.auth);
  const imageref = useRef();
  const [input, setInput] = useState({
    profilePicture: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePicture: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
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
    if (input.profilePicture)
      formData.append("profilePicture", input.profilePicture);
    try {
      setLoading(true);
      const response = await axios.post(
        "https://bit-mitra.onrender.com/api/v1/user/profile/edit",
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
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="glass rounded-3xl p-6 md:p-10 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">
              Update your profile information
            </p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-secondary/50">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage
                  src={previewImage || user?.profilePicture}
                  alt="profile"
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                  {user?.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => imageref?.current.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{user?.userName}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {user?.bio || "No bio yet"}
              </p>
            </div>

            <input
              ref={imageref}
              onChange={fileChangeHandler}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => imageref?.current.click()}
              size="sm"
              className="btn-gradient rounded-lg"
            >
              Change photo
            </Button>
          </div>

          {/* Bio Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Bio</Label>
            <Textarea
              value={input.bio}
              name="bio"
              placeholder="Tell people about yourself..."
              className="min-h-[100px] bg-background/50 border-border/50 rounded-xl resize-none input-focus"
              onChange={(e) => setInput({ ...input, bio: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {input.bio?.length || 0} / 150 characters
            </p>
          </div>

          {/* Gender Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Gender</Label>
            <Select
              defaultValue={input.gender}
              onValueChange={selectedChangeHandler}
            >
              <SelectTrigger className="w-full h-12 bg-background/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="glass rounded-xl">
                <SelectItem value="male" className="rounded-lg">Male</SelectItem>
                <SelectItem value="female" className="rounded-lg">Female</SelectItem>
                <SelectItem value="other" className="rounded-lg">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/profile/${user?._id}`)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={editProfileHandler}
              disabled={loading}
              className="btn-gradient rounded-xl px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
