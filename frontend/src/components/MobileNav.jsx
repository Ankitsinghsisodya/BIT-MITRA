import { Home, MessageCircle, PlusSquare, Search, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const MobileNav = ({ onCreateClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/search", label: "Search" },
    { icon: PlusSquare, path: null, label: "Create", action: "create" },
    { icon: MessageCircle, path: "/chat", label: "Messages" },
    { icon: User, path: `/profile/${user?._id}`, label: "Profile", isProfile: true },
  ];

  const handleNavClick = (item) => {
    if (item.action === "create") {
      onCreateClick?.();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.isProfile ? (
                <Avatar className={`w-7 h-7 ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                  <AvatarImage src={user?.profilePicture} alt="profile" />
                  <AvatarFallback className="text-xs">
                    {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <item.icon 
                  className={`w-6 h-6 transition-transform duration-200 ${
                    active ? "scale-110" : ""
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
              )}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
