import { Button } from "@/components/ui/button";
import ChatHeader from "@/components/chat-header";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

export default function ErrorState({ error, onRetry, retryButtonText = "Try Again" }: ErrorStateProps) {
  return (
    <div className="flex flex-col h-full bg-[#212121]">
      <ChatHeader />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              {retryButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
