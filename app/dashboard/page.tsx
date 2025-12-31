"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Upload,
  Users,
  Radio,
  BookOpen,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  MessageSquare,
  Star,
  BarChart3,
  Podcast,
  PlayCircle,
  UserPlus,
  Radio as BroadcastIcon,
  Archive,
} from "lucide-react";
import Link from "next/link";
import {
  useDashboardStats,
  useContentAnalytics,
  useUserAnalytics,
  useLiveAnalytics,
  usePodcastAnalytics,
} from "@/hooks/use-analytics";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();
  const { data: contentAnalytics, isLoading: contentLoading } =
    useContentAnalytics();
  const { data: userAnalytics, isLoading: userLoading } = useUserAnalytics();
  const { data: liveAnalytics, isLoading: liveLoading } = useLiveAnalytics();
  const { data: podcastAnalytics, isLoading: podcastLoading } =
    usePodcastAnalytics();

  const isStaff = user?.userType === "staff";

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };



  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}! Here's what's happening with
            your radio station.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchStats()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isStaff && (
            <Link href="/dashboard/broadcasts/new">
              <Button>
                <Mic className="h-4 w-4 mr-2" />
                Start Broadcast
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.overview.totalUsers.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              {userAnalytics?.newUsers || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Content
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (dashboardStats?.overview.totalPodcasts || 0) +
                (dashboardStats?.overview.totalAudiobooks || 0)
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.overview.totalPodcasts || 0} podcasts,{" "}
              {dashboardStats?.overview.totalAudiobooks || 0} audiobooks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Live Broadcasts
            </CardTitle>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              <Radio className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.overview.totalBroadcasts || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <Activity className="inline h-3 w-3 mr-1 text-blue-500" />
              {liveAnalytics?.averageListeners || 0} avg listeners
            </p>
          </CardContent>
        </Card>

        {isStaff && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Staff Members
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats?.overview.totalStaff || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Content Overview */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Content Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Podcast className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Podcasts</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardStats?.overview.totalPodcasts || 0}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Audiobooks</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardStats?.overview.totalAudiobooks || 0}
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BroadcastIcon className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Broadcasts</span>
                      </div>
                      <span className="text-sm font-medium">
                        {dashboardStats?.overview.totalBroadcasts || 0}
                      </span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Archives</span>
                      </div>
                      <span className="text-sm font-medium">
                        {contentAnalytics?.totalArchives || 0}
                      </span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isStaff && (
                  <>
                    <Link href="/dashboard/podcasts/new">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Podcast
                      </Button>
                    </Link>
                    <Link href="/dashboard/audiobooks/new">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Audiobook
                      </Button>
                    </Link>
                    <Link href="/dashboard/broadcasts/new">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Start Live Broadcast
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentAnalytics?.topContent
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="w-6 h-6 p-0 flex items-center justify-center"
                            >
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.playCount
                                  ? `${item.playCount} plays`
                                  : formatTimeAgo(item.createdAt)}
                              </p>
                            </div>
                          </div>
                          <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )) || (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No content available
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Plays</span>
                    <span className="text-sm font-medium">
                      {contentAnalytics?.totalPlays.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Published Podcasts</span>
                    <span className="text-sm font-medium">
                      {podcastAnalytics?.publishedPodcasts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Audiobooks</span>
                    <span className="text-sm font-medium">
                      {contentAnalytics?.totalAudiobooks || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Archive Items</span>
                    <span className="text-sm font-medium">
                      {contentAnalytics?.totalArchives || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="h-20 bg-muted rounded animate-pulse" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {userAnalytics?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      +{userAnalytics?.newUsers || 0} new users
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userAnalytics?.activeUsers || 0} active users
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Broadcast Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Broadcast Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveLoading ? (
                  <div className="h-20 bg-muted rounded animate-pulse" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {liveAnalytics?.totalBroadcasts || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg: {liveAnalytics?.averageListeners || 0} listeners
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Peak: {liveAnalytics?.peakListeners || 0} listeners
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {contentAnalytics?.totalPlays || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total plays
                  </div>
                  <div className="text-sm text-green-600">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +12% this week
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Recent Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.recentActivity.recentComments
                    .slice(0, 5)
                    .map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {comment.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {comment.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent comments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.recentActivity.recentReviews
                    .slice(0, 5)
                    .map((review) => (
                      <div key={review.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {review.user.name}
                            </p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground truncate">
                              {review.comment}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent reviews
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
