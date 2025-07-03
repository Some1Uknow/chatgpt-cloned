export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  fileName?: string;
  fileType?: "image" | "pdf" | "doc" | "txt" | "csv";
  attachments?: Array<{
    url: string;
    name: string;
    type: "image" | "pdf" | "doc" | "txt" | "csv";
  }>;
}

export interface ExperimentalAttachment {
  url: string;
  name?: string; // Made optional to match AI SDK
  contentType?: string;
}

export interface ChatData {
  chatId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  createdAt?: Date;
  imageUrl?: string;
  fileName?: string;
  fileType?: "image" | "pdf" | "doc" | "txt" | "csv";
  experimental_attachments?: ExperimentalAttachment[];
}

export interface ContentItem {
  type: "text" | "image";
  text?: string;
  image?: string;
}

export interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
}
