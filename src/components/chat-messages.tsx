import { UIMessage, ExperimentalAttachment } from "@/types/chat";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Check,
  X,
  FileText,
  File,
  BarChart3,
  Download,
  Clipboard,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ContentItem {
  type: "text" | "image";
  text?: string;
  image?: string;
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="bg-[#0d1117] rounded-lg my-4 overflow-hidden">
      <div className="flex justify-between items-center bg-[#161b22] px-3 py-1 border-b border-[#30363d]">
        <span className="text-[#8b949e] text-sm">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center text-[#8b949e] hover:text-white text-xs"
        >
          <Clipboard className="w-4 h-4 mr-1" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        customStyle={{ background: "transparent", margin: 0, padding: "1rem" }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

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
      return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
    }

    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === "text") {
          return (
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
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-white relative group ${
              message.role === "user" ? "bg-white/10" : ""
            }`}
          >
            {/* Edit button for user messages */}
            {message.role === "user" &&
              onEditMessage &&
              editingIndex !== index && (
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
              <div className="space-y-2 w-full">
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
                      <p className="text-xs text-white/60 mt-1">
                        {message.fileName}
                      </p>
                    )}
                  </div>
                )}

                {/* Display experimental attachments if present */}
                {message.experimental_attachments &&
                  message.experimental_attachments.length > 0 && (
                    <div className="mb-2">
                      {message.experimental_attachments
                        .filter((attachment: ExperimentalAttachment) =>
                          attachment.contentType?.startsWith("image/")
                        )
                        .map(
                          (
                            attachment: ExperimentalAttachment,
                            attachmentIndex: number
                          ) => (
                            <Image
                              key={`${message.id}-${attachmentIndex}`}
                              src={attachment.url}
                              alt={attachment.name || "Attachment"}
                              className="max-w-full h-auto rounded-lg"
                              width={500}
                              height={300}
                            />
                          )
                        )}
                    </div>
                  )}

                {/* Display non-image experimental attachments */}
                {message.experimental_attachments &&
                  message.experimental_attachments.length > 0 && (
                    <div className="mb-2">
                      {message.experimental_attachments
                        .filter(
                          (attachment: ExperimentalAttachment) =>
                            !attachment.contentType?.startsWith("image/")
                        )
                        .map(
                          (
                            attachment: ExperimentalAttachment,
                            attachmentIndex: number
                          ) => (
                            <div
                              key={`${message.id}-file-${attachmentIndex}`}
                              className="flex items-center bg-white/10 rounded-lg p-3 text-white/80 text-sm max-w-md mb-2"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {attachment.contentType?.includes("pdf") ? (
                                  <FileText className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" />
                                ) : attachment.contentType?.includes("text") ? (
                                  <File className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                                ) : attachment.contentType?.includes("csv") ||
                                  attachment.contentType?.includes("excel") ? (
                                  <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0 text-green-400" />
                                ) : (
                                  <FileText className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">
                                    {attachment.name || "Attachment"}
                                  </div>
                                  <div className="text-xs text-white/60">
                                    {attachment.contentType?.includes("pdf")
                                      ? "PDF Document"
                                      : attachment.contentType?.includes("text")
                                      ? "Text File"
                                      : attachment.contentType?.includes("csv")
                                      ? "CSV File"
                                      : attachment.contentType?.includes("doc")
                                      ? "Document"
                                      : "File"}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(attachment.url, "_blank")
                                }
                                className="ml-2 h-8 w-8 p-0 text-white/60 hover:text-white/80"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        )}
                    </div>
                  )}

                {renderContent(message.content)}
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
