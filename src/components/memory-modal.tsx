"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {  Trash2 } from "lucide-react";
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
  onMemoryDeleted?: (memoryId: string) => void;
}

export default function MemoryModal({
  open,
  onClose,
  memories,
  onRefresh,
  onMemoryDeleted,
}: MemoryModalProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [optimisticMemories, setOptimisticMemories] =
    useState<Memory[]>(memories);

  // Update optimistic memories when props change
  useEffect(() => {
    setOptimisticMemories(memories);
  }, [memories]);

 

  const handleDeleteMemory = async (memoryId: string) => {
    // Optimistic update - remove from UI immediately
    setOptimisticMemories((prev) =>
      prev.filter((memory) => memory.id !== memoryId)
    );

    setDeleting(memoryId);
    try {
      const response = await fetch(`/api/memory?id=${memoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setOptimisticMemories(memories);
        const error = await response.json();
        throw new Error(error.error || "Failed to delete memory");
      }

      toast.success("Memory deleted successfully");
      // Notify parent component of deletion
      if (onMemoryDeleted) {
        onMemoryDeleted(memoryId);
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete memory"
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    // Implementation for delete all functionality
    if (optimisticMemories.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all memories?"
    );
    if (!confirmed) return;

    // Optimistic update - clear all memories
    setOptimisticMemories([]);

    try {
      // Delete all memories
      for (const memory of memories) {
        if (memory.id) {
          await fetch(`/api/memory?id=${memory.id}`, {
            method: "DELETE",
          });
        }
      }

      toast.success("All memories deleted successfully");
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticMemories(memories);
      console.error("Error deleting all memories:", error);
      toast.error("Failed to delete all memories");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#2f2f2f] border-[#4a4a4a] text-white w-[60vw] max-w-[60vw] rounded-lg"
      >
        <DialogTitle className="sr-only">Saved memories</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Saved memories</h2>
        </div>

        {/* Subtitle */}
        <div className="px-6 pb-6">
          <p className="text-gray-300 text-sm">
            ChatGPT tries to remember your recent chats, but it may forget
            things over time. Saved memories are never forgotten.{" "}
            <span className="text-blue-400 underline cursor-pointer">
              Learn more
            </span>
          </p>
        </div>

        {/* Memories List */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          {optimisticMemories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No memories saved yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {optimisticMemories.map((memory, index) => (
                <div
                  key={memory.id || index}
                  className="flex items-start justify-between group"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {memory.memory || memory.text || "No content"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(memory.id!)}
                    disabled={deleting === memory.id}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    {deleting === memory.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-red-400"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete All Button */}
        {optimisticMemories.length > 0 && (
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={handleDeleteAll}
              className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              Delete all
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
