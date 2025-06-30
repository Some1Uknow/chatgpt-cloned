import ChatHeader from "@/components/chat-header";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col h-full bg-[#212121]">
      <ChatHeader />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/60">
          {message && <p className="text-center mb-4">{message}</p>}
          <div className="flex items-center space-x-2 justify-center">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
