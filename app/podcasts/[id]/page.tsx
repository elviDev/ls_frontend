"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PodcastPlayer } from "@/components/podcast/podcast-player";
import { EpisodeList } from "@/components/podcast/episode-list";
import { CommentSection } from "@/components/audiobook/comment-section";
import { PodcastTranscript } from "@/components/podcast/podcast-transcript";
import { ReviewSection } from "@/components/audiobook/review-section";
import { Skeleton } from "@/components/ui/skeleton";
import { usePodcast, usePodcastEpisodes, useTogglePodcastFavorite } from "@/hooks/use-podcasts";
import { usePodcastStore } from "@/stores/podcast-store";
import { useToast } from "@/hooks/use-toast";

export default function PodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentPodcast, currentEpisode, setCurrentPodcast, setCurrentEpisode, favorites } = usePodcastStore();
  
  const { data: podcast, isLoading: loadingPodcast, error: podcastError } = usePodcast(podcastId || '');
  const { data: episodes = [], isLoading: loadingEpisodes } = usePodcastEpisodes(podcastId || '');
  const toggleFavoriteMutation = useTogglePodcastFavorite();

  const isFavorite = podcastId ? favorites.includes(podcastId) : false;
  const isLoading = loadingPodcast || loadingEpisodes;

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setPodcastId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (podcast) {
      setCurrentPodcast(podcast);
      if (episodes.length > 0 && !currentEpisode) {
        setCurrentEpisode(episodes[0]);
      }
    }
  }, [podcast, episodes, setCurrentPodcast, setCurrentEpisode, currentEpisode]);

  const handlePlayEpisode = (episode: any) => {
    setCurrentEpisode(episode);
    const playerElement = document.getElementById("podcast-player");
    if (playerElement) {
      playerElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!podcastId) return;
    
    try {
      await toggleFavoriteMutation.mutateAsync(podcastId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full aspect-video rounded-xl mb-6" />
            <Skeleton className="w-full h-[200px] rounded-xl mb-8" />
            <Skeleton className="w-full h-[300px] rounded-xl" />
          </div>
          <div>
            <Skeleton className="w-full h-[200px] rounded-xl mb-8" />
            <Skeleton className="w-full h-[150px] rounded-xl mb-8" />
            <Skeleton className="w-full h-[100px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (podcastError || !podcast) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Error Loading Podcast</h2>
          <p className="mb-4">The podcast you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/podcasts">Back to Podcasts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedPodcasts = [
    {
      id: "1",
      title: "Digital Frontiers",
      host: "Michael Chen",
      image: "/placeholder.svg?height=400&width=400",
      category: "Technology",
    },
    {
      id: "2",
      title: "Innovation Today",
      host: "Priya Sharma",
      image: "/placeholder.svg?height=400&width=400",
      category: "Technology",
    },
    {
      id: "3",
      title: "Tech Insights",
      host: "James Wilson",
      image: "/placeholder.svg?height=400&width=400",
      category: "Technology",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
            <Image
              src={podcast.coverImage || "/placeholder.svg?height=600&width=600"}
              alt={podcast.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
              <div>
                <div className="text-sm font-medium text-brand-300 mb-2">
                  {podcast.genre?.name}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {podcast.title}
                </h1>
                <p className="text-white/80">
                  with {podcast.author.firstName} {podcast.author.lastName}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src="/placeholder.svg?height=100&width=100"
                    alt={`${podcast.author.firstName} ${podcast.author.lastName}`}
                  />
                  <AvatarFallback>
                    {podcast.author.firstName.charAt(0)}{podcast.author.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {podcast.author.firstName} {podcast.author.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Host & Producer
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleFavoriteToggle}
                disabled={toggleFavoriteMutation.isPending}
              >
                {isFavorite ? "Following" : "Follow"}
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-semibold">About This Podcast</h2>
              <p className="text-muted-foreground">
                {podcast.description || "No description available for this podcast."}
              </p>
            </div>
          </div>

          <div id="podcast-player" className="mb-8">
            {currentEpisode && (
              <PodcastPlayer
                title={currentEpisode.title || "Unknown Episode"}
                artist={`${podcast.author.firstName} ${podcast.author.lastName}`}
                audioUrl={currentEpisode.audioUrl || ""}
                image={podcast.coverImage}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={isFavorite}
              />
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <Tabs defaultValue="episodes">
              <TabsList className="mb-6">
                <TabsTrigger value="episodes">Episodes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              <TabsContent value="episodes">
                <EpisodeList
                  episodes={episodes.map(episode => ({
                    trackId: episode.id,
                    trackName: episode.title,
                    description: episode.description || '',
                    releaseDate: episode.publishedAt || episode.createdAt,
                    trackTimeMillis: episode.duration ? episode.duration * 1000 : undefined,
                    previewUrl: episode.audioUrl,
                  }))}
                  onPlay={(episode) => {
                    // Find the original episode by id
                    const originalEpisode = episodes.find(e => e.id === episode.trackId);
                    if (originalEpisode) {
                      handlePlayEpisode(originalEpisode);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewSection podcastId={podcastId || ""} />
              </TabsContent>

              <TabsContent value="comments">
                <CommentSection podcastId={podcastId || ""} />
              </TabsContent>

              <TabsContent value="transcript">
                <PodcastTranscript
                  segments={[]}
                  isLoading={false}
                  onJumpToTimestamp={(timestamp) => {
                    toast({
                      title: "Seeking to timestamp",
                      description: `Seeking to ${timestamp}`,
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Related Podcasts</h2>
              <div className="space-y-4">
                {relatedPodcasts.map((related) => (
                  <Link
                    href={`/podcasts/${related.id}`}
                    key={related.id}
                    className="block"
                  >
                    <div className="flex items-center gap-3 group">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={related.image || "/placeholder.svg"}
                          alt={related.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-brand-600 transition-colors">
                          {related.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          with {related.host}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Subscribe</h2>
              <p className="text-muted-foreground mb-4">
                Never miss an episode. Subscribe to this podcast on your
                favorite platform.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full">
                  Apple Podcasts
                </Button>
                <Button variant="outline" className="w-full">
                  Spotify
                </Button>
                <Button variant="outline" className="w-full">
                  Google Podcasts
                </Button>
                <Button variant="outline" className="w-full">
                  RSS Feed
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Share This Podcast</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const text = `Check out ${podcast.title} by ${podcast.author.firstName} ${podcast.author.lastName}`;
                    const url = window.location.href;

                    if (navigator.share && window.isSecureContext) {
                      navigator
                        .share({
                          title: podcast.title,
                          text: text,
                          url: url,
                        })
                        .catch(() => {
                          navigator.clipboard
                            .writeText(url)
                            .then(() =>
                              toast({
                                title: "Link copied",
                                description: "Podcast link copied to clipboard",
                                duration: 3000,
                              })
                            )
                            .catch(() =>
                              toast({
                                title: "Sharing failed",
                                description: "Please manually copy the URL",
                                variant: "destructive",
                                duration: 3000,
                              })
                            );
                        });
                    } else {
                      navigator.clipboard
                        .writeText(url)
                        .then(() =>
                          toast({
                            title: "Link copied",
                            description: "Podcast link copied to clipboard",
                            duration: 3000,
                          })
                        )
                        .catch(() =>
                          toast({
                            title: "Sharing failed",
                            description: "Please manually copy the URL",
                            variant: "destructive",
                            duration: 3000,
                          })
                        );
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
