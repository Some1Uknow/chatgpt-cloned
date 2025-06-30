"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  Settings,
  ChevronDown,
  StarsIcon,
} from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="relative flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" />
        <Button
          variant="ghost"
          className="text-white/90 hover:bg-white/10 h-8 px-3 rounded-lg font-lg text-md"
        >
          ChatGPT
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-medium text-sm flex items-center backdrop-blur-sm border border-white/10">
          <StarsIcon className="w-4 h-4" />
          Get Plus
        </Button>
      </div>

      <div className="flex items-center space-x-2">
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
  );
}
