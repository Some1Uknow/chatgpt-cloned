import ChatHeader from "@/components/chat-header";
import ChatMessages from "@/components/chat-messages";
import ChatInput from "@/components/chat-input";
import WelcomeMessage from "@/components/welcome-message";
import { UIMessage } from "@/types/chat";

interface ChatLayoutProps {
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showWelcome?: boolean;
  welcomeTitle?: string;
}

export default function ChatLayout({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  showWelcome = false,
  welcomeTitle
}: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-[#212121]">
      <ChatHeader />
      
      <div className="flex-1 flex flex-col px-6 bg-[#212121]">
        {/* Messages or Welcome */}
        {messages.length > 0 ? (
          <ChatMessages messages={messages} isLoading={isLoading} />
        ) : showWelcome ? (
          <WelcomeMessage title={welcomeTitle} />
        ) : null}
        
        {/* Input Area */}
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
