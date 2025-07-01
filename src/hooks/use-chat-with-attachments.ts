import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { FileAttachment } from "@/components/file-upload-dropdown";

interface UseChatWithAttachmentsProps {
  chatId?: string;
  onAttachmentChange?: (attachments: FileAttachment[]) => void;
}

export function useChatWithAttachments({ chatId, onAttachmentChange }: UseChatWithAttachmentsProps = {}) {
  const router = useRouter();
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState<boolean>(!chatId);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const newChatIdRef = useRef<string | null>(null);

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

  const handleFileUpload = (attachment: FileAttachment) => {
    const updatedAttachments = [...attachments, attachment];
    setAttachments(updatedAttachments);
    onAttachmentChange?.(updatedAttachments);
  };

  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
    onAttachmentChange?.(updatedAttachments);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    onAttachmentChange?.([]);

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

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    attachments,
    handleFileUpload,
    handleRemoveAttachment,
    error,
    setError,
    isNewChat,
    setIsNewChat,
    isTransitioning,
    setIsTransitioning,
  };
}
