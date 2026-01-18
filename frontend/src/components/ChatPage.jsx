import { setSelectedUser } from "@/redux/authSlice";
import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { ArrowLeft, Circle, MessageCircleCode, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Messages from "./Messages";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function ChatPage() {
  const [textMessage, setTextMessage] = useState("");
  const { messages } = useSelector((store) => store.chat);
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;
    
    try {
      const response = await axios.post(
        `https://bit-mitra.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        dispatch(setMessages([...messages, response.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen">
      {/* Users List Sidebar */}
      <aside 
        className={`${
          selectedUser ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 flex-col border-r border-border/50 bg-card/50`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <h1 className="font-bold text-xl">{user?.userName}</h1>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-2">
            <h2 className="px-3 py-2 text-sm font-semibold text-muted-foreground">
              Messages
            </h2>
            {suggestedUsers.map((suggedUser) => {
              const isOnline = onlineUsers.includes(suggedUser?._id);
              const isSelected = selectedUser?._id === suggedUser?._id;
              
              return (
                <button
                  key={suggedUser?._id}
                  onClick={() => dispatch(setSelectedUser(suggedUser))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-secondary' 
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={suggedUser?.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                        {suggedUser?.userName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-4 h-4 fill-success text-success" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold truncate">{suggedUser.userName}</p>
                    <p className={`text-xs ${isOnline ? 'text-success' : 'text-muted-foreground'}`}>
                      {isOnline ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      {selectedUser ? (
        <section className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-background`}>
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/50">
            <button
              onClick={() => dispatch(setSelectedUser(null))}
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedUser.profilePicture} alt="profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {selectedUser?.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {onlineUsers.includes(selectedUser?._id) && (
                <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-success text-success" />
              )}
            </div>
            <div>
              <p className="font-semibold">{selectedUser?.userName}</p>
              <p className={`text-xs ${onlineUsers.includes(selectedUser?._id) ? 'text-success' : 'text-muted-foreground'}`}>
                {onlineUsers.includes(selectedUser?._id) ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <Messages selectedUser={selectedUser} />

          {/* Message Input */}
          <div className="p-4 border-t border-border/50 bg-card/50">
            <div className="flex items-center gap-3 p-2 rounded-full bg-secondary/50 border border-border/50">
              <Input
                type="text"
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessageHandler(selectedUser?._id);
                  }
                }}
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                disabled={!textMessage.trim()}
                size="icon"
                className="rounded-full w-10 h-10 btn-gradient shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="hidden md:flex flex-1 flex-col items-center justify-center bg-background">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full border-2 border-foreground flex items-center justify-center mx-auto">
              <MessageCircleCode className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Your messages</h2>
              <p className="text-muted-foreground">Send a message to start a chat.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ChatPage;
