"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Upload,
  CalendarIcon,
  Users,
  Radio,
  Headphones,
  BookOpen,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client"

interface Analytics {
  totalListeners: number;
  liveListeners: number;
  podcastDownloads: number;
  audiobookPlays: number;
  userGrowth: string;
  listenerGrowth: string;
  podcastGrowth: string;
  audiobookGrowth: string;
  totalContent: {
    audiobooks: number;
    publishedAudiobooks: number;
    draftAudiobooks: number;
    podcasts: number;
    liveShows: number;
    liveBroadcasts: number;
    scheduledBroadcasts: number;
    events: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    highlighted: boolean;
  }>;
  topContent: {
    audiobooks: Array<{
      id: string;
      title: string;
      author: string;
      plays: number;
    }>;
    podcasts: Array<any>;
  };
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    activeBroadcasts: Array<any>;
  };
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await apiClient.admin.analytics();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
          <Button onClick={() => fetchAnalytics(true)} disabled={refreshing}>
            {refreshing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Welcome back to your admin dashboard!</p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/broadcasts">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Mic className="h-4 w-4 mr-2" /> Start Broadcast
            </Button>
          </Link>
          <Link href="/dashboard/audiobooks/new">
            <Button variant="outline" className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" /> Upload Content
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalListeners?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics?.userGrowth || '0'}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Live Listeners
            </CardTitle>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              <Radio className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.liveListeners?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-1 text-blue-500" />
              Real-time data
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Podcast Downloads
            </CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.podcastDownloads?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics?.podcastGrowth || '0'}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Audiobook Plays
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.audiobookPlays?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics?.audiobookGrowth || '0'}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7 mb-6 md:mb-8">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold">{analytics?.totalContent?.audiobooks || 0}</div>
                <p className="text-xs text-muted-foreground">Total Audiobooks</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{analytics?.totalContent?.publishedAudiobooks || 0}</div>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Headphones className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{analytics?.totalContent?.podcasts || 0}</div>
                <p className="text-xs text-muted-foreground">Podcasts</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Radio className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold">{analytics?.totalContent?.liveBroadcasts || 0}</div>
                <p className="text-xs text-muted-foreground">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {analytics?.recentActivities?.map((activity) => (
                <div key={activity.id} className={`flex items-start gap-3 p-2 rounded-lg ${
                  activity.highlighted ? 'bg-blue-50 border border-blue-200' : 'hover:bg-muted/50'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'audiobook' ? 'bg-amber-100 text-amber-600' :
                    activity.type === 'broadcast' ? 'bg-red-100 text-red-600' :
                    activity.type === 'user' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'audiobook' && <BookOpen className="h-4 w-4" />}
                    {activity.type === 'broadcast' && <Radio className="h-4 w-4" />}
                    {activity.type === 'user' && <Users className="h-4 w-4" />}
                    {activity.type === 'podcast' && <Headphones className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Audiobooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topContent?.audiobooks?.length > 0 ? (
                analytics.topContent.audiobooks.map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        by {book.author} • {book.plays.toLocaleString()} plays
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">#{index + 1}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No audiobooks available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-lg font-bold">{analytics?.stats?.totalUsers?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">New This Month</span>
                <span className="text-lg font-bold text-green-600">+{analytics?.stats?.newUsersThisMonth || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">New This Week</span>
                <span className="text-lg font-bold text-blue-600">+{analytics?.stats?.newUsersThisWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Active Broadcasts</span>
                <span className="text-lg font-bold text-red-600">{analytics?.stats?.activeBroadcasts?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}