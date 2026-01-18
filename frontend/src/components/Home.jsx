import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { Outlet } from "react-router-dom";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

function Home() {
  useGetAllPost();
  useGetSuggestedUsers();
  
  return (
    <div className="flex min-h-screen">
      {/* Main Feed Area */}
      <div className="flex-1 w-full">
        <Feed />
        <Outlet />
      </div>
      
      {/* Right Sidebar - Hidden on mobile/tablet */}
      <div className="hidden xl:block">
        <RightSidebar />
      </div>
    </div>
  );
}

export default Home;
