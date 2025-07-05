"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  CheckCircle,
  Palette,
  MoreHorizontal,
  Edit2,
  Trash2,
  Clock,
} from "lucide-react";
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatList } from "@/hooks/use-chat-list";
import { chatSidebarEvents } from "@/lib/chat-sidebar-events";

interface ChatItem {
  chatId: string;
  title: string;
}

// Navigation menu items - matching the exact order and icons from the image
const navigationItems = [
  { id: 1, icon: BookOpen, label: "Library" },
  { id: 2, icon: Clock, label: "Sora" }, // Using Clock icon as it matches better
  { id: 3, icon: Users, label: "GPTs" },
  { id: 4, icon: CheckCircle, label: "Task Reminder" },
  { id: 5, icon: Palette, label: "Canva" },
];

export function ChatSidebar() {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Get current chat ID from pathname
  const currentChatId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  // Use custom hook for chat list with SWR
  const { chats, isLoading: loading, mutate } = useChatList();

  // Create a stable callback for the mutate function
  const handleSidebarRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Listen for sidebar refresh events
  useEffect(() => {
    const unsubscribe = chatSidebarEvents.subscribe(handleSidebarRefresh);
    return unsubscribe;
  }, [handleSidebarRefresh]);

  // Start new chat: go to /chat for a fresh chat
  const handleNewChat = () => {
    router.push("/chat");
  };

  // Delete chat with optimistic updates
  const handleDeleteChat = async (chatId: string) => {
    // Optimistic update: redirect immediately if we're viewing the deleted chat
    if (pathname === `/chat/${chatId}`) {
      router.push("/chat");
    }

    // Optimistic update: immediately remove the chat from the UI
    mutate(
      (currentChats: ChatItem[] | undefined) => {
        if (!currentChats) return currentChats;
        return currentChats.filter((chat: ChatItem) => chat.chatId !== chatId);
      },
      false // Don't revalidate immediately
    );

    // Perform the actual deletion in the background
    try {
      const res = await fetch("/api/chat/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });

      if (!res.ok) {
        // If the deletion failed, revert the optimistic update
        console.error("Failed to delete chat:", await res.text());
        mutate(); // Revalidate to restore the original state
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      // Revert the optimistic update on error
      mutate(); // Revalidate to restore the original state
    }
  };

  // Start editing chat title
  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  // Save edited title
  const handleSaveEdit = async (chatId: string) => {
    if (!editTitle.trim()) return;

    try {
      const res = await fetch("/api/chat/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, title: editTitle.trim() }),
      });

      if (res.ok) {
        setEditingChatId(null);
        setEditTitle("");
        mutate(); // Invalidate cache to refresh the list
      }
    } catch (error) {
      console.error("Error editing chat:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  return (
    <Sidebar className="w-64 bg-[#0f0f0f] border-r border-gray-800/50">
      <SidebarHeader className="px-3 py-4">
        {/* ChatGPT Branding */}
        <div className="flex items-center mb-4">
          <Image
            src="/chatgpt.svg"
            alt="ChatGPT"
            width={24}
            height={24}
            className="mr-3 brightness-0 invert"
          />
          <span className="text-white font-medium text-lg">ChatGPT</span>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800/50 mb-2 h-9 rounded-lg font-medium text-sm px-3 transition-colors duration-200"
                onClick={handleNewChat}
              >
                <Plus className="w-4 h-4 mr-3 flex-shrink-0" />
                New chat
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800/50 h-9 rounded-lg font-medium text-sm px-3 transition-colors duration-200"
              >
                <Search className="w-4 h-4 mr-3 flex-shrink-0" />
                Search chats
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup className="mb-6">
          <SidebarMenu className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-gray-800/50 h-9 rounded-lg font-medium text-sm px-3 transition-colors duration-200"
                    >
                      <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                      {item.label}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-xs text-gray-400 mb-3 px-0 font-medium tracking-wide">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="h-full overflow-y-auto">
              <SidebarMenu className="space-y-0.5">
                {loading ? (
                  <div className="text-gray-500 text-sm px-3 py-3">
                    Loading...
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-gray-500 text-sm px-3 py-3">
                    No chats yet
                  </div>
                ) : (
                  chats.map((chat: ChatItem) => (
                    <SidebarMenuItem key={chat.chatId}>
                      <div
                        className={`flex items-center group hover:bg-gray-800/50 rounded-lg transition-colors duration-200 ${
                          currentChatId === chat.chatId ? "bg-gray-800/70" : ""
                        }`}
                      >
                        {editingChatId === chat.chatId ? (
                          <div className="flex-1 flex items-center gap-2 p-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 bg-gray-800 border-gray-700 text-white text-sm h-8 rounded-md"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(chat.chatId);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(chat.chatId)}
                              className="text-green-400 hover:text-green-300 p-1 h-8 w-8"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <SidebarMenuButton
                              className={`flex-1 text-sm hover:bg-transparent rounded-lg px-3 py-2 justify-start font-medium min-h-[36px] transition-colors duration-200 ${
                                currentChatId === chat.chatId
                                  ? "text-white"
                                  : "text-gray-300 hover:text-white"
                              }`}
                              onClick={() =>
                                window.location.assign(`/chat/${chat.chatId}`)
                              }
                            >
                              <span className="truncate">
                                {chat.title?.length > 28
                                  ? `${chat.title.substring(0, 28)}...`
                                  : chat.title || "Untitled Chat"}
                              </span>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 h-8 w-8 mr-1 transition-opacity duration-200"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-40 bg-gray-800 border-gray-700"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditChat(chat.chatId, chat.title)
                                  }
                                  className="cursor-pointer text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteChat(chat.chatId)}
                                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
