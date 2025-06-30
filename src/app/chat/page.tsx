"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import ChatLayout from "@/components/chat-layout";

export default function ChatPage() {
  const { isSignedIn } = useAuthRedirect();
  const router = useRouter();
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      onResponse(response) {
        // Extract chatId from response headers
        const chatId = response.headers.get("X-Chat-Id");
        if (chatId && !hasStartedChat) {
          setHasStartedChat(true);
          // Use Next.js router.replace to trigger proper navigation
          router.replace(`/chat/${chatId}`);
        }
      },
      onError(error) {
        console.error("Chat error: main page", error);
        setHasStartedChat(false);
      },
    });

  if (!isSignedIn) {
    return null;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <ChatLayout
      messages={messages}
      input={input}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onSubmit={onSubmit}
      showWelcome={messages.length === 0}
      inputPosition="center"
      welcomeTitle="How can I help you?"
    />
  );
}
