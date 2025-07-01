"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import ChatLayout from "@/components/chat-layout";
import ErrorState from "@/components/error-state";
import LoadingState from "@/components/loading-state";
import { useChatWithAttachments } from "@/hooks/use-chat-with-attachments";
import { useChatData } from "@/hooks/use-chat-data";
import { useChatTransition } from "@/hooks/use-chat-transition";

export default function ChatPage() {
  const { isSignedIn } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : undefined;
  const [error, setError] = useState<string | null>(null);

  // Use custom hook for chat functionality with attachments
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    attachments,
    handleFileUpload,
    handleRemoveAttachment,
    isNewChat,
    setIsNewChat,
    isTransitioning,
    setIsTransitioning,
  } = useChatWithAttachments({ chatId });

  // Use our custom hook for fetching chat data
  const { isLoadingChat } = useChatData({
    chatId,
    isSignedIn,
    isTransitioning,
    isNewChat,
    messages,
    setMessages,
    setError,
  });

  // Use our custom hook for handling chat transitions
  useChatTransition({
    chatId,
    isTransitioning,
    setIsTransitioning,
    setIsNewChat,
  });

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

  const showWelcome = messages.length === 0 && !isLoading && !isLoadingChat;

  // Only show loading overlay for existing chats being fetched, not for new chats or during transitions
  const shouldShowLoadingOverlay =
    isLoadingChat && !isNewChat && !isTransitioning && messages.length === 0;

  return (
    <div className="relative h-full">
      {shouldShowLoadingOverlay && <LoadingState message="Loading chat..." />}

      <ChatLayout
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        showWelcome={showWelcome}
        inputPosition={showWelcome ? "center" : "bottom"}
        welcomeTitle="How can I help you?"
        attachments={attachments}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
