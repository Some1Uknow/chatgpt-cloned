"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import useSWR from "swr";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { ChatData } from "@/types/chat";
import ChatLayout from "@/components/chat-layout";
import ErrorState from "@/components/error-state";

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ChatData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.status === 404 ? "Chat not found" : "Failed to load chat");
  }
  return response.json();
};

export default function ChatPage() {
  const { isSignedIn } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : undefined;

  // Use SWR to fetch chat data
  const shouldFetch = isSignedIn && chatId;
  const { data: chatData, error: swrError, isLoading: isLoadingChat } = useSWR(
    shouldFetch ? `/api/chat?id=${chatId}` : null,
    fetcher
  );

  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: chatId ? `/api/chat?id=${chatId}` : "/api/chat",
    onResponse(response) {
      if (!chatId) {
        const newChatId = response.headers.get("X-Chat-Id");
        if (newChatId) {
          router.replace(`/chat/${newChatId}`, { scroll: false });
        }
      }
    },
    onError(error) {
      console.error("Chat error:", error);
      setError("Failed to send message. Please try again.");
    },
    onFinish(message) {
      console.log("Message finished:", message);
    },
  });

  // Handle SWR data and errors in useEffect to avoid setState during render
  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
    } else if (chatData && chatData.messages) {
      const formattedMessages = chatData.messages.map((msg, index) => ({
        id: `${chatId}-${index}`,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.timestamp),
      }));
      
      // Only set messages if they're different to avoid infinite re-renders
      if (messages.length === 0 || messages[0]?.id !== `${chatId}-0`) {
        setMessages(formattedMessages);
        setError(null); // Clear any previous errors
      }
    }
  }, [swrError, chatData, chatId, messages, setMessages]);

  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => router.push("/chat")}
        retryButtonText="Go to New Chat"
      />
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleSubmit(e);
    }
  };

  const showWelcome = messages.length === 0 && !isLoading && !isLoadingChat;

  return (
    <div className="relative h-full">
      {isLoadingChat && (
        <div className="absolute inset-0 bg-[#212121]/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-white/60">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}

      <ChatLayout
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={onSubmit}
        showWelcome={showWelcome}
        inputPosition={showWelcome ? "center" : "bottom"}
        welcomeTitle="How can I help you?"
      />
    </div>
  );
}
