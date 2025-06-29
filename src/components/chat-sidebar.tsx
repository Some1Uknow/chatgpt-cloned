"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Plus,
  Search,
  BookOpen,
  Zap,
  Users,
  CheckCircle,
  Palette,
} from "lucide-react";

// Chat data structure
const chatItems = [
  { id: 1, title: "Hey there conversation" },
  { id: 2, title: "Cloudinary vs Uploadcare Ease" },
  { id: 3, title: "GitHub Search Query Fix" },
  { id: 4, title: "Sunk Cost Fallacy Explained" },
  { id: 5, title: "TURBIN3 Orientation Registration" },
  { id: 6, title: "ResumeMax Project Overview" },
  { id: 7, title: "Knowledge Test Challenge" },
  { id: 8, title: "Solana Engineering Curriculum..." },
  { id: 9, title: "Solana Learning Platforms" },
  { id: 10, title: "LaTeX Debugging Fix" },
];

// Navigation menu items
const navigationItems = [
  { id: 1, icon: BookOpen, label: "Library" },
  { id: 2, icon: Zap, label: "Sora" },
  { id: 3, icon: Users, label: "GPTs" },
  { id: 4, icon: CheckCircle, label: "Task Reminder" },
  { id: 5, icon: Palette, label: "Canva" },
];

export function ChatSidebar() {
  return (
    <Sidebar className="w-64 bg-[#171717] border-r border-white/10">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-[#2f2f2f] mb-3 h-10 rounded-lg font-normal"
              >
                <Plus className="w-4 h-4 mr-3" />
                New chat
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-[#2f2f2f] h-10 rounded-lg font-normal"
              >
                <Search className="w-4 h-4 mr-3" />
                Search chats
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-[#2f2f2f] h-10 rounded-lg font-normal"
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-xs text-gray-400 mb-3 px-4 font-normal">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="h-full overflow-y-auto">
              <SidebarMenu className="space-y-1 px-2">
                {chatItems.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton className="text-sm text-gray-300 hover:bg-[#2f2f2f] rounded-lg p-3 w-full justify-start font-normal">
                      {chat.title.length > 25
                        ? `${chat.title.substring(0, 25)}...`
                        : chat.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
