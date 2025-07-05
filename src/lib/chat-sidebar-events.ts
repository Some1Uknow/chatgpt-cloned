// Simple event emitter for sidebar updates
class ChatSidebarEvents {
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const chatSidebarEvents = new ChatSidebarEvents();

// Helper function to trigger sidebar refresh
export function refreshChatSidebar() {
  chatSidebarEvents.emit();
}
