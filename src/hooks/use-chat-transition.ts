import { useEffect } from 'react';

interface UseChatTransitionProps {
  chatId?: string;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  setIsNewChat: (value: boolean) => void;
}

export function useChatTransition({
  chatId,
  isTransitioning,
  setIsTransitioning,
  setIsNewChat,
}: UseChatTransitionProps) {
  // Handle chatId changes to update isNewChat state
  useEffect(() => {
    const wasNewChat = !chatId;
    setIsNewChat(wasNewChat);

    // If we have a chatId and we were transitioning, end the transition after a delay
    if (chatId && isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Allow 1 second for the transition to complete
      return () => clearTimeout(timer);
    }
  }, [chatId, isTransitioning, setIsTransitioning, setIsNewChat]);
}
