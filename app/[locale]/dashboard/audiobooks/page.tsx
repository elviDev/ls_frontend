"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Search,
  BookOpen,
  Calendar,
  Clock,
  User,
  Play,
  Eye,
  Grid3X3,
  List,
  Star,
  BarChart3,
  FileText,
  Archive,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  useAudiobooks,
  useAudiobookStats,
  useDeleteAudiobook,
  useUpdateAudiobook,
} from "@/hooks/use-audiobooks";
import {
  useAudiobookStore,
  type Audiobook,
  type AudiobookStats,
} from "@/stores/audiobook-store";

export default function AudiobooksPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    genre: "all",
    author: "all",
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const { data: audiobooksData, isLoading } = useAudiobooks({
    status: '', // Empty string to get all statuses including DRAFT, PUBLISHED, ARCHIVED
    limit: 50,
  });
  const { data: stats } = useAudiobookStats();
  const deleteAudiobook = useDeleteAudiobook();
  const updateAudiobook = useUpdateAudiobook();
  const {
    setCurrentAudiobook,
    setAudiobooks,
    setStats,
    audiobooks: storeAudiobooks,
    stats: storeStats,
    setLoading,
    setError,
  } = useAudiobookStore();

  const audiobooks: Audiobook[] = audiobooksData || storeAudiobooks;

  console.log("Store Audiobooks", audiobooks);
  // Sync data with store
  useEffect(() => {
    if (audiobooksData && Array.isArray(audiobooksData)) {
      setAudiobooks(audiobooksData);
    }
  }, [audiobooksData, setAudiobooks]);

  useEffect(() => {
    if (stats && typeof stats === "object" && Object.keys(stats).length > 0) {
      setStats(stats as AudiobookStats);
    }
  }, [stats, setStats]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAudiobook.mutateAsync({ id, data: { status } });
    } catch (error) {
      setError("Failed to update audiobook status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAudiobook.mutateAsync(id);
      toast.success("Audiobook deleted successfully");
    } catch (error) {
      toast.error("Failed to delete audiobook");
      setError("Failed to delete audiobook");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading audiobooks...</p>
        </div>
      </div>
    );
  }

  const displayStats: AudiobookStats | null =
    stats && Object.keys(stats).length > 0
      ? (stats as AudiobookStats)
      : storeStats && Object.keys(storeStats).length > 0
        ? storeStats
        : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Audiobook Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and publish your audiobook library
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/audiobooks/analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => router.push("/dashboard/audiobooks/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Audiobook
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {displayStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Audiobooks
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {displayStats.published || 0} published,{" "}
                {displayStats.draft || 0} drafts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Chapters
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.totalChapters || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all audiobooks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(displayStats.totalPlays || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all episodes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(displayStats.totalDuration || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {displayStats.averageRating
                  ? displayStats.averageRating.toFixed(1)
                  : "0.0"}{" "}
                avg rating
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audiobooks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                setFilters({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="playCount">Plays</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Audiobooks Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {audiobooks.map((audiobook) => (
            <Card
              key={audiobook.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                <Image
                  height={400}
                  width={300}
                  src={audiobook.coverImage || "/placeholder.svg"}
                  alt={audiobook.title}
                  className="object-cover w-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`${getStatusColor(audiobook.status)} shadow-lg backdrop-blur-sm`}
                  >
                    {audiobook.status === "PUBLISHED"
                      ? "Published"
                      : audiobook.status === "DRAFT"
                        ? "Draft"
                        : "Archived"}
                  </Badge>
                </div>

                {/* Rating */}
                {audiobook.averageRating && audiobook.averageRating > 0 && (
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {audiobook.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        ({audiobook._count.reviews})
                      </span>
                    </div>
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="lg"
                    className="rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-xl backdrop-blur-sm"
                    onClick={() => {
                      setCurrentAudiobook(audiobook);
                      router.push(
                        `/dashboard/audiobooks/${audiobook.id}/chapters`
                      );
                    }}
                  >
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    Listen
                  </Button>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentAudiobook(audiobook);
                          router.push(`/dashboard/audiobooks/${audiobook.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentAudiobook(audiobook);
                          router.push(
                            `/dashboard/audiobooks/${audiobook.id}/chapters`
                          );
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Manage Chapters
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentAudiobook(audiobook);
                          router.push(
                            `/dashboard/audiobooks/${audiobook.id}/edit`
                          );
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {audiobook.status === "DRAFT" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(audiobook.id, "PUBLISHED")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {audiobook.status === "PUBLISHED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(audiobook.id, "ARCHIVED")
                          }
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      {audiobook.status === "ARCHIVED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(audiobook.id, "PUBLISHED")
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Audiobook
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{audiobook.title}
                              "? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(audiobook.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Title and Author */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {audiobook.title}
                  </h3>
                  <div className="space-y-1">
                    {audiobook.author && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        by {audiobook.author}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Narrated by {audiobook.narrator}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {audiobook.description}
                </p>

                {/* Genre Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {audiobook.genre.name}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {audiobook._count.chapters}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Chapters
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDuration(audiobook.duration)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Duration
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(audiobook.playCount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Plays
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setCurrentAudiobook(audiobook);
                      router.push(`/dashboard/audiobooks/${audiobook.id}/edit`);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setCurrentAudiobook(audiobook);
                      router.push(
                        `/dashboard/audiobooks/${audiobook.id}/chapters`
                      );
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Chapters
                  </Button>
                </div>

                {/* Created Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>
                    Created by {audiobook.createdBy?.firstName}{" "}
                    {audiobook.createdBy?.lastName}
                  </span>
                  {audiobook.status === "PUBLISHED" &&
                    audiobook.releaseDate && (
                      <span>
                        {new Date(audiobook.releaseDate).toLocaleDateString()}
                      </span>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {audiobooks.map((audiobook) => (
                <div
                  key={audiobook.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        width={20}
                        height={20}
                        src={audiobook.coverImage || "/placeholder.svg"}
                        alt={audiobook.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">
                            {audiobook.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {audiobook.author ? `${audiobook.author} • ` : ""}
                            Narrator: {audiobook.narrator} • Created by:{" "}
                            {audiobook.createdBy?.firstName}{" "}
                            {audiobook.createdBy?.lastName}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{audiobook._count.chapters} chapters</span>
                            <span>{formatDuration(audiobook.duration)}</span>
                            <span>
                              {formatNumber(audiobook.playCount)} plays
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(audiobook.status)}>
                            {audiobook.status === "PUBLISHED"
                              ? "Published"
                              : audiobook.status === "DRAFT"
                                ? "Draft"
                                : "Archived"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentAudiobook(audiobook);
                                  router.push(
                                    `/dashboard/audiobooks/${audiobook.id}`
                                  );
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentAudiobook(audiobook);
                                  router.push(
                                    `/dashboard/audiobooks/${audiobook.id}/chapters`
                                  );
                                }}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Chapters
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentAudiobook(audiobook);
                                  router.push(
                                    `/dashboard/audiobooks/${audiobook.id}/edit`
                                  );
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {audiobooks.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No audiobooks found
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/audiobooks/new")}
            >
              Create Your First Audiobook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {audiobooks.length > 12 && (
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Showing {audiobooks.length} audiobooks
          </p>
        </div>
      )}
    </div>
  );
}
