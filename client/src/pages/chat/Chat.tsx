import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

import { useChatStore } from "@/stores/ChatStore";
import Topbar from "@/components/Topbar";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";

const Chat = () => {
  const { user } = useUser();
  const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.clerkId);
  }, [selectedUser, fetchMessages]);

  return (
    <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
      <Topbar />

      <div className="grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]">
        <UsersList />

        {/* chat message */}
        <div className="flex flex-col h-full">
          {selectedUser ? (
            <>
              <ChatHeader />

              {/* Messages */}
              <ScrollArea className="h-[calc(100vh-340px)]">
                <div className="p-4 space-y-4">
                  {messages.map((message) => {
                    const myId = user?.id;
                    const isMe = message.senderId === myId;

                    return (
                      <div
                        key={message._id}
                        className={`flex w-full items-end gap-3 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMe && (
                          <Avatar className="size-8">
                            <AvatarImage src={selectedUser.imageUrl} />
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg p-3 max-w-[70%] ${
                            isMe
                              ? "bg-blue-500 text-white text-right ml-auto"
                              : "bg-zinc-800 text-left"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs text-zinc-300 mt-1 block">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {isMe && (
                          <Avatar className="size-8">
                            <AvatarImage src={user?.imageUrl} />
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <MessageInput />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </main>
  );
};

export default Chat;

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <img src="/podify2.png" alt="Podify" className="size-16 animate-bounce" />
      <div className="text-center">
        <h3 className="text-zinc-300 text-lg font-medium mb-1">
          No Conversation Selected
        </h3>
        <p className="text-zinc-500 text-sm">
          Choose A Friend To Start Chatting!
        </p>
      </div>
    </div>
  );
};
