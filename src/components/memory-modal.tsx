"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Brain, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Memory {
  id?: string;
  memory?: string;
  text?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  loading?: boolean;
  error?: string;
}

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  memories: Memory[];
  onRefresh?: () => void;
}

export default function MemoryModal({ open, onClose, memories, onRefresh }: MemoryModalProps) {
  const [newMemory, setNewMemory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAddMemory = async () => {
    if (!newMemory.trim()) {
      toast.error("Please enter a memory");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memories: newMemory.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add memory");
      }

      setNewMemory("");
      toast.success("Memory added successfully");
      
      // Refresh memories after adding
      handleRefreshMemories();
    } catch (error) {
      console.error("Error adding memory:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add memory");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    setDeleting(memoryId);
    try {
      const response = await fetch(`/api/memory?id=${memoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete memory");
      }

      toast.success("Memory deleted successfully");
      // Refresh memories after deleting
      handleRefreshMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete memory");
    } finally {
      setDeleting(null);
    }
  };

  const handleRefreshMemories = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing memories:", error);
        toast.error("Failed to refresh memories");
      } finally {
        setRefreshing(false);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const renderMemoryContent = () => {
    if (memories.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p className="text-sm">No memories found</p>
          <p className="text-xs mt-1">Start chatting to build your AI memory!</p>
        </div>
      );
    }

    if (memories[0]?.loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading memories...</p>
        </div>
      );
    }

    if (memories[0]?.error) {
      return (
        <div className="text-center py-12">
          <p className="text-sm text-destructive mb-3">Error loading memories</p>
          <Button variant="outline" size="sm" onClick={handleRefreshMemories}>
            Try Again
          </Button>
        </div>
      );
    }

    const memoryList = (
      <div className="p-4 space-y-4">
        {memories.map((memory, index) => (
          <div key={memory.id || index} className="flex justify-between items-start gap-4">
            <p className="text-sm pr-4 flex-1">{memory.memory || memory.text || "No content"}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(memory.created_at)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDeleteMemory(memory.id!)}
                disabled={deleting === memory.id}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );

    // Always use ScrollArea for consistent behavior and proper scrolling
    return (
      <ScrollArea className="border rounded-md w-full" style={{ height: '200px', maxHeight: '400px' }}>
        {memoryList}
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            AI Memory
          </DialogTitle>
          <DialogDescription className="text-sm">
            View and manage your AI assistant's memory for more personalized responses.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Add Memory Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add Memory
            </div>
            <div className="flex gap-3">
              <Textarea
                placeholder="Enter something you want the AI to remember..."
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                className="min-h-[80px] resize-none flex-1"
              />
              <Button
                onClick={handleAddMemory}
                disabled={isAdding || !newMemory.trim()}
                className="shrink-0 self-end"
              >
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Memories List */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Your Memories ({memories.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshMemories}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              {renderMemoryContent()}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}