import ChatHeader from "@/components/chat-header";
import ChatMessages from "@/components/chat-messages";
import ChatInput from "@/components/chat-input";
import WelcomeMessage from "@/components/welcome-message";
import { UIMessage } from "@/types/chat";
import { FileAttachment } from "@/components/file-upload-dropdown";

interface ChatLayoutProps {
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showWelcome?: boolean;
  welcomeTitle?: string;
  inputPosition?: "center" | "bottom";
  attachments?: FileAttachment[];
  onFileUpload?: (attachment: FileAttachment) => void;
  onRemoveAttachment?: (index: number) => void;
  onEditMessage?: (messageIndex: number, newContent: string) => void;
}

export default function ChatLayout({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  showWelcome = false,
  welcomeTitle,
  inputPosition = "bottom",
  attachments = [],
  onFileUpload,
  onRemoveAttachment,
  onEditMessage,
}: ChatLayoutProps) {
  // If inputPosition is center, input is below welcome, else fixed at bottom
  const showWelcomeMessage = messages.length === 0 && showWelcome;
  return (
    <div className="flex flex-col min-h-screen h-screen bg-[#212121] w-full relative">
      <ChatHeader />
      {/* Centered input below welcome message */}
      {inputPosition === "center" ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[#212121]">
          {showWelcomeMessage && (
            <div className="w-full flex flex-col items-center">
              <WelcomeMessage title={welcomeTitle} />
            </div>
          )}
          {/* Input below welcome, centered horizontally */}
          <div className="w-full">
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              attachments={attachments}
              onFileUpload={onFileUpload}
              onRemoveAttachment={onRemoveAttachment}
            />
          </div>
        </div>
      ) : (
        // Messages area scrollable, input fixed at bottom
        <div className="flex-1 flex flex-col px-6 bg-[#212121] relative min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto chat-messages-scroll-area pb-[calc(56px+1rem)]">
            {messages.length > 0 ? (
              <ChatMessages messages={messages} isLoading={isLoading} onEditMessage={onEditMessage} />
            ) : showWelcomeMessage ? (
              <WelcomeMessage title={welcomeTitle} />
            ) : null}
          </div>
          {/* Input fixed at the very bottom using sticky */}
          <div className="sticky bottom-0 left-0 right-0 px-6 pb-4 bg-[#212121] z-10">
            <ChatInput
              input={input}
              isLoading={isLoading}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              attachments={attachments}
              onFileUpload={onFileUpload}
              onRemoveAttachment={onRemoveAttachment}
            />
          </div>
        </div>
      )}
    </div>
  );
}
