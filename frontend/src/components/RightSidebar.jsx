import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function RightSidebar() {
  const { user } = useSelector((store) => store.auth);
  
  return (
    <aside className="w-80 shrink-0 p-6 hidden xl:block">
      <div className="sticky top-6 space-y-6">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
          <Link to={`/profile/${user?._id}`}>
            <Avatar className="w-14 h-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={user?.profilePicture} alt="profile" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg">
                {user?.userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link 
              to={`/profile/${user?._id}`}
              className="font-semibold text-sm text-foreground hover:text-primary transition-colors block truncate"
            >
              {user?.userName}
            </Link>
            <p className="text-muted-foreground text-sm truncate">
              {user?.bio || "Welcome to BIT-MITRA!"}
            </p>
          </div>
        </div>

        {/* Suggested Users */}
        <SuggestedUsers />

        {/* Footer Links */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="hover:underline cursor-pointer">About</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Help</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Press</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">API</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Jobs</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 BIT-MITRA
          </p>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;
