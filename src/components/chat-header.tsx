// chat-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  Settings,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const MemoryModal = dynamic(() => import("@/components/memory-modal"), { ssr: false });

interface Memory {
  id: string;
  text: string;
  [key: string]: unknown;
}

export default function ChatHeader() {
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/memory");
      if (!res.ok) throw new Error("Failed to fetch memory");
      const data = await res.json();
      setMemories(data.memories?.results || data.memories || []);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message || "Unknown error");
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMemory = async () => {
    setMemoryOpen(true);
    await fetchMemories();
  };

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
          onClick={handleOpenMemory}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
      <MemoryModal
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        memories={loading ? [{ loading: true }] : error ? [{ error }] : memories}
        onRefresh={fetchMemories}
      />
    </header>
  );
}
