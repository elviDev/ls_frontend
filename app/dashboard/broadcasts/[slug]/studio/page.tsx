"use client";

import { useParams } from "next/navigation";
import { BroadcastStudioInterface } from "@/components/studio/broadcast-studio-interface";
import { useBroadcastById } from "@/hooks/use-broadcasts";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StudioPage() {
  const params = useParams();
  const broadcastSlug = params.slug as string;
  const { setBroadcast } = useBroadcastStore();
  
  const { data: broadcast, isLoading, error } = useBroadcastById(broadcastSlug);
  
  useEffect(() => {
    if (broadcast) {
      setBroadcast(broadcast);
    }
  }, [broadcast, setBroadcast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load broadcast</p>
          <p className="text-slate-500">Please check if the broadcast exists and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <BroadcastStudioInterface 
        broadcastId={broadcastSlug}
        stationName={broadcast.title}
      />
    </div>
  );
}