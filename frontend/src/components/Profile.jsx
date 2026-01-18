import useGetUserProfile from "@/hooks/useGetUserProfile";
import { AtSign, Bookmark, Film, Grid3X3, Heart, MessageCircle, UserSquare2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

function Profile() {
  const params = useParams();
  const userId = params.id;

  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = user?.following.includes(userProfile?._id);
  const [activeTab, setActiveTab] = useState("posts");
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const displayPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const tabs = [
    { id: "posts", label: "POSTS", icon: Grid3X3 },
    { id: "saved", label: "SAVED", icon: Bookmark },
    { id: "reels", label: "REELS", icon: Film },
    { id: "tagged", label: "TAGGED", icon: UserSquare2 },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
          {/* Avatar */}
          <div className="shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profile"
                className="object-cover"
              />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white">
                {userProfile?.userName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center md:items-start gap-5 flex-1">
            {/* Username & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <h1 className="text-xl font-semibold">{userProfile?.userName}</h1>
              
              <div className="flex items-center gap-2">
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button variant="secondary" size="sm" className="rounded-lg font-semibold">
                        Edit profile
                      </Button>
                    </Link>
                    <Button variant="secondary" size="sm" className="rounded-lg font-semibold">
                      View archive
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button variant="secondary" size="sm" className="rounded-lg font-semibold">
                      Following
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-lg font-semibold">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="btn-gradient rounded-lg font-semibold px-6">
                    Follow
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center md:text-left">
                <span className="font-bold text-lg">{userProfile?.posts?.length || 0}</span>
                <span className="text-muted-foreground ml-1">posts</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity">
                <span className="font-bold text-lg">{userProfile?.followers?.length || 0}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity">
                <span className="font-bold text-lg">{userProfile?.following?.length || 0}</span>
                <span className="text-muted-foreground ml-1">following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-center md:text-left space-y-2">
              <p className="font-medium">{userProfile?.bio || "No bio yet."}</p>
              <Badge variant="secondary" className="gap-1">
                <AtSign className="w-3 h-3" />
                {userProfile?.userName}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex items-center justify-center gap-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 py-4 text-xs font-semibold tracking-wider transition-all border-t-2 -mt-px ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 mt-1">
          {displayPost?.map((post) => (
            <div
              key={post?._id}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-sm"
            >
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post?.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{post?.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!displayPost || displayPost.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
              {activeTab === "posts" ? (
                <Grid3X3 className="w-10 h-10 text-foreground" />
              ) : activeTab === "saved" ? (
                <Bookmark className="w-10 h-10 text-foreground" />
              ) : activeTab === "reels" ? (
                <Film className="w-10 h-10 text-foreground" />
              ) : (
                <UserSquare2 className="w-10 h-10 text-foreground" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {activeTab === "posts" ? "No Posts Yet" : 
               activeTab === "saved" ? "No Saved Posts" :
               activeTab === "reels" ? "No Reels Yet" : "No Tagged Posts"}
            </h3>
            <p className="text-muted-foreground">
              {isLoggedInUserProfile 
                ? "Share photos and videos that will appear on your profile."
                : "When they share, their posts will show up here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
