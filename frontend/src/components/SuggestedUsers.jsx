import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function SuggestedUsers() {
  const { suggestedUsers } = useSelector((store) => store.auth);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground">
          Suggested for you
        </h3>
        <button className="text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors">
          See All
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {suggestedUsers?.map((user) => (
          <div
            key={user?._id}
            className="flex items-center gap-3 group"
          >
            <Link to={`/profile/${user?._id}`}>
              <Avatar className="w-11 h-11 ring-2 ring-transparent group-hover:ring-primary/20 transition-all ring-offset-2 ring-offset-background">
                <AvatarImage src={user?.profilePicture} alt="profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
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
              <p className="text-muted-foreground text-xs truncate">
                {user?.bio || "New to BIT-MITRA"}
              </p>
            </div>
            
            <button className="text-xs font-bold text-primary hover:text-primary-hover transition-colors shrink-0">
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!suggestedUsers || suggestedUsers.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No suggestions available
        </p>
      )}
    </div>
  );
}

export default SuggestedUsers;
