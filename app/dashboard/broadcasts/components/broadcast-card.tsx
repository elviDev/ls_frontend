"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Radio, MoreVertical, Edit, Trash, Users, Clock, Eye, Play, Settings, Headphones, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import type { Broadcast } from "../types"

interface BroadcastCardProps {
  broadcast: Broadcast
  onEdit: (broadcast: Broadcast) => void
  onView: (broadcast: Broadcast) => void
  onDelete: (broadcast: Broadcast) => void
  onViewStudio: (broadcast: Broadcast) => void
}

export function BroadcastCard({ broadcast, onEdit, onView, onDelete, onViewStudio }: BroadcastCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE": return "bg-red-500 text-white"
      case "SCHEDULED": return "bg-blue-500 text-white"
      case "READY": return "bg-green-500 text-white"
      case "ENDED": return "bg-gray-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const canAccessStudio = broadcast.status === "READY" || broadcast.status === "LIVE"

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {broadcast.banner && (
        <div className="aspect-video w-full bg-gray-100">
          <img
            src={broadcast.banner.url}
            alt={broadcast.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{broadcast.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {broadcast.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getStatusColor(broadcast.status)}>
              {broadcast.status === "LIVE" && <Radio className="w-3 h-3 mr-1" />}
              {broadcast.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(broadcast)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {canAccessStudio && (
                  <DropdownMenuItem onClick={() => onViewStudio(broadcast)}>
                    <Headphones className="h-4 w-4 mr-2" />
                    Studio
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(broadcast)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{format(new Date(broadcast.startTime), "MMM d, h:mm a")}</span>
          </div>
          {broadcast.hostUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {broadcast.hostUser.firstName.charAt(0)}
                  {broadcast.hostUser.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {broadcast.hostUser.firstName} {broadcast.hostUser.lastName}
              </span>
            </div>
          )}
        </div>

        {broadcast.program && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {broadcast.program.title}
            </Badge>
          </div>
        )}

        {(broadcast.staff && broadcast.staff.length > 0) && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {broadcast.staff.length} staff member{broadcast.staff.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(broadcast)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {canAccessStudio && (
            <Button size="sm" onClick={() => onViewStudio(broadcast)}>
              <Play className="h-4 w-4 mr-2" />
              Studio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}