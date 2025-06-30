"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { ChatMessage, ChatData } from "@/types/chat";
import ChatLayout from "@/components/chat-layout";
import ErrorState from "@/components/error-state";

export default function ChatIdPage() {
  const { isSignedIn } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;

  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: `/api/chat?id=${chatId}`,
    onError(error) {
      console.error("Chat error: from ID page", error);
      setError("Failed to send message. Please try again.");
    },
    onFinish(message) {
      console.log("Message finished:", message);
    },
  });

  // Fetch existing chat data
  useEffect(() => {
    if (!isSignedIn || !chatId) {
      console.log(
        "Skipping fetch - isSignedIn:",
        isSignedIn,
        "chatId:",
        chatId
      );
      return;
    }

    console.log("Fetching chat data for chatId:", chatId);
    const fetchChatData = async () => {
      try {
        setIsLoadingChat(true);
        const response = await fetch(`/api/chat?id=${chatId}`);

        console.log("API response status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("Chat not found");
            setError("Chat not found");
          } else {
            console.log("Failed to load chat");
            setError("Failed to load chat");
          }
          return;
        }

        const data: ChatData = await response.json();
        console.log("Chat data loaded:", data);
        setChatData(data);

        // Convert the messages to the format expected by useChat
        const formattedMessages = data.messages.map((msg, index) => ({
          id: `${chatId}-${index}`,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.timestamp),
        }));

        setMessages(formattedMessages);
        setError(null);
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError("Failed to load chat");
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatData();
  }, [isSignedIn, chatId, setMessages]);

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

  return (
    <div className="relative">
      {/* Loading overlay */}
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
        inputPosition="bottom"
      />
    </div>
  );
}
