export interface BroadcastData {
  id: string;
  title: string;
  status: 'LIVE' | 'SCHEDULED' | 'ENDED';
  slug: string;
  hostUser?: {
    firstName: string;
    lastName: string;
  };
}

export interface ScheduleItem {
  show: string;
  host: string;
  time: string;
  day: string;
}

export interface PlayerState {
  currentShow: string;
  currentBroadcast: BroadcastData | null;
  upcomingBroadcast: BroadcastData | null;
  schedule: ScheduleItem[];
  isLoading: boolean;
  streamUrl: string | null;
}