// @ts-nocheck
import React from "react";
import { Helmet } from "react-helmet-async";
import { EnhancedChatInterface } from "@/components/chat/group/EnhancedChatInterface";
import { useIsMobile } from "@/hooks/use-mobile";

const Chat = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Messages | Eloity</title>
        <meta
          name="description"
          content="Unified messaging for social chats, freelance projects, marketplace communications, crypto P2P trading, and AI assistance"
        />
      </Helmet>
      <div className="h-screen bg-background">
        <EnhancedChatInterface className="h-full" />
      </div>
    </>
  );
};

export default Chat;
