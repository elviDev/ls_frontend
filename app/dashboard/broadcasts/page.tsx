"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { useBroadcasts } from "./hooks/use-broadcasts"
import { BroadcastFiltersComponent } from "./components/broadcast-filters"
import { BroadcastCard } from "./components/broadcast-card"
import { CreateBroadcastDialog } from "./components/create-broadcast-dialog"
import type { Broadcast } from "./types"

export default function BroadcastsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programIdFromUrl = searchParams.get('programId')
  
  const {
    broadcasts,
    staff,
    assets,
    programs,
    isLoading,
    error,
    filters,
    setFilters,
    refetch
  } = useBroadcasts(programIdFromUrl)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateBroadcast = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (broadcast: Broadcast) => {
    router.push(`/dashboard/broadcasts/${broadcast.slug}/edit`)
  }

  const handleView = (broadcast: Broadcast) => {
    router.push(`/dashboard/broadcasts/${broadcast.slug}`)
  }

  const handleDelete = (broadcast: Broadcast) => {
    if (confirm(`Are you sure you want to delete "${broadcast.title}"?`)) {
      // TODO: Implement actual delete API call
      console.log('Delete broadcast:', broadcast.id)
    }
  }

  const handleViewStudio = (broadcast: Broadcast) => {
    router.push(`/dashboard/broadcasts/${broadcast.slug}/studio`)
  }

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
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <p className="text-red-600 font-medium">Failed to load broadcasts</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Broadcasts</h1>
          <p className="text-gray-600 mt-2">
            Manage your radio broadcasts and live shows
          </p>
        </div>
        <Button onClick={handleCreateBroadcast}>
          <Plus className="h-4 w-4 mr-2" />
          Create Broadcast
        </Button>
      </div>

      <div className="space-y-6">
        <BroadcastFiltersComponent
          filters={filters}
          programs={programs}
          onFiltersChange={setFilters}
        />

        {broadcasts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No broadcasts found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleCreateBroadcast}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Broadcast
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {broadcasts.map((broadcast) => (
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
        onOpenChange={setIsCreateDialogOpen}
        programs={programs}
        staff={staff}
        onSuccess={refetch}
      />
    </div>
  )
}