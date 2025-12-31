import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export function useToggleAudiobookBookmark() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; bookmarked: boolean }, Error, string>({
    mutationFn: async (audiobookId: string) => {
      const response = await apiClient.request(`/audiobooks/${audiobookId}/bookmark`, {
        method: 'POST',
      });
      return response as { message: string; bookmarked: boolean };
    },
    onMutate: async (audiobookId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['audiobook', audiobookId] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['audiobook', audiobookId]);
      
      // Optimistically update
      queryClient.setQueryData(['audiobook', audiobookId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isBookmarked: !old.isBookmarked,
          _count: {
            ...old._count,
            bookmarks: old.isBookmarked 
              ? Math.max(0, old._count.bookmarks - 1)
              : old._count.bookmarks + 1
          }
        };
      });
      
      return { previousData };
    },
    onSuccess: (data) => {
      // Success handled by optimistic update
    },
    onError: (error: any, audiobookId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['audiobook', audiobookId], context.previousData);
      }
    },
  });
}