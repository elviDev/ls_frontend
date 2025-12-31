"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Search,
  Play,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Clock,
  Calendar,
} from "lucide-react";
import { usePodcasts, useDeletePodcast } from "@/hooks/use-podcasts";
import { type PodcastQuery } from "@/stores/podcast-store";

interface PodcastFilters {
  search: string;
  status: "all" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
  sortBy: "recent" | "popular" | "alphabetical";
}

export default function PodcastsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PodcastFilters>({
    search: "",
    status: "all",
    sortBy: "recent",
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deletePodcastMutation = useDeletePodcast();

  // Build query params for the hook
  const queryParams: PodcastQuery = {
    ...(filters.search && { search: filters.search }),
    status: "DRAFT",
  };

  const { data: podcasts = [], isLoading, error } = usePodcasts(queryParams);

  const handleDelete = async (podcastId: string) => {
    try {
      setIsDeleting(podcastId);
      await deletePodcastMutation.mutateAsync(podcastId);
    } catch (error) {
      console.error("Failed to delete podcast:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Podcast Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and publish your podcast episodes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Podcast
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search podcasts..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(value: string) =>
              setFilters({ ...filters, status: value as any })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
            value={filters.sortBy || "recent"}
            onValueChange={(value: string) =>
              setFilters({ ...filters, sortBy: value as any })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {podcasts.map((podcast) => (
          <Card key={podcast.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {podcast.coverImage || podcast.image ? (
                <img
                  src={podcast.coverImage || podcast.image}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(podcast.status)}`}
              >
                {podcast.status}
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2">
                    {podcast.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {podcast.author.firstName} {podcast.author.lastName}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/podcasts/${podcast.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/podcasts/new?edit=${podcast.id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{podcast.title}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(podcast.id)}
                            disabled={isDeleting === podcast.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === podcast.id
                              ? "Deleting..."
                              : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {podcast.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {podcast.latestEpisode?.duration
                      ? formatDuration(podcast.latestEpisode.duration)
                      : "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(podcast.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && podcasts.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No podcasts found</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search
              ? "Try adjusting your search criteria"
              : "Get started by creating your first podcast"}
          </p>
          <Button onClick={() => router.push("/dashboard/podcasts/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Podcast
          </Button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-destructive mb-4">Failed to load podcasts</div>
          <Button variant="outline" onClick={() => setFilters({ ...filters })}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
