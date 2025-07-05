import { useEffect } from "react";
import useSWR from "swr";
import { ChatData, UIMessage } from "@/types/chat";

const getContentType = (type: string): string => {
  switch (type) {
    case "image":
      return "image/*";
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    case "csv":
      return "text/csv";
    default:
      return "application/octet-stream";
  }
};

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

interface UseChatDataProps {
  chatId?: string;
  isSignedIn: boolean | undefined;
  isTransitioning: boolean;
  isNewChat: boolean;
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  setError: (error: string | null) => void;
}

export function useChatData({
  chatId,
  isSignedIn,
  isTransitioning,
  isNewChat,
  messages,
  setMessages,
  setError,
}: UseChatDataProps) {
  // Use SWR to fetch chat data, but only for existing chats with messages
  // Don't fetch if we just transitioned from a new chat to avoid disruption
  const shouldFetch = isSignedIn && chatId && !isTransitioning;
  
  const {
    data: chatData,
    error: swrError,
    isLoading: isLoadingChat,
  } = useSWR(shouldFetch ? `/api/chat?id=${chatId}` : null, fetcher, {
    // Don't revalidate when the window gains focus to prevent disruption
    revalidateOnFocus: false,
    // Don't automatically retry on error for new chats
    shouldRetryOnError: (error) => {
      // Don't retry if it's a 404 (chat not found) - this is expected for new chats
      return error?.message !== "Chat not found";
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
              contentType: getContentType(attachment.type),
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
  }, [swrError, chatData, chatId, isNewChat]); // Remove messages, setMessages, setError to prevent infinite loops

  return {
    isLoadingChat,
    chatData,
  };
}
