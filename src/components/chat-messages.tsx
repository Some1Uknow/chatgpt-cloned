import { UIMessage, ExperimentalAttachment } from "@/types/chat";
import Image from "next/image";

interface ContentItem {
  type: 'text' | 'image';
  text?: string;
  image?: string;
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  // Filter out system and data messages for display
  const displayMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  
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
      {displayMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-white ${
              message.role === 'user'
                ? 'bg-white/10'
                : ''
            }`}
          >
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
                  .map((attachment: ExperimentalAttachment, index: number) => (
                    <Image
                      key={`${message.id}-${index}`}
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
