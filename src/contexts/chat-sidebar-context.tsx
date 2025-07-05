"use client";

import { createContext, useContext, ReactNode } from "react";
import { useChatList } from "@/hooks/use-chat-list";

interface ChatSidebarContextType {
  mutate: () => void;
}

const ChatSidebarContext = createContext<ChatSidebarContextType | null>(null);

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const { mutate } = useChatList();

  return (
    <ChatSidebarContext.Provider value={{ mutate }}>
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error('useChatSidebar must be used within a ChatSidebarProvider');
  }
  return context;
}
