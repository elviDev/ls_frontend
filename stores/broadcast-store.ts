import { create } from 'zustand';
import { BroadcastData, ScheduleItem } from '@/components/live-player/types';

interface LiveKitConfig {
  url?: string;
  token?: string;
  roomName?: string;
}

interface BroadcastStore {
  // Broadcast data
  currentBroadcast: BroadcastData | null;
  upcomingBroadcast: BroadcastData | null;
  schedule: ScheduleItem[];
  currentShow: string;
  streamUrl: string | null;
  isLoading: boolean;
  error: string | null;
  
  // LiveKit data
  liveKit: LiveKitConfig;
  
  // Actions
  setBroadcast: (broadcast: BroadcastData | null) => void;
  setUpcoming: (broadcast: BroadcastData | null) => void;
  setSchedule: (schedule: ScheduleItem[]) => void;
  setCurrentShow: (show: string) => void;
  setStreamUrl: (url: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLiveKit: (config: LiveKitConfig) => void;
  fetchBroadcastData: (slug?: string) => Promise<void>;
  updateBroadcastStatus: (slug: string, status: 'LIVE' | 'READY' | 'ENDED') => Promise<void>;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  currentBroadcast: null,
  upcomingBroadcast: null,
  schedule: [],
  currentShow: "Loading...",
  streamUrl: null,
  isLoading: false,
  error: null,
  liveKit: {},
  
  setBroadcast: (broadcast) => set({ currentBroadcast: broadcast }),
  setUpcoming: (broadcast) => set({ upcomingBroadcast: broadcast }),
  setSchedule: (schedule) => set({ schedule }),
  setCurrentShow: (show) => set({ currentShow: show }),
  setStreamUrl: (url) => set({ streamUrl: url }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLiveKit: (config) => set({ liveKit: config }),
  
  fetchBroadcastData: async (slug?: string) => {
    const { setLoading, setError } = get();
    try {
      setLoading(true);
      setError(null);
      
      if (slug) {
        const response = await fetch(`/api/admin/broadcasts/${slug}`);
        if (response.ok) {
          const broadcast = await response.json();
          const { setBroadcast, setCurrentShow, setStreamUrl, setLiveKit } = get();
          
          if (broadcast.status === "LIVE") {
            setBroadcast(broadcast);
            setCurrentShow(broadcast.title);
            setStreamUrl(broadcast.streamUrl);
            setLiveKit({
              url: broadcast.liveKitUrl,
              token: broadcast.liveKitToken,
              roomName: broadcast.id
            });
          } else {
            setBroadcast(null);
            setCurrentShow("No live broadcast");
            setStreamUrl(null);
          }
        }
      } else {
        const response = await fetch("/api/broadcasts/current");
        if (response.ok) {
          const data = await response.json();
          const { setBroadcast, setCurrentShow, setStreamUrl, setLiveKit } = get();
          
          if (data.status === "LIVE") {
            setBroadcast(data);
            setCurrentShow(data.title);
            setStreamUrl(data.streamUrl);
            setLiveKit({
              url: data.liveKitUrl,
              token: data.liveKitToken,
              roomName: data.id
            });
          } else {
            const newShow = data.upcoming
              ? `Up next: ${data.upcoming.title} at ${new Date(data.upcoming.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
              : "No live broadcasts at the moment";
            setCurrentShow(newShow);
            setStreamUrl(null);
            setBroadcast(null);
          }
        }
      }
      
      // Fetch schedule
      const scheduleResponse = await fetch("/api/broadcasts/schedule");
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        get().setSchedule(scheduleData.schedule || []);
      }
    } catch (error) {
      console.error("Error fetching broadcast data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch broadcast data");
      get().setCurrentShow("Unable to load show info");
    } finally {
      setLoading(false);
    }
  },
  
  updateBroadcastStatus: async (slug: string, status: 'LIVE' | 'READY' | 'ENDED') => {
    try {
      const response = await fetch(`/api/admin/broadcasts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedBroadcast = await response.json();
        
        if (status === 'LIVE') {
          get().setBroadcast(updatedBroadcast);
          get().setCurrentShow(updatedBroadcast.title);
          // Notify all users about the live broadcast
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('broadcast-live', { 
              detail: updatedBroadcast 
            }));
          }
        } else if (status === 'ENDED') {
          get().setBroadcast(null);
          get().setCurrentShow('No live broadcast');
          // Notify all users broadcast ended
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('broadcast-ended', { 
              detail: { broadcastId: slug } 
            }));
          }
        }
        
        console.log('✅ Broadcast status updated to:', status);
      } else {
        throw new Error('Failed to update broadcast status');
      }
    } catch (error) {
      console.error('❌ Error updating broadcast status:', error);
      get().setError(error instanceof Error ? error.message : 'Failed to update broadcast status');
    }
  }
}));