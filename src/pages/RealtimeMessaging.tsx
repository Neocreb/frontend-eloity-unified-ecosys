import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import ConversationsList from "@/components/messaging/ConversationsList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useRealtimeMessaging } from "@/hooks/use-realtime-messaging";

const RealtimeMessaging = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { selectConversation } = useRealtimeMessaging();

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    await selectConversation(conversationId);
  };

  const handleCloseChat = () => {
    setSelectedConversationId(null);
  };

  return (
    <>
      <Helmet>
        <title>Messages | Eloity</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Real-time Messaging</h1>

        <div className="flex gap-6">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />

          <div className="flex-1">
            <ChatWindow
              conversationId={selectedConversationId}
              onClose={handleCloseChat}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RealtimeMessaging;
