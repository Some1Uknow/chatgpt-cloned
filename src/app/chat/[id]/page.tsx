import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Settings,
  ChevronDown,
  Crown,
  Mic,
  Plus,
  ArrowUp,
  SlidersHorizontal,
} from "lucide-react";

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser();

  return (
    <div className="flex flex-col h-full bg-[#212121]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" />
          <Button
            variant="ghost"
            className="text-white/90 hover:bg-white/10 h-8 px-3 rounded-lg font-medium text-sm"
          >
            ChatGPT
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="bg-[#6366f1] hover:bg-[#5856eb] text-white h-8 px-3 rounded-lg font-medium text-sm flex items-center">
            <Crown className="w-4 h-4 mr-1.5" />
            Get Plus
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-[#212121]">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-normal text-white/90 mb-8">
              How can I help you today?
            </h1>
          </div>

          {/* Input Area */}
          <div className="relative max-w-3xl mx-auto w-full">
            <div className="bg-[#2f2f2f] rounded-3xl border border-white/10 shadow-lg p-4">
              <input
                placeholder="This is a sample input"
                className="w-full p-1 border-0 bg-transparent text-white placeholder-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none font-normal"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/50 hover:text-white/70 rounded-lg flex-shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white/70 flex items-center flex-shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    Tools
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/50 hover:text-white/70 rounded-lg flex-shrink-0"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-white text-black rounded-full w-8 h-8 ml-2 flex-shrink-0"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
