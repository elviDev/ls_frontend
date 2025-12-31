"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Play,
  Edit,
  BookOpen,
  Clock,
  Star,
  Users,
  TrendingUp,
  FileText,
  BarChart3,
  Calendar,
  Globe,
  DollarSign,
  Archive,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReviewSection } from "@/components/audiobook/review-section";
import { 
  useAudiobook, 
  useUpdateAudiobook,
  useAudiobookComments,
  useAudiobookReviews 
} from "@/hooks/use-audiobooks";
import { useAudiobookStore, type Audiobook } from "@/stores/audiobook-store";

export default function AudiobookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const audiobookId = params.id as string;
  const updateAudiobook = useUpdateAudiobook();
  const { data: comments } = useAudiobookComments(audiobookId);
  const { data: reviews } = useAudiobookReviews(audiobookId);
  
  const { 
    setCurrentAudiobook, 
    updateAudiobook: updateStoreAudiobook,
    setComments,
    setReviews,
    setLoading,
    setError,
    clearError,
    audiobooks
  } = useAudiobookStore();

  const { data: audiobook, isLoading: loading } = useAudiobook(audiobookId);
  const [activeTab, setActiveTab] = useState("overview");

  // Get audiobook from store if available
  const storeAudiobook = audiobooks.find(book => book.id === audiobookId);
  const displayAudiobook: Audiobook | undefined = (audiobook && Object.keys(audiobook).length > 0) ? audiobook as Audiobook : storeAudiobook;

  // Sync data with store
  useEffect(() => {
    if (audiobook && Object.keys(audiobook).length > 0) {
      updateStoreAudiobook(audiobookId, audiobook as Audiobook);
    }
  }, [audiobook, audiobookId, updateStoreAudiobook]);

  useEffect(() => {
    if (comments) {
      setComments(comments);
    }
  }, [comments, setComments]);

  useEffect(() => {
    if (reviews) {
      setReviews(reviews);
    }
  }, [reviews, setReviews]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleStatusChange = async (status: string) => {
    try {
      await updateAudiobook.mutateAsync({ id: audiobookId, data: { status } });
      // Optimistically update store
      updateStoreAudiobook(audiobookId, { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" });
    } catch (error) {
      setError('Failed to update audiobook status');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTags = () => {
    if (!displayAudiobook?.tags) return [];
    try {
      return Array.isArray(displayAudiobook.tags) 
        ? displayAudiobook.tags 
        : JSON.parse(displayAudiobook.tags);
    } catch {
      return displayAudiobook.tags?.split(',') || [];
    }
  };

  if (loading && !storeAudiobook) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading audiobook...</p>
        </div>
      </div>
    );
  }

  if (!displayAudiobook) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Audiobook not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard/audiobooks")}
          >
            Back to Audiobooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/audiobooks")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {displayAudiobook?.title}
          </h1>
          <p className="text-muted-foreground">
            {displayAudiobook?.author ? `By ${displayAudiobook.author} • ` : ""}Narrated by{" "}
            {displayAudiobook?.narrator} • Created by {displayAudiobook?.createdBy?.firstName}{" "}
            {displayAudiobook?.createdBy?.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentAudiobook(displayAudiobook);
              router.push(`/dashboard/audiobooks/${audiobookId}/edit`);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={() => {
              setCurrentAudiobook(displayAudiobook);
              router.push(`/dashboard/audiobooks/${audiobookId}/chapters`);
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Chapters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cover and Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={displayAudiobook.coverImage || "/placeholder.svg"}
                  alt={displayAudiobook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(displayAudiobook.status)}>
                    {displayAudiobook.status === "PUBLISHED"
                      ? "Published"
                      : displayAudiobook.status === "DRAFT"
                        ? "Draft"
                        : "Archived"}
                  </Badge>
                  {displayAudiobook.isExclusive && (
                    <Badge variant="secondary">Exclusive</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(displayAudiobook.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{displayAudiobook._count.chapters} chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(displayAudiobook.playCount)} plays</span>
                  </div>
                  {displayAudiobook.averageRating && displayAudiobook.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {displayAudiobook.averageRating.toFixed(1)} (
                          {displayAudiobook._count.reviews} reviews)
                        </span>
                      </div>
                    )}
                </div>

                <Separator />

                {/* Status Actions */}
                <div className="space-y-2">
                  {displayAudiobook.status === "DRAFT" && (
                    <Button
                      className="w-full"
                      onClick={() => handleStatusChange("PUBLISHED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish Audiobook
                    </Button>
                  )}
                  {displayAudiobook.status === "PUBLISHED" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStatusChange("ARCHIVED")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Audiobook
                    </Button>
                  )}
                  {displayAudiobook.status === "ARCHIVED" && (
                    <Button
                      className="w-full"
                      onClick={() => handleStatusChange("PUBLISHED")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Restore Audiobook
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Favorites</p>
                  <p className="font-semibold">
                    {displayAudiobook._count.favorites}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Comments</p>
                  <p className="font-semibold">
                    {displayAudiobook._count.comments}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Progress</p>
                  <p className="font-semibold">
                    {displayAudiobook._count.playbackProgress || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Genre</p>
                  <p className="font-semibold">
                    {displayAudiobook.genre.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {displayAudiobook.description}
                  </p>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Release Date
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(displayAudiobook.releaseDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Language</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {displayAudiobook.language.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {displayAudiobook.isbn && (
                        <div>
                          <Label className="text-sm font-medium">ISBN</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {displayAudiobook.isbn}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {displayAudiobook.publisher && (
                        <div>
                          <Label className="text-sm font-medium">
                            Publisher
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {displayAudiobook.publisher}
                          </p>
                        </div>
                      )}

                      {displayAudiobook.price && (
                        <div>
                          <Label className="text-sm font-medium">Price</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {displayAudiobook.price}{" "}
                              {displayAudiobook.currency}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(displayAudiobook.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {getTags().length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getTags().map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chapters" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Chapters ({displayAudiobook.chapters?.length ?? 0})
                    </CardTitle>
                    <Button
                      onClick={() => {
                        setCurrentAudiobook(displayAudiobook);
                        router.push(
                          `/dashboard/audiobooks/${audiobookId}/chapters`
                        );
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(displayAudiobook.chapters ?? []).length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No chapters added yet
                      </p>
                      <Button
                        onClick={() => {
                          setCurrentAudiobook(displayAudiobook);
                          router.push(
                            `/dashboard/audiobooks/${audiobookId}/chapters`
                          );
                        }}
                      >
                        Add First Chapter
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayAudiobook.chapters!.slice(0, 5).map((chapter) => (
                          <div
                            key={chapter.id}
                            className="flex items-center gap-4 p-3 border rounded-lg"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {chapter.trackNumber}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {chapter.title}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDuration(chapter.duration)}</span>
                                <span>
                                  {formatNumber(chapter.playCount)} plays
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {chapter.status}
                            </Badge>
                          </div>
                        ))}
                      {(displayAudiobook.chapters ?? []).length > 5 && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentAudiobook(displayAudiobook);
                              router.push(
                                `/dashboard/audiobooks/${audiobookId}/chapters`
                              );
                            }}
                          >
                            View All {(displayAudiobook.chapters ?? []).length} Chapters
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transcript</CardTitle>
                      <CardDescription>
                        {(audiobook as any).transcription
                          ? "Transcript available"
                          : "No transcript available"}
                      </CardDescription>
                    </div>
                    {(audiobook as any).transcription && (
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/audiobooks/${audiobookId}/transcription/edit`
                          )
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Transcript
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {(audiobook as any).transcription ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label>Language</Label>
                          <p className="text-muted-foreground">
                            {(
                              audiobook as any
                            ).transcription?.language?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label>Format</Label>
                          <p className="text-muted-foreground">
                            {(audiobook as any).transcription!.format}
                          </p>
                        </div>
                        <div>
                          <Label>Editable</Label>
                          <p className="text-muted-foreground">
                            {(audiobook as any).transcription!.isEditable
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-sm font-mono whitespace-pre-wrap">
                          {(audiobook as any).transcription!.content.substring(
                            0,
                            500
                          )}
                          {(audiobook as any).transcription!.content.length >
                            500 && "..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No transcript available
                      </p>
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/audiobooks/${audiobookId}/transcription/edit`
                          )
                        }
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Transcript
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Reviews</CardTitle>
                  <CardDescription>
                    Reviews and ratings from users who have listened to this
                    audiobook
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewSection audiobookId={audiobookId} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Plays
                    </CardTitle>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(displayAudiobook.playCount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all chapters
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Engagement
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {displayAudiobook._count.favorites + displayAudiobook._count.comments}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Favorites + Comments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {displayAudiobook._count.playbackProgress && displayAudiobook._count.playbackProgress > 0
                        ? Math.round(
                            (displayAudiobook._count.playbackProgress / displayAudiobook.playCount) * 100
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Users who started listening
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Chapter Performance</CardTitle>
                  <CardDescription>Play count by chapter</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const chapters = displayAudiobook.chapters ?? [];
                    if (chapters.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No chapter data available
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {chapters.map((chapter) => {
                          const maxPlays = Math.max(
                            ...chapters.map((c) => c.playCount)
                          );
                          const percentage =
                            maxPlays > 0
                              ? (chapter.playCount / maxPlays) * 100
                              : 0;

                          return (
                            <div key={chapter.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="truncate">
                                  Chapter {chapter.trackNumber}: {chapter.title}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatNumber(chapter.playCount)} plays
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
