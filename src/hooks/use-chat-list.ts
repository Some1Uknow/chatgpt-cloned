import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useChatList() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/chat-list',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    chats: data?.chats || [],
    isLoading,
    error,
    mutate, // Expose mutate function for cache invalidation
  };
}
