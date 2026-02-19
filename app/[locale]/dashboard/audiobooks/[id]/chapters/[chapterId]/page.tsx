"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Trash,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudiobookStore } from "@/stores/audiobook-store";
import {
  useDeleteChapter,
  useUpdateChapter,
  useChapter,
  useAudiobook,
} from "@/hooks/use-audiobooks";
import { Chapter, Audiobook } from "@/stores/audiobook-store";

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { setCurrentChapter } = useAudiobookStore();
  const deleteChapter = useDeleteChapter();
  const updateChapter = useUpdateChapter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const audiobookId = params.id as string;
  const chapterId = params.chapterId as string;

  const { data: audiobookData } = useAudiobook(audiobookId);
  const audiobook = audiobookData as Audiobook | undefined;
  const { data: chapterData, isLoading } = useChapter(audiobookId, chapterId);
  const chapter = chapterData as Chapter | undefined;

  useEffect(() => {
    if (chapter) {
      setCurrentChapter({
        ...chapter,
        audiobookId,
      });
    }
  }, [chapter, audiobookId, setCurrentChapter]);

  const handleDelete = async () => {
    try {
      await deleteChapter.mutateAsync({ audiobookId, chapterId });
      router.push(`/dashboard/audiobooks/${audiobookId}/chapters`);
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!chapter) return;
    try {
      await updateChapter.mutateAsync({
        audiobookId,
        chapterId,
        data: { status },
      });
    } catch (error) {
      console.error("Error updating chapter status:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chapter not found</h2>
          <p className="text-muted-foreground mb-4">
            The chapter you're looking for doesn't exist.
          </p>
          <Button
            onClick={() =>
              router.push(`/dashboard/audiobooks/${audiobookId}/chapters`)
            }
          >
            Back to Chapters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <div className="flex items-start gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="mt-1 hover:bg-purple-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {chapter.trackNumber}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {chapter.title}
                      </h1>
                      <Badge
                        className={`${getStatusColor(chapter.status)} mt-2`}
                      >
                        {chapter.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">
                    {audiobook?.title || "Loading..."}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Narrated by {audiobook?.narrator || "Loading..."}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/dashboard/audiobooks/${audiobookId}/chapters/${chapterId}/edit`
                    )
                  }
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {chapter.status === "DRAFT" && (
                  <Button
                    onClick={() => handleStatusChange("PUBLISHED")}
                    disabled={updateChapter.isPending}
                    className="bg-primary "
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}

                {chapter.status === "PUBLISHED" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("ARCHIVED")}
                    disabled={updateChapter.isPending}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "Chapter{" "}
                        {chapter.trackNumber}: {chapter.title}"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Audio Player Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Chapter {chapter.trackNumber}: {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Audio Player */}
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <audio ref={audioRef} controls className="w-full h-12">
                      <source src={chapter.audioFile} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {formatDuration(chapter.duration)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Plays</p>
                          <p className="font-semibold text-gray-900">
                            {chapter.playCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(chapter.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript Section */}
            {chapter.transcript && (
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                      {chapter.transcript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chapter Info */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Chapter Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Track Number</span>
                  <span className="font-semibold">{chapter.trackNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(chapter.status)}>
                    {chapter.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">
                    {formatDuration(chapter.duration)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Play Count</span>
                  <span className="font-semibold">{chapter.playCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-primary"
                  onClick={() =>
                    router.push(
                      `/dashboard/audiobooks/${audiobookId}/chapters/${chapterId}/edit`
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Chapter
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() =>
                    router.push(
                      `/dashboard/audiobooks/${audiobookId}/chapters/${chapterId}/transcript/edit`
                    )
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Transcript
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() =>
                    router.push(`/dashboard/audiobooks/${audiobookId}/chapters`)
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Chapters
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
