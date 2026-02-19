"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Upload, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  Image as ImageIcon, 
  Music, 
  Video, 
  File,
  Download,
  Tag,
  Calendar,
  User,
  Loader2
} from "lucide-react"
import { useAssetStore } from "@/stores/asset-store"
import { useAssets, useUploadAssets, useDeleteAsset } from "@/hooks/use-assets"
import { toast } from "sonner"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

export default function AssetsPage() {
  const { filters, pagination, selectedAssets, setFilters, clearSelection } = useAssetStore()
  const { data, isLoading, error } = useAssets(filters)
  const uploadAssets = useUploadAssets()
  const deleteAsset = useDeleteAsset()
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    description: "",
    tags: ""
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    asset: typeof assets[0] | null;
  }>({
    isOpen: false,
    asset: null,
  })

  const assets = data?.assets || []
  const paginationData = data?.pagination || pagination

  const handleFilterChange = (value: string) => {
    const type = value as typeof filters.type
    setFilters({ type, page: 1 })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) {
      toast.error("Please select at least one file to upload")
      return
    }

    try {
      await uploadAssets.mutateAsync({
        files: uploadForm.files,
        description: uploadForm.description,
        tags: uploadForm.tags,
      })
      
      setIsUploadDialogOpen(false)
      setUploadForm({ files: [], description: "", tags: "" })
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setUploadForm({ ...uploadForm, files: selectedFiles })
  }

  const removeFile = (index: number) => {
    const newFiles = uploadForm.files.filter((_, i) => i !== index)
    setUploadForm({ ...uploadForm, files: newFiles })
  }

  const handleDelete = (asset: typeof assets[0]) => {
    if ((asset._count?.broadcasts || 0) > 0) {
      toast.error("Cannot delete asset that is being used by broadcasts")
      return
    }
    setDeleteDialog({ isOpen: true, asset })
  }

  const confirmDelete = async () => {
    if (deleteDialog.asset) {
      await deleteAsset.mutateAsync(deleteDialog.asset.id)
      setDeleteDialog({ isOpen: false, asset: null })
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return ImageIcon
      case "AUDIO": return Music
      case "VIDEO": return Video
      default: return File
    }
  }

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case "IMAGE": return "bg-green-100 text-green-800 border-green-200"
      case "AUDIO": return "bg-blue-100 text-blue-800 border-blue-200"
      case "VIDEO": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTags = (tagsString?: string) => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString)
    } catch {
      return tagsString.split(',').map(tag => tag.trim()).filter(Boolean)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load assets</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asset Management</h1>
          <p className="text-slate-500 mt-1">Manage images, audio files, and other assets for broadcasting</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Assets</DialogTitle>
              <DialogDescription>Upload images, audio files, or other assets for broadcasting (max 20 files)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="files">Files</Label>
                <Input
                  id="files"
                  type="file"
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleFileSelect}
                />
                {uploadForm.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{uploadForm.files.length} file(s) selected:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {uploadForm.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe these assets..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="music, intro, background (comma-separated)"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploadAssets.isPending}>
                {uploadAssets.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Assets'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Tabs value={filters.type} onValueChange={handleFilterChange} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="IMAGE">Images</TabsTrigger>
                <TabsTrigger value="AUDIO">Audio</TabsTrigger>
                <TabsTrigger value="VIDEO">Video</TabsTrigger>
                <TabsTrigger value="DOCUMENT">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading assets...</span>
        </div>
      )}

      {/* Assets Grid */}
      {!isLoading && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => {
            const Icon = getAssetIcon(asset.type)
            const tags = getTags(asset.tags)
            
            return (
              <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <Badge className={`text-xs ${getAssetTypeColor(asset.type)}`}>
                        {asset.type}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(asset)}
                          className="text-red-600"
                          disabled={(asset._count?.broadcasts || 0) > 0}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-sm font-medium truncate" title={asset.originalName}>
                    {asset.originalName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Preview */}
                    {asset.type === "IMAGE" && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {asset.type === "AUDIO" && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Music className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {asset.type === "VIDEO" && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {asset.type === "DOCUMENT" && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <File className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Description */}
                    {asset.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {asset.description}
                      </p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{asset.uploadedBy.firstName} {asset.uploadedBy.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{formatFileSize(asset.size)}</span>
                        {(asset._count?.broadcasts || 0) > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Used in {asset._count?.broadcasts || 0} broadcast{(asset._count?.broadcasts || 0) !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && assets.length === 0 && (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.type !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'Upload your first asset to get started'
            }
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Asset
          </Button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && assets.length > 0 && paginationData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((paginationData.page - 1) * paginationData.perPage) + 1} to{' '}
            {Math.min(paginationData.page * paginationData.perPage, paginationData.total)} of{' '}
            {paginationData.total} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationData.page - 1)}
              disabled={paginationData.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {paginationData.page} of {paginationData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationData.page + 1)}
              disabled={paginationData.page >= paginationData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog({ isOpen: open, asset: null })}
        onConfirm={confirmDelete}
        title="Delete Asset"
        description={`Are you sure you want to delete "${deleteDialog.asset?.originalName}"? This action cannot be undone.`}
        isLoading={deleteAsset.isPending}
      />
    </div>
  )
}