"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PodcastList } from "@/components/podcast/podcast-list";
import { usePodcasts, useGenres } from "@/hooks/use-podcasts";

function PodcastsContent() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: allPodcasts = [], isLoading } = usePodcasts();
  const { data: genres = [] } = useGenres();

  // Filter podcasts based on active tab
  const getFilteredPodcasts = () => {
    switch (activeTab) {
      case "featured":
        return allPodcasts.filter(p => p.status === 'PUBLISHED').slice(0, 8);
      case "popular":
        return allPodcasts.sort((a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0)).slice(0, 8);
      case "recent":
        return allPodcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
      default:
        return allPodcasts;
    }
  };

  if (isLoading) {
    return <PodcastsLoading />;
  }

  if (allPodcasts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Our Podcasts</h1>
          <p className="text-xl text-muted-foreground">
            Discover thought-provoking conversations, inspiring stories, and
            expert insights across a variety of topics.
          </p>
        </div>
        <div className="text-center py-12">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-2">No Podcasts Available</h2>
            <p>No podcasts have been published yet. Check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredPodcasts = getFilteredPodcasts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Our Podcasts</h1>
        <p className="text-xl text-muted-foreground">
          Discover thought-provoking conversations, inspiring stories, and
          expert insights across a variety of topics.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="flex flex-wrap h-auto p-1 mb-8">
          <TabsTrigger value="all">All Podcasts</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <PodcastList
            initialPodcasts={filteredPodcasts.map(transformPodcast)}
            title={activeTab === "all" ? "All Podcasts" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Podcasts`}
            availableGenres={genres}
          />
        </TabsContent>
      </Tabs>

      <div className="space-y-12">
        {genres.slice(0, 3).map((genre) => {
          const genrePodcasts = allPodcasts
            .filter((podcast) => podcast.genre?.name === genre.name)
            .slice(0, 4);

          if (genrePodcasts.length === 0) return null;

          return (
            <section key={genre.id} className="space-y-6">
              <h2 className="text-2xl font-bold">{genre.name} Podcasts</h2>
              <PodcastList
                initialPodcasts={genrePodcasts.map(transformPodcast)}
                showSearch={false}
                showFilters={false}
                title=""
                availableGenres={genres}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}

// Transform podcast data to match component's expected format
function transformPodcast(podcast: any) {
  return {
    collectionId: podcast.id,
    collectionName: podcast.title,
    artistName: `${podcast.author.firstName} ${podcast.author.lastName}`,
    artworkUrl100: podcast.coverImage || "/placeholder.svg?height=400&width=400",
    primaryGenreName: podcast.genre?.name,
    episodeCount: podcast._count?.episodes || 0,
    favoriteCount: podcast._count?.favorites || 0,
    releaseDate: podcast.releaseDate,
    description: podcast.description,
    isFavorite: false, // This will be updated by the component
  };
}

function PodcastsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-full max-w-lg mx-auto" />
      </div>
      <Skeleton className="h-10 w-96 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PodcastsPage() {
  return <PodcastsContent />;
}
