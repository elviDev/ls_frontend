"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AudiobookList } from "@/components/audiobook/audiobook-list";
import { useAudiobooks, useFeaturedAudiobooks } from "@/hooks/use-audiobooks";

export default function AudiobooksPage() {
  const { data: allAudiobooks = [], isLoading } = useAudiobooks();
  const { data: featuredAudiobooks = [] } = useFeaturedAudiobooks();

  // Get popular audiobooks (by favorite count)
  const popularAudiobooks = [...allAudiobooks].sort(
    (a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0)
  );

  // Get recent audiobooks
  const recentAudiobooks = [...allAudiobooks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-lg mx-auto" />
        </div>
        <Skeleton className="h-10 w-96 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (allAudiobooks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Our Audiobooks</h1>
          <p className="text-xl text-muted-foreground">
            Immerse yourself in captivating stories narrated by talented voice
            artists. From bestselling novels to thought-provoking non-fiction,
            our audiobook collection has something for everyone.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-2">No Audiobooks Available</h2>
            <p className="mb-4">No published audiobooks have been created yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Our Audiobooks</h1>
        <p className="text-xl text-muted-foreground">
          Immerse yourself in captivating stories narrated by talented voice
          artists. From bestselling novels to thought-provoking non-fiction,
          our audiobook collection has something for everyone.
        </p>
      </div>

      <Tabs defaultValue="featured" className="mb-12">
        <TabsList className="flex flex-wrap h-auto p-1 mb-8">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New Releases</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-0">
          <AudiobookList
            initialAudiobooks={featuredAudiobooks}
            title="Featured Audiobooks"
          />
        </TabsContent>

        <TabsContent value="popular" className="mt-0">
          <AudiobookList
            initialAudiobooks={popularAudiobooks}
            title="Popular Audiobooks"
          />
        </TabsContent>

        <TabsContent value="new" className="mt-0">
          <AudiobookList
            initialAudiobooks={recentAudiobooks}
            title="New Releases"
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <AudiobookList
            initialAudiobooks={[]}
            title="My Favorites"
            showFavoritesOnly={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
