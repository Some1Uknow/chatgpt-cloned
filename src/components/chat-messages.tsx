import { UIMessage, ExperimentalAttachment } from "@/types/chat";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

interface ContentItem {
  type: 'text' | 'image';
  text?: string;
  image?: string;
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
}

export default function ChatMessages({ messages, isLoading, onEditMessage }: ChatMessagesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Filter out system and data messages for display
  const displayMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  
  const handleEditStart = (index: number, currentContent: string | ContentItem[]) => {
    setEditingIndex(index);
    // Extract text content from multi-modal content
    if (typeof currentContent === 'string') {
      setEditContent(currentContent);
    } else if (Array.isArray(currentContent)) {
      const textContent = currentContent
        .filter((item: ContentItem) => item.type === 'text')
        .map((item: ContentItem) => item.text)
        .join(' ');
      setEditContent(textContent);
    } else {
      setEditContent(String(currentContent));
    }
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
    if (typeof content === 'string') {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === 'text') {
          return <p key={index} className="whitespace-pre-wrap">{item.text}</p>;
        }
        if (item.type === 'image') {
          return (
            <Image
              key={index}
              src={item.image || ''}
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
    
    return <p className="whitespace-pre-wrap">{String(content)}</p>;
  };
  
  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-4 space-y-4">
      {displayMessages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-white relative group ${
              message.role === 'user'
                ? 'bg-white/10'
                : ''
            }`}
          >
            {/* Edit button for user messages */}
            {message.role === 'user' && onEditMessage && editingIndex !== index && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2f2f2f] hover:bg-[#404040] w-8 h-8 p-0"
                onClick={() => handleEditStart(index, message.content)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}

            {/* Edit mode */}
            {editingIndex === index ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 bg-[#2f2f2f] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Edit your message..."
                />
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Display image if present */}
                {message.imageUrl && (
                  <div className="mb-2">
                    <Image 
                      src={message.imageUrl} 
                      alt={message.fileName || "Uploaded image"} 
                      className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                      fill
                    />
                    {message.fileName && (
                      <p className="text-xs text-white/60 mt-1">{message.fileName}</p>
                    )}
                  </div>
                )}
                
                {/* Display experimental attachments if present */}
                {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                  <div className="mb-2">
                    {message.experimental_attachments
                      .filter((attachment: ExperimentalAttachment) => attachment.contentType?.startsWith('image/'))
                      .map((attachment: ExperimentalAttachment, attachmentIndex: number) => (
                        <Image
                          key={`${message.id}-${attachmentIndex}`}
                          src={attachment.url}
                          alt={attachment.name || 'Attachment'}
                          className="max-w-full h-auto rounded-lg"
                          width={500}
                          height={300}
                        />
                      ))}
                  </div>
                )}
                
                {renderContent(message.content)}
                
                {/* Show loading dots if AI message is empty (still loading) */}
                {message.role === 'assistant' && !message.content && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
                  </div>
                )}
              </>
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
