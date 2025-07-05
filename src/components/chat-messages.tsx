import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessagesProps, ContentItem } from "@/types/chat";
import { CodeBlock } from "./messages/code-block";
import { MessageContent } from "./messages/message-content";

export default function ChatMessages({
  messages,
  isLoading,
  onEditMessage,
}: ChatMessagesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Filter out system and data messages for display
  const displayMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );

  const handleEditStart = (
    index: number,
    currentContent: string | ContentItem[]
  ) => {
    setEditingIndex(index);
    // Extract text content from multi-modal content
    if (typeof currentContent === "string") {
      setEditContent(currentContent);
    } else if (Array.isArray(currentContent)) {
      const textContent = currentContent
        .filter((item: ContentItem) => item.type === "text")
        .map((item: ContentItem) => item.text)
        .join(" ");
      setEditContent(textContent);
    } else {
      setEditContent(String(currentContent));
    }
  };

  const hasAttachments = (message: {
    imageUrl?: string;
    fileName?: string;
    experimental_attachments?: unknown[];
    content: string | ContentItem[];
  }) => {
    // Check for various attachment types
    return (
      message.imageUrl ||
      message.fileName ||
      (message.experimental_attachments &&
        message.experimental_attachments.length > 0) ||
      (Array.isArray(message.content) &&
        message.content.some((item: ContentItem) => item.type === "image"))
    );
  };

  const handleEditSave = () => {
    if (editingIndex !== null && onEditMessage && editContent.trim()) {
      onEditMessage(editingIndex, editContent.trim());
      setEditingIndex(null);
      setEditContent("");
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditContent("");
  };

  const renderContent = (content: string | ContentItem[]) => {
    const components = {
      code: CodeBlock,
    };

    if (typeof content === "string") {
      // @ts-expect-error ignore
      return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
    }

    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === "text") {
          return (
            // @ts-expect-error ignore
            <ReactMarkdown key={index} components={components}>
              {item.text}
            </ReactMarkdown>
          );
        }
        if (item.type === "image") {
          return (
            <Image
              key={index}
              src={item.image || ""}
              alt="Uploaded image"
              width={500}
              height={300}
              className="max-w-full h-auto rounded-lg mt-2"
            />
          );
        }
        return null;
      });
    }

    return (
      // @ts-expect-error ignore
      <ReactMarkdown components={components}>{String(content)}</ReactMarkdown>
    );
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-4 space-y-4">
      {displayMessages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          } ${editingIndex === index ? "w-full" : ""}`}
        >
          <div
            className={`flex flex-col ${
              message.role === "user" ? "items-end" : "items-start"
            } group ${editingIndex === index ? "w-full" : "max-w-[80%]"}`}
          >
            <div
              className={`rounded-lg text-white relative ${
                editingIndex === index
                  ? "w-full"
                  : `w-full px-4 py-2 ${
                      message.role === "user" ? "bg-white/10" : ""
                    }`
              }`}
            >
              {/* Edit mode */}
              {editingIndex === index ? (
                <div className="space-y-2 w-full max-w-none">
                  <div className="bg-white/10 rounded-lg">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-4 bg-transparent text-white placeholder-white/50 focus:outline-none resize-none"
                      rows={3}
                      placeholder="Edit your message..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCancel}
                      className="text-white/70 hover:text-white/90"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleEditSave}
                      className="bg-white text-black hover:bg-gray-100 rounded-full"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              ) : (
                <MessageContent
                  message={message}
                  renderContent={renderContent}
                />
              )}
            </div>

            {/* Edit button for user messages without attachments */}
            {message.role === "user" &&
              onEditMessage &&
              editingIndex !== index &&
              !hasAttachments(message) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-white/10 w-8 h-8 p-0 mt-1"
                  onClick={() => handleEditStart(index, message.content)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white/10 text-white rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
