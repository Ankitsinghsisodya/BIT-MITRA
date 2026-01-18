import { useGetAllMessage } from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

function Messages({ selectedUser }) {
  useGetRTM();
  useGetAllMessage();
  const messagesEndRef = useRef(null);

  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
      {/* User Profile Header */}
      <div className="flex flex-col items-center justify-center py-8 mb-4">
        <Avatar className="w-20 h-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
          <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
            {selectedUser?.userName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold mt-3">{selectedUser?.userName}</h3>
        <p className="text-sm text-muted-foreground">BIT-MITRA</p>
        <Link to={`/profile/${selectedUser?._id}`}>
          <Button variant="secondary" size="sm" className="mt-3 rounded-lg">
            View profile
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2">
        {messages?.map((msg) => {
          const isSent = msg.senderId === user?._id;
          
          return (
            <div
              key={msg?._id}
              className={`flex ${isSent ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 ${
                  isSent
                    ? "message-sent"
                    : "message-received"
                }`}
              >
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Empty State */}
      {(!messages || messages.length === 0) && (
        <p className="text-center text-muted-foreground text-sm">
          No messages yet. Say hi! 👋
        </p>
      )}
    </div>
  );
}

export default Messages;
