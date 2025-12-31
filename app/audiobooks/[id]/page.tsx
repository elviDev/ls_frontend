"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudiobookPlayer } from "@/components/audiobook/audiobook-player";
import { ChapterList } from "@/components/audiobook/chapter-list";
import { ReviewSection } from "@/components/audiobook/review-section";
import { CommentSection } from "@/components/audiobook/comment-section";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudiobook, useToggleAudiobookFavorite } from "@/hooks/use-audiobooks";
import { useToggleAudiobookBookmark } from "@/hooks/use-audiobook-bookmarks";

export default function AudiobookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [audiobookId, setAudiobookId] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const { toast } = useToast();
  
  const { data: audiobook, isLoading, error } = useAudiobook(audiobookId || '');
  const toggleFavoriteMutation = useToggleAudiobookFavorite();
  const toggleBookmarkMutation = useToggleAudiobookBookmark();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setAudiobookId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const handlePlayChapter = (chapter: any) => {
    if (!audiobook?.chapters) return;
    const chapterIndex = audiobook.chapters.findIndex((c) => c.id === chapter.id);
    if (chapterIndex !== -1) {
      setCurrentChapter(chapterIndex);
    }
  };

  const handleChapterChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
  };

  const handleFavoriteToggle = async () => {
    if (!audiobookId) return;
    
    try {
      await toggleFavoriteMutation.mutateAsync(audiobookId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBookmarkToggle = async () => {
    if (!audiobookId) return;
    
    try {
      await toggleBookmarkMutation.mutateAsync(audiobookId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-8 mb-8">
              <Skeleton className="w-48 h-72" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            <Skeleton className="w-full h-[200px] rounded-xl mb-8" />
            <Skeleton className="w-full h-[300px] rounded-xl" />
          </div>
          <div>
            <Skeleton className="w-full h-[200px] rounded-xl mb-8" />
            <Skeleton className="w-full h-[150px] rounded-xl mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !audiobook) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Error Loading Audiobook</h2>
          <p className="mb-4">The audiobook you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/audiobooks">Back to Audiobooks</Link>
          </Button>
        </div>
      </div>
    );
  }

  const chapters = audiobook.chapters || [];
  const currentAudioUrl = chapters[currentChapter]?.audioFile || '';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="relative w-48 h-72 flex-shrink-0 mx-auto md:mx-0">
              <Image
                src={audiobook.coverImage || "/placeholder.svg?height=600&width=400"}
                alt={audiobook.title}
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {audiobook.genre && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    {audiobook.genre.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{audiobook.title}</h1>
              <p className="text-lg text-muted-foreground mb-2">
                by {audiobook.createdBy.firstName} {audiobook.createdBy.lastName}
              </p>
              <p className="text-md text-muted-foreground mb-4">
                Narrated by {audiobook.narrator}
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Released: {new Date(audiobook.releaseDate).getFullYear()}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{audiobook._count.chapters} chapters</span>
                </div>
                {audiobook.publisher && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Publisher: {audiobook.publisher}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {(() => {
                      const totalMinutes = Math.round(audiobook.duration / 60);
                      const hours = Math.floor(totalMinutes / 60);
                      const mins = totalMinutes % 60;
                      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    })()}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm line-clamp-4">{audiobook.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => chapters[0] && handlePlayChapter(chapters[0])}
                >
                  Start Listening
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleFavoriteToggle}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  {audiobook.isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBookmarkToggle}
                  disabled={toggleBookmarkMutation.isPending}
                >
                  {audiobook.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </Button>
              </div>
            </div>
          </div>

          <div id="audiobook-player" className="mb-8">
            <AudiobookPlayer
              title={audiobook.title}
              author={`${audiobook.createdBy.firstName} ${audiobook.createdBy.lastName}`}
              audioUrl={currentAudioUrl}
              image={audiobook.coverImage}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={audiobook.isFavorited || false}
              chapters={chapters}
              currentChapter={currentChapter}
              onChapterChange={handleChapterChange}
              audiobookId={audiobookId || ''}
              initialPosition={audiobook.playbackProgress?.[0]?.position || 0}
              key={`player-${audiobookId}`}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <Tabs defaultValue="chapters">
              <TabsList className="mb-6">
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="chapters">
                <ChapterList
                  chapters={chapters}
                  onPlay={handlePlayChapter}
                  currentChapter={currentChapter}
                />
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {audiobook.description || "No description available."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Book Information</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      {audiobook.publisher && (
                        <>
                          <dt className="font-medium">Publisher</dt>
                          <dd className="text-muted-foreground">{audiobook.publisher}</dd>
                        </>
                      )}
                      <>
                        <dt className="font-medium">Release Date</dt>
                        <dd className="text-muted-foreground">
                          {new Date(audiobook.releaseDate).toLocaleDateString()}
                        </dd>
                      </>
                      <>
                        <dt className="font-medium">Language</dt>
                        <dd className="text-muted-foreground">
                          {audiobook.language === "en" ? "English" : audiobook.language}
                        </dd>
                      </>
                      <>
                        <dt className="font-medium">Duration</dt>
                        <dd className="text-muted-foreground">
                          {Math.round(audiobook.duration / 60)} minutes
                        </dd>
                      </>
                      {audiobook.genre && (
                        <>
                          <dt className="font-medium">Genre</dt>
                          <dd className="text-muted-foreground">{audiobook.genre.name}</dd>
                        </>
                      )}
                      {audiobook.isbn && (
                        <>
                          <dt className="font-medium">ISBN</dt>
                          <dd className="text-muted-foreground">{audiobook.isbn}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewSection audiobookId={audiobookId || ''} />
              </TabsContent>

              <TabsContent value="comments">
                <CommentSection audiobookId={audiobookId || ''} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About the Author</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  {audiobook.createdBy.profileImage ? (
                    <Image
                      src={audiobook.createdBy.profileImage}
                      alt={`${audiobook.createdBy.firstName} ${audiobook.createdBy.lastName}`}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {audiobook.createdBy.firstName} {audiobook.createdBy.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              {audiobook.createdBy.bio && (
                <p className="text-muted-foreground text-sm mb-4">
                  {audiobook.createdBy.bio}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Engagement</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Favorites:</span>
                  <span>{audiobook._count.favorites}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comments:</span>
                  <span>{audiobook._count.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reviews:</span>
                  <span>{audiobook._count.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bookmarks:</span>
                  <span>{audiobook._count.bookmarks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
