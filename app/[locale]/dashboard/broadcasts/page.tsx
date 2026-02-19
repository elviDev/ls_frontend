"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBroadcasts, useDeleteBroadcast } from "@/hooks/use-broadcasts";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { BroadcastFiltersComponent } from "./components/broadcast-filters";
import { BroadcastCard } from "./components/broadcast-card";
import { CreateBroadcastDialog } from "./components/create-broadcast-dialog";
import type { Broadcast } from "@/hooks/use-broadcasts";

export default function BroadcastsPage() {
  const router = useRouter();

  const {
    data: broadcasts = [],
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
  } = useBroadcasts();
  const { resetForm } = useBroadcastStore();
  const deleteBroadcastMutation = useDeleteBroadcast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<Broadcast | null>(
    null
  );

  const handleCreateBroadcast = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (broadcast: Broadcast) => {
    // Populate form with existing broadcast data
    const startTime = new Date(broadcast.startTime);
    const endTime = new Date(broadcast.endTime);

    useBroadcastStore.getState().setFormData({
      title: broadcast.title || "",
      description: broadcast.description || "",
      startTime: startTime,
      endTime: endTime,
      startTimeHour: startTime.getHours().toString().padStart(2, "0"),
      startTimeMinute: startTime.getMinutes().toString().padStart(2, "0"),
      endTimeHour: endTime.getHours().toString().padStart(2, "0"),
      endTimeMinute: endTime.getMinutes().toString().padStart(2, "0"),
      hostId: broadcast.hostId || "",
      programId: broadcast.programId || "",
      bannerId: broadcast.bannerId || "",
      staff: broadcast.staff || [],
      guests: broadcast.guests || [],
    });

    setEditingBroadcast(broadcast);
    setIsCreateDialogOpen(true);
  };

  const handleView = (broadcast: Broadcast) => {
    router.push(`/dashboard/broadcasts/${broadcast.id}`);
  };

  const handleDelete = (broadcast: Broadcast) => {
    setBroadcastToDelete(broadcast);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (broadcastToDelete) {
      try {
        await deleteBroadcastMutation.mutateAsync(broadcastToDelete.id);
        setDeleteDialogOpen(false);
        setBroadcastToDelete(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleViewStudio = (broadcast: Broadcast) => {
    router.push(`/dashboard/broadcasts/${broadcast.id}/studio`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-500">Loading broadcasts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-red-600 font-medium">
                Failed to load broadcasts
              </p>
              <p className="text-gray-500 text-sm">
                {error?.message || String(error)}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Broadcasts</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your radio broadcasts and live shows
          </p>
        </div>
        <Button onClick={handleCreateBroadcast} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create Broadcast</span>
          <span className="sm:hidden">New Broadcast</span>
        </Button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <BroadcastFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />

        {broadcasts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 text-sm sm:text-base mb-4">
              No broadcasts found
            </p>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCreateBroadcast}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Broadcast
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {broadcasts.map((broadcast: Broadcast) => (
              <BroadcastCard
                key={broadcast.id}
                broadcast={broadcast}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onViewStudio={handleViewStudio}
              />
            ))}
          </div>
        )}
      </div>

      <CreateBroadcastDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingBroadcast(null);
            resetForm();
          }
        }}
        onSuccess={refetch}
        editingBroadcast={editingBroadcast}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{broadcastToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
