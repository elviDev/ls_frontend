"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
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
  Calendar,
  Play,
  Eye,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePodcasts } from "@/hooks/use-podcasts";
import { usePodcastStore } from "@/stores/podcast-store";
import { apiClient } from "@/lib/api-client";

type Podcast = {
  id: string;
  title: string;
  description: string;
  host: string;
  guests?: string;
  coverImage: string;
  duration?: number;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  genre: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    comments: number;
    reviews: number;
    favorites: number;
    playbackProgress: number;
  };
  averageRating?: number;
  totalPlays?: number;
  status: "draft" | "published" | "archived";
};

export default function PodcastsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { filters, setFilters } = usePodcastStore();
  const { data, isLoading, error } = usePodcasts(filters);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const podcasts = data?.podcasts || [];

  const handleDelete = async (podcastId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(podcastId);
    try {
      await apiClient.podcasts.delete(podcastId);
      toast({
        title: "Success",
        description: "Podcast deleted successfully",
      });
      setFilters({ ...filters });
    } catch (error) {
      console.error("Failed to delete podcast:", error);
      toast({
        title: "Error",
        description: "Failed to delete podcast",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (podcastId: string, status: string) => {
    if (isUpdating) return;
    
    setIsUpdating(podcastId);
    try {
      await apiClient.podcasts.update(podcastId, { status });
      toast({
        title: "Success",
        description: `Podcast ${status} successfully`,
      });
      setFilters({ ...filters });
    } catch (error) {
      console.error("Failed to update podcast status:", error);
      toast({
        title: "Error",
        description: "Failed to update podcast status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
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
            onValueChange={(value: string) => setFilters({ ...filters, status: value as any })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy || "recent"}
            onValueChange={(value: string) => setFilters({ ...filters, sortBy: value as any })}
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
              {podcast.coverImage ? (
                <img
                  src={podcast.coverImage}
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
                      onClick={() => router.push(`/dashboard/podcasts/${podcast.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/podcasts/${podcast.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(podcast.id, podcast.status === 'published' ? 'draft' : 'published')}
                      disabled={isUpdating === podcast.id}
                    >
                      {podcast.status === 'published' ? 'Unpublish' : 'Publish'}
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
                            Are you sure you want to delete "{podcast.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(podcast.id)}
                            disabled={isDeleting === podcast.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === podcast.id ? "Deleting..." : "Delete"}
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
                    {(podcast as any).duration ? formatDuration((podcast as any).duration) : "N/A"}
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
            {filters.search ? "Try adjusting your search criteria" : "Get started by creating your first podcast"}
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
          <div className="text-destructive mb-4">
            Failed to load podcasts
          </div>
          <Button
            variant="outline"
            onClick={() => setFilters({ ...filters })}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}