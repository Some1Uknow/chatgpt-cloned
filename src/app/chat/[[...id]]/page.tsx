"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import useSWR from "swr";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { ChatData } from "@/types/chat";
import ChatLayout from "@/components/chat-layout";
import ErrorState from "@/components/error-state";
import { FileAttachment } from "@/components/file-upload-dropdown";

// Fetcher function for SWR
const fetcher = async (url: string): Promise<ChatData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Chat not found" : "Failed to load chat"
    );
  }
  return response.json();
};

export default function ChatPage() {
  const { isSignedIn } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : undefined;

  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isNewChat, setIsNewChat] = useState<boolean>(!chatId);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const newChatIdRef = useRef<string | null>(null);

  // Use SWR to fetch chat data, but only for existing chats with messages
  // Don't fetch if we just transitioned from a new chat to avoid disruption
  const shouldFetch = isSignedIn && chatId && !isTransitioning;
  const {
    data: chatData,
    error: swrError,
    isLoading: isLoadingChat,
  //  mutate: mutateChatData,
  } = useSWR(shouldFetch ? `/api/chat?id=${chatId}` : null, fetcher, {
    // Don't revalidate when the window gains focus to prevent disruption
    revalidateOnFocus: false,
    // Don't automatically retry on error for new chats
    shouldRetryOnError: (error) => {
      // Don't retry if it's a 404 (chat not found) - this is expected for new chats
      return error?.message !== "Chat not found";
    },
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: chatId ? `/api/chat?id=${chatId}` : "/api/chat",
    onResponse(response) {
      if (!chatId) {
        const newChatId = response.headers.get("X-Chat-Id");
        if (newChatId) {
          newChatIdRef.current = newChatId;
        }
      }
    },
    onFinish(message) {
      console.log("Message finished:", message);
      if (!chatId && newChatIdRef.current && message.role === "assistant") {
        setIsNewChat(false);
        setIsTransitioning(true);
        router.replace(`/chat/${newChatIdRef.current}`, { scroll: false });
        newChatIdRef.current = null;
      }
    },
    onError(error) {
      console.error("Chat error:", error);
      setError("Failed to send message. Please try again.");
    },
  });

  // Handle SWR data and errors in useEffect to avoid setState during render
  useEffect(() => {
    if (swrError) {
      // If it's a 404 error and we have an active chat with messages, it's likely a new chat
      // Don't show error for new chats that haven't been saved yet
      if (swrError.message === "Chat not found" && messages.length > 0) {
        setError(null);
      } else if (swrError.message !== "Chat not found") {
        setError(swrError.message);
      }
    } else if (chatData && chatData.messages && !isNewChat) {
      const formattedMessages = chatData.messages.map((msg, index) => {
        const baseMessage = {
          id: `${chatId}-${index}`,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.timestamp),
        };

        // Convert database attachments to experimental_attachments format for AI SDK compatibility
        if (msg.attachments && msg.attachments.length > 0) {
          (
            baseMessage as {
              experimental_attachments?: Array<{
                name: string;
                contentType: string;
                url: string;
              }>;
            }
          ).experimental_attachments = msg.attachments.map(
            (attachment: { name: string; type: string; url: string }) => ({
              name: attachment.name,
              contentType:
                attachment.type === "image" ? "image/*" : "application/pdf",
              url: attachment.url,
            })
          );
        }

        return baseMessage;
      });

      // Only set messages if they're different to avoid infinite re-renders
      // Also ensure we're not overriding messages from an active new chat
      if (
        messages.length === 0 ||
        (messages.length > 0 && messages[0]?.id !== `${chatId}-0`)
      ) {
        setMessages(formattedMessages);
        setError(null); // Clear any previous errors
      }
    }
  }, [swrError, chatData, chatId, messages, setMessages, isNewChat]);

  // Handle chatId changes to update isNewChat state
  useEffect(() => {
    const wasNewChat = !chatId;
    setIsNewChat(wasNewChat);

    // If we have a chatId and we were transitioning, end the transition after a delay
    if (chatId && isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Allow 1 second for the transition to complete
      return () => clearTimeout(timer);
    }
  }, [chatId, isTransitioning]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // Convert attachments to AI SDK format
    const experimental_attachments = attachments.map((attachment) => ({
      name: attachment.name,
      contentType: attachment.type === "image" ? "image/*" : "application/pdf",
      url: attachment.url,
    }));

    // Store attachments for backend processing before clearing
    const attachmentsForBackend = [...attachments];

    // Clear attachments immediately after sending
    setAttachments([]);

    // Use handleSubmit with experimental_attachments
    const formEvent = e as React.FormEvent<HTMLFormElement> & {
      preventDefault: () => void;
    };
    formEvent.preventDefault = () => {}; // Prevent double preventDefault

    originalHandleSubmit(e, {
      experimental_attachments: experimental_attachments,
      body: {
        attachments: attachmentsForBackend, // Keep for backend processing
      },
    });
  };

  const handleFileUpload = (attachment: FileAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const showWelcome = messages.length === 0 && !isLoading && !isLoadingChat;

  // Only show loading overlay for existing chats being fetched, not for new chats or during transitions
  const shouldShowLoadingOverlay =
    isLoadingChat && !isNewChat && !isTransitioning && messages.length === 0;

  return (
    <div className="relative h-full">
      {shouldShowLoadingOverlay && <></>}

      <ChatLayout
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={onSubmit}
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
