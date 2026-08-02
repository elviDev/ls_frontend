"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Dot, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/hooks/use-notifications";

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({ basePath = "" }: { basePath?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useUnreadNotificationCount();
  const { data: listData } = useNotifications({ limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = listData?.notifications ?? [];

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      router.push(`${basePath}${notification.link}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="text-xs text-primary hover:text-primary/80"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 rounded-lg mb-2 transition-colors cursor-pointer",
                    notification.isRead
                      ? "bg-muted hover:bg-muted/80"
                      : "bg-primary/10 hover:bg-primary/20 border border-primary/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                        notification.isRead ? "bg-muted-foreground/50" : "bg-primary"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm",
                            notification.isRead ? "text-muted-foreground" : "text-foreground font-medium"
                          )}
                        >
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <Dot className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground/60">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(notification.createdAt)}
                        {notification.link && <ExternalLink className="h-3 w-3 ml-2" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
