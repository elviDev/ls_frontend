"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Radio, MoreVertical, Edit, Trash, Users, Clock, Eye, Play, Headphones, Calendar, Mic } from "lucide-react"
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns"
import type { Broadcast } from "@/hooks/use-broadcasts"
import { cn } from "@/lib/utils"

interface BroadcastCardProps {
  broadcast: Broadcast
  onEdit: (broadcast: Broadcast) => void
  onView: (broadcast: Broadcast) => void
  onDelete: (broadcast: Broadcast) => void
  onViewStudio: (broadcast: Broadcast) => void
}

export function BroadcastCard({ broadcast, onEdit, onView, onDelete, onViewStudio }: BroadcastCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "LIVE": 
        return { 
          color: "bg-red-500 text-white", 
          icon: Radio, 
          animate: true,
          gradient: "from-red-500 to-red-600"
        }
      case "SCHEDULED": 
        return { 
          color: "bg-blue-500 text-white", 
          icon: Calendar, 
          animate: false,
          gradient: "from-blue-500 to-blue-600"
        }
      case "READY": 
        return { 
          color: "bg-green-500 text-white", 
          icon: Mic, 
          animate: false,
          gradient: "from-green-500 to-green-600"
        }
      case "ENDED": 
        return { 
          color: "bg-gray-500 text-white", 
          icon: Clock, 
          animate: false,
          gradient: "from-gray-500 to-gray-600"
        }
      default: 
        return { 
          color: "bg-gray-500 text-white", 
          icon: Clock, 
          animate: false,
          gradient: "from-gray-500 to-gray-600"
        }
    }
  }

  const formatBroadcastTime = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, h:mm a")
    }
  }

  const statusConfig = getStatusConfig(broadcast.status)
  const StatusIcon = statusConfig.icon
  const canAccessStudio = broadcast.status === "READY" || broadcast.status === "LIVE"
  const startTime = new Date(broadcast.startTime)

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md hover:shadow-2xl hover:-translate-y-1">
      {/* Banner Image with Gradient Overlay */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {broadcast.banner ? (
          <>
            <img
              src={broadcast.banner.url}
              alt={broadcast.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${statusConfig.gradient} flex items-center justify-center`}>
            <StatusIcon className="h-12 w-12 text-white/80" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={cn(
            "text-xs font-semibold shadow-lg backdrop-blur-sm border-0", 
            statusConfig.color,
            statusConfig.animate && "animate-pulse"
          )}>
            <StatusIcon className="w-3 h-3 mr-1.5" />
            {broadcast.status}
          </Badge>
        </div>

        {/* Live Indicator */}
        {broadcast.status === "LIVE" && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm border-0 hover:bg-white/30">
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(broadcast)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Broadcast
              </DropdownMenuItem>
              {canAccessStudio && (
                <DropdownMenuItem onClick={() => onViewStudio(broadcast)}>
                  <Headphones className="h-4 w-4 mr-2" />
                  Open Studio
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(broadcast)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title and Description */}
        <div className="space-y-2">
          <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {broadcast.title}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 text-muted-foreground">
            {broadcast.description}
          </CardDescription>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatBroadcastTime(startTime)}</span>
          </div>
        </div>

        {/* Host and Program Info */}
        <div className="space-y-3">
          {broadcast.hostUser && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {broadcast.hostUser.firstName?.charAt(0) || ''}
                  {broadcast.hostUser.lastName?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {broadcast.hostUser.firstName} {broadcast.hostUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>
          )}

          {/* Program and Staff Info */}
          <div className="flex items-center justify-between">
            {broadcast.program && (
              <Badge variant="secondary" className="text-xs font-medium">
                {broadcast.program.title}
              </Badge>
            )}
            
            {broadcast.staff && broadcast.staff.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{broadcast.staff.length} staff</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(broadcast)}
            className="flex-1 text-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {canAccessStudio && (
            <Button
              size="sm"
              onClick={() => onViewStudio(broadcast)}
              className="flex-1 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Play className="h-4 w-4 mr-2" />
              Studio
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}