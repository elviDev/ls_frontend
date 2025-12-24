"use client";

import { useParams } from "next/navigation";
import { BroadcastStudioInterface } from "@/components/studio/broadcast-studio-interface";

export default function StudioPage() {
  const params = useParams();
  const broadcastSlug = params.slug as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <BroadcastStudioInterface 
        broadcastId={broadcastSlug}
        stationName={`Broadcast ${broadcastSlug}`}
      />
    </div>
  );
}
