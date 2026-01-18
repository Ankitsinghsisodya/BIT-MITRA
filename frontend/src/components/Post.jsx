import { setPosts, setSelectedPost } from "@/redux/postSlice";
import axios from "axios";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CommentDialog from "./CommentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      
      // Trigger animation
      if (!liked) {
        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 300);
      }
      
      const res = await axios.get(
        `https://bit-mitra.onrender.com/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p?._id === post?._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user?._id)
                  : [...p.likes, user?._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://bit-mitra.onrender.com/api/v1/post/${post?._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p?._id === post?._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `https://bit-mitra.onrender.com/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.messsage);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `https://bit-mitra.onrender.com/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <article className="post-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={post.author?.profilePicture} alt="profile" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
              {post.author?.userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer transition-colors">
                {post.author?.userName}
              </span>
              {user?._id === post.author?._id && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  Author
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="glass rounded-2xl max-w-sm">
            <div className="flex flex-col divide-y divide-border">
              {post?.author?._id !== user?._id && (
                <Button
                  variant="ghost"
                  className="justify-center py-4 text-error font-semibold hover:bg-error/10"
                >
                  Unfollow
                </Button>
              )}
              <Button variant="ghost" className="justify-center py-4">
                Add to favorites
              </Button>
              {user && user?._id === post?.author?._id && (
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="justify-center py-4 text-error hover:bg-error/10"
                >
                  Delete
                </Button>
              )}
              <Button variant="ghost" className="justify-center py-4">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image */}
      <div className="relative bg-secondary/30">
        <img
          className="w-full aspect-square object-cover"
          src={post.image}
          alt="post"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={likeOrDislikeHandler}
              className={`transition-transform duration-200 hover:scale-110 ${isLikeAnimating ? 'animate-heart-pop' : ''}`}
            >
              {liked ? (
                <Heart className="w-6 h-6 fill-error text-error" />
              ) : (
                <Heart className="w-6 h-6 text-foreground hover:text-muted-foreground" />
              )}
            </button>

            <button
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="transition-transform duration-200 hover:scale-110"
            >
              <MessageCircle className="w-6 h-6 text-foreground hover:text-muted-foreground" />
            </button>
            
            <button className="transition-transform duration-200 hover:scale-110">
              <Send className="w-6 h-6 text-foreground hover:text-muted-foreground" />
            </button>
          </div>
          
          <button
            onClick={bookmarkHandler}
            className="transition-transform duration-200 hover:scale-110"
          >
            <Bookmark className="w-6 h-6 text-foreground hover:text-muted-foreground" />
          </button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm">{postLike.toLocaleString()} likes</p>

        {/* Caption */}
        <p className="text-sm">
          <span className="font-semibold mr-2 hover:text-primary cursor-pointer transition-colors">
            {post.author?.userName}
          </span>
          <span className="text-foreground/90">{post.caption}</span>
        </p>

        {/* View Comments */}
        {comment.length > 0 && (
          <button
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all {comment.length} comments
          </button>
        )}

        {/* Comment Dialog */}
        <CommentDialog open={open} setOpen={setOpen} />

        {/* Add Comment */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {text && (
            <button
              onClick={commentHandler}
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Post
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default Post;
