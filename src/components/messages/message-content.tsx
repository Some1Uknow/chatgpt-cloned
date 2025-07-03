import { UIMessage, ExperimentalAttachment } from "@/types/chat";
import Image from "next/image";
import { FileAttachment } from "./file-attachment";
import { ContentItem } from "@/types/chat";

export const MessageContent = ({
  message,
  renderContent,
}: {
  message: UIMessage;
  renderContent: (content: string | ContentItem[]) => React.ReactNode;
}) => (
  <>
    {/* Display image if present (legacy) */}
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
    {message.experimental_attachments &&
      message.experimental_attachments.length > 0 && (
        <div className="mb-2 space-y-2">
          {message.experimental_attachments.map(
            (attachment: ExperimentalAttachment, attachmentIndex: number) => {
              if (attachment.contentType?.startsWith("image/")) {
                return (
                  <Image
                    key={`${message.id}-img-${attachmentIndex}`}
                    src={attachment.url}
                    alt={attachment.name || "Attachment"}
                    className="max-w-full h-auto rounded-lg"
                    width={500}
                    height={300}
                  />
                );
              }
              return (
                <FileAttachment
                  key={`${message.id}-file-${attachmentIndex}`}
                  attachment={attachment}
                  messageId={message.id}
                  attachmentIndex={attachmentIndex}
                />
              );
            }
          )}
        </div>
      )}

    {renderContent(message.content)}
  </>
);
