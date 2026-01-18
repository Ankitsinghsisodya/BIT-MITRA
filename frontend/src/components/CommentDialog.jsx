import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Comment from "./Comment";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

function CommentDialog({ open, setOpen }) {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const sendMessageHandler = async () => {
    if (!text.trim()) return;
    
    try {
      const res = await axios.post(
        `https://bit-mitra.onrender.com/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comments, res.data.comment];
        setComments(updatedCommentData);
        const updatedPostsData = posts.map((p) =>
          p._id === selectedPost?._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostsData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col md:flex-row h-[90vh] md:h-[80vh] max-h-[700px]">
          {/* Image Section */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
            <img
              src={selectedPost?.image}
              alt="post"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Comments Section */}
          <div className="w-full md:w-1/2 flex flex-col bg-card">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${selectedPost?.author?._id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                      {selectedPost?.author?.userName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  to={`/profile/${selectedPost?.author?._id}`}
                  className="font-semibold text-sm hover:text-primary transition-colors"
                >
                  {selectedPost?.author?.userName}
                </Link>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* Post Caption */}
              {selectedPost?.caption && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                      {selectedPost?.author?.userName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold mr-2">
                        {selectedPost?.author?.userName}
                      </span>
                      {selectedPost?.caption}
                    </p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {comments?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}

              {/* Empty State */}
              {(!comments || comments.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <h3 className="font-semibold text-xl mb-1">No comments yet.</h3>
                  <p className="text-muted-foreground text-sm">Start the conversation.</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  onChange={changeEventHandler}
                  value={text}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessageHandler();
                    }
                  }}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  size="sm"
                  className="btn-gradient rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDialog;
