import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/ChatStore";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const MessageInput = () => {
  const [newMessage, setNewMessage] = useState("");

  const { user } = useUser();

  const { selectedUser, sendMessage } = useChatStore();

  const handleSend = () => {
    if (!user || !selectedUser || !newMessage) {
      return;
    }
    sendMessage(selectedUser.clerkId, newMessage.trim());
    setNewMessage("");
  };

  return (
    <div className="p-4 mt-auto border-t border-zinc-800">
      <div className="flex gap-2">
        <Input
          placeholder="Type a Message"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          className="bg-zinc-800 border-none"
        />
        <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
