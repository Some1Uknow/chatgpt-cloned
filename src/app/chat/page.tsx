import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  PanelLeft,
  ChevronDown,
  Plus,
  Crown,
  Search,
  BookOpen,
  Zap,
  Users,
  CheckCircle,
  Palette,
  Download,
  Mic,
  BarChart3,
  Wrench,
  PlusCircle,
} from "lucide-react";

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser();

  return (
    <div className="flex h-screen bg-[#212121] text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#171717] flex flex-col h-full">
        {/* Top Section */}
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] mb-3 h-11"
          >
            <Plus className="w-4 h-4 mr-3" />
            New chat
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] mb-4 h-11"
          >
            <Search className="w-4 h-4 mr-3" />
            Search chats
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] h-11"
          >
            <BookOpen className="w-4 h-4 mr-3" />
            Library
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] h-11"
          >
            <Zap className="w-4 h-4 mr-3" />
            Sora
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] h-11"
          >
            <Users className="w-4 h-4 mr-3" />
            GPTs
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] h-11"
          >
            <CheckCircle className="w-4 h-4 mr-3" />
            Task Reminder
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-[#2a2a2a] h-11"
          >
            <Palette className="w-4 h-4 mr-3" />
            Canva
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 px-3 mt-6">
          <div className="text-xs text-gray-400 mb-3 px-3">Chats</div>
          <ScrollArea className="h-full">
            <div className="space-y-1">
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Hey there conversation
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Cloudinary vs Uploadcare Ease
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                GitHub Search Query Fix
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Sunk Cost Fallacy Explained
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                TURBIN3 Orientation Registration
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                ResumeMax Project Overview
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Knowledge Test Challenge
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Solana Engineering Curriculum...
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                Solana Learning Platforms
              </div>
              <div className="text-sm text-gray-300 hover:bg-[#2a2a2a] rounded p-2 cursor-pointer">
                LaTeX Debugging Fix
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#2a2a2a]"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-[#2a2a2a] h-9"
            >
              ChatGPT
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button className="bg-[#6366f1] hover:bg-[#5856eb] text-white h-9 px-4">
              <Crown className="w-4 h-4 mr-2" />
              Get Plus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#2a2a2a]"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#2a2a2a]"
            >
              <Download className="w-4 h-4" />
              Save as PDF
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-gray-200 mb-8">
                What's on the agenda today?
              </h1>
            </div>

            {/* Input Area */}
            <div className="relative">
              <div className="bg-[#2f2f2f] rounded-3xl border border-gray-600 p-4">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-[#404040] rounded-full p-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Ask anything"
                    className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-[#404040] rounded-full p-2"
                  >
                    <Wrench className="w-5 h-5" />
                    <span className="ml-1 text-sm">Tools</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-[#404040] rounded-full p-2"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-[#404040] rounded-full p-2"
                  >
                    <BarChart3 className="w-5 h-5" />
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
