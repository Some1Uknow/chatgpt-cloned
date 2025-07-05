import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { FileAttachment } from "@/components/file-upload-dropdown";
import { refreshChatSidebar } from "@/lib/chat-sidebar-events";

const getContentTypeForAttachment = (type: string): string => {
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

interface UseChatWithAttachmentsProps {
  chatId?: string;
  onAttachmentChange?: (attachments: FileAttachment[]) => void;
}

export function useChatWithAttachments({ chatId, onAttachmentChange }: UseChatWithAttachmentsProps = {}) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState<boolean>(!chatId);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const newChatIdRef = useRef<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);

  // Update currentChatId when chatId prop changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
      setIsNewChat(false);
    }
  }, [chatId]); // Remove currentChatId from dependency array to prevent infinite loop

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat", // Always use the same endpoint
    onResponse(response) {
      if (!currentChatId) {
        const newChatId = response.headers.get("X-Chat-Id");
        if (newChatId) {
          newChatIdRef.current = newChatId;
          setCurrentChatId(newChatId);
        }
      }
    },
    onFinish(message) {
      console.log("Message finished:", message);
      
      // Only refresh sidebar when AI finishes responding for new chats
      // Use setTimeout to avoid triggering during the render cycle
      if (isNewChat || !chatId) {
        setTimeout(() => {
          refreshChatSidebar();
        }, 0);
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

  const handleEditMessage = async (messageIndex: number, newContent: string) => {
    if (!currentChatId) return;

    try {
      setError(null);
      setIsEditingMessage(true);
      
      // Find the actual message index in the full messages array (including system messages)
      const displayMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
      const messageToEdit = displayMessages[messageIndex];
      
      if (!messageToEdit) {
        setError("Message not found");
        setIsEditingMessage(false);
        return;
      }

      // Find the actual index in the full messages array
      const actualMessageIndex = messages.findIndex(msg => msg.id === messageToEdit.id);
      
      if (actualMessageIndex === -1) {
        setError("Message not found");
        setIsEditingMessage(false);
        return;
      }

      // Update the message locally first
      const updatedMessages = [...messages];
      updatedMessages[actualMessageIndex] = {
        ...updatedMessages[actualMessageIndex],
        content: newContent,
      };
      
      // Remove messages after the edited one
      const messagesToKeep = updatedMessages.slice(0, actualMessageIndex + 1);
      setMessages(messagesToKeep);

      // Create a temporary message for the AI response with loading state
      const tempAiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as const,
        content: '',
        createdAt: new Date(),
      };
      
      // Add the empty AI message to show it's responding
      setMessages([...messagesToKeep, tempAiMessage]);

      // Make the API call to edit the message and get new AI response
      const response = await fetch(`/api/chat/edit-message`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          messageIndex: actualMessageIndex,
          newContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      // Parse the streaming response using the AI SDK data stream format
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse the data stream format from AI SDK
          const lines = chunk.split('\n').filter(line => line.trim());
          for (const line of lines) {
            // Look for text content in the stream format
            if (line.startsWith('0:')) {
              try {
                // Extract the JSON content after the colon
                const jsonStr = line.substring(2);
                const parsed = JSON.parse(jsonStr);
                if (typeof parsed === 'string') {
                  aiResponse += parsed;
                }
              } catch (e) {
                // If JSON parsing fails, try to extract quoted text
                console.log('Failed to parse JSON from AI response:', e);
                const textMatch = line.match(/^0:"(.*)"/);
                if (textMatch) {
                  aiResponse += textMatch[1];
                }
              }
            }
            
            // Update the AI message with the accumulated response
            if (aiResponse) {
              const updatedAiMessage = {
                ...tempAiMessage,
                content: aiResponse,
              };
              
              setMessages([...messagesToKeep, updatedAiMessage]);
            }
          }
        }
      }
      
      setIsEditingMessage(false);
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message. Please try again.');
      setIsEditingMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // Generate new chat ID if this is a new chat (no current chat ID)
    if (!currentChatId) {
      const generatedChatId = crypto.randomUUID();
      newChatIdRef.current = generatedChatId;
      setCurrentChatId(generatedChatId);
      
      // Update URL immediately BEFORE API call to prevent page reload
      window.history.replaceState({}, '', `/chat/${generatedChatId}`);
      setIsNewChat(false);
      
      // Trigger sidebar refresh after state updates settle
      // Use setTimeout to avoid triggering during render cycle
      setTimeout(() => {
        refreshChatSidebar();
      }, 0);
    }

    // Convert attachments to AI SDK format
    const experimental_attachments = attachments.map((attachment) => ({
      name: attachment.name,
      contentType: getContentTypeForAttachment(attachment.type),
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
        chatId: newChatIdRef.current || currentChatId, // Send the chat ID
      },
    });
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || isEditingMessage,
    setMessages,
    attachments,
    handleFileUpload,
    handleRemoveAttachment,
    handleEditMessage,
    error,
    setError,
    isNewChat,
    setIsNewChat,
    isTransitioning,
    setIsTransitioning,
    currentChatId, // Return the current chat ID
  };
}
