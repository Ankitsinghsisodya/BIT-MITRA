import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import axios from "axios";
import {
    Heart,
    Home,
    LogOut,
    MessageCircle,
    PlusSquare,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreatePost from "./CreatePost";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "https://bit-mitra.onrender.com/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    }
  };

  const isActive = (text) => {
    if (text === "Home") return location.pathname === "/";
    if (text === "Profile") return location.pathname.includes("/profile");
    if (text === "Messages") return location.pathname === "/chat";
    return false;
  };

  const sidebarItems = [
    { icon: Home, text: "Home" },
    { icon: Search, text: "Search" },
    { icon: TrendingUp, text: "Explore" },
    { icon: MessageCircle, text: "Messages" },
    { icon: Heart, text: "Notifications" },
    { icon: PlusSquare, text: "Create" },
    {
      icon: null,
      text: "Profile",
      isProfile: true,
    },
    { icon: LogOut, text: "Logout" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-20 hidden md:flex flex-col h-screen glass border-r border-border/50 transition-all duration-300 lg:w-64 w-20">
        <div className="flex flex-col h-full px-3 py-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient hidden lg:block">
              BIT-MITRA
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item, index) => {
              const active = isActive(item.text);
              const Icon = item.icon;

              return (
                <div
                  onClick={() => sidebarHandler(item.text)}
                  key={index}
                  className={`nav-item relative group ${
                    active ? "active" : ""
                  } ${item.text === "Logout" ? "text-error hover:bg-error/10" : ""}`}
                >
                  {item.isProfile ? (
                    <Avatar className={`w-6 h-6 shrink-0 ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                      <AvatarImage src={user?.profilePicture} alt="profile" />
                      <AvatarFallback className="text-xs">
                        {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Icon className={`w-6 h-6 shrink-0 ${active ? "text-primary" : ""}`} />
                  )}
                  
                  <span className={`hidden lg:block font-medium ${active ? "text-primary" : ""}`}>
                    {item.text}
                  </span>

                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 lg:hidden whitespace-nowrap z-50">
                    {item.text}
                  </div>

                  {/* Notifications Badge */}
                  {item.text === "Notifications" && likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-error hover:bg-error absolute -top-1 left-4 lg:left-auto lg:right-2 text-xs font-bold"
                        >
                          {likeNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 glass">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Notifications</h4>
                          {likeNotification.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No new notifications</p>
                          ) : (
                            likeNotification.map((notification) => (
                              <div
                                key={notification.userId}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                              >
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={notification.userDetails?.profilePicture} />
                                  <AvatarFallback>
                                    {notification.userDetails?.userName?.charAt(0)?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm">
                                  <span className="font-semibold">
                                    {notification.userDetails?.userName}
                                  </span>{" "}
                                  liked your post
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSidebar;
