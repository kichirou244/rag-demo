import React from "react";
import { ChatContainer } from "../components/chat/ChatContainer.js";
import { Header } from "../components/common/Header.js";
import { useChat } from "../hooks/useChat.js";
import { useTheme } from "../hooks/useTheme.js";

export const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useChat();

  const handleSendMessage = (messageText: string) => {
    sendMessage(messageText, 5);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onClearMessages={clearMessages}
      />

      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden max-w-5xl w-full mx-auto">
        <ChatContainer
          messages={messages}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          onStopStreaming={stopStreaming}
          onClearMessages={clearMessages}
        />
      </main>
    </div>
  );
};
