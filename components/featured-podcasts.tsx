"use client";

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"
import { useFeaturedPodcasts } from "@/hooks/use-podcasts";
import { useTranslations } from "next-intl";

export default function FeaturedPodcasts() {
  const { data: podcasts = [], isLoading } = useFeaturedPodcasts();
  const t = useTranslations('featuredContent');
  const tCommon = useTranslations('common');

  const formatDuration = (duration?: number) => {
    if (!duration) return t('unknown');
    const minutes = Math.floor(duration / 60);
    return `${minutes} ${t('min')}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {podcasts.map((podcast) => (
        <Link href={`/podcasts/${podcast.id}`} key={podcast.id}>
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <div className="relative aspect-square">
              <Image 
                src={podcast.coverImage || podcast.image || "/placeholder.svg?height=400&width=400"} 
                alt={podcast.title} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="rounded-full bg-white p-3">
                  <Play className="h-8 w-8 text-brand-700 fill-current" />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="text-xs font-medium text-brand-600 mb-1">
                {podcast.genre?.name || podcast.category?.replace('_', ' ') || t('uncategorized')}
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{podcast.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {t('with')} {podcast.author.firstName} {podcast.author.lastName}
              </p>
              <div className="text-xs text-muted-foreground">
                {podcast.latestEpisode 
                  ? formatDuration(podcast.latestEpisode.duration)
                  : `${podcast._count?.episodes || 0} ${t('episodes')}`
                }
              </div>
              {(podcast._count?.favorites || 0) > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {podcast._count?.favorites} {t('favorites')}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
      {podcasts.length === 0 && !isLoading && (
        <div className="col-span-4 text-center py-8">
          <p className="text-muted-foreground">{t('noPodcastsAvailable')}</p>
        </div>
      )}
    </div>
  )
}
