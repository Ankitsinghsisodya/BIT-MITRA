import { readFileAsDataURL } from "@/lib/utils";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { Image, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

function CreatePost({ open, setOpen }) {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const createPostHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const response = await axios.post(
        "https://bit-mitra.onrender.com/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        dispatch(setPosts([response.data.post, ...posts]));
        toast.success(response.data.message);
        setOpen(false);
        setCaption("");
        setImagePreview("");
        setFile("");
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUri = await readFileAsDataURL(file);
      setImagePreview(dataUri);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFile("");
  };

  const handleClose = () => {
    setOpen(false);
    setCaption("");
    setImagePreview("");
    setFile("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center font-semibold">
            Create new post
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profilePicture} alt="profile" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                {user?.userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{user?.userName}</h3>
              <p className="text-xs text-muted-foreground">
                {user?.bio || "Sharing a moment..."}
              </p>
            </div>
          </div>

          {/* Caption Input */}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px] bg-transparent border-0 resize-none focus-visible:ring-0 p-0 text-base placeholder:text-muted-foreground"
            placeholder="Write a caption..."
          />

          {/* Image Preview */}
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-80 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            /* Upload Area */
            <div
              onClick={() => imageRef.current.click()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">Add photos</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload
              </p>
            </div>
          )}

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={fileChangeHandler}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {imagePreview && (
              <Button
                onClick={() => imageRef.current.click()}
                variant="secondary"
                className="flex-1 rounded-xl"
              >
                Change photo
              </Button>
            )}
            <Button
              onClick={createPostHandler}
              disabled={loading || (!imagePreview && !caption.trim())}
              className="flex-1 btn-gradient rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePost;
