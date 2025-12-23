import { useState, useEffect } from 'react';
import { BroadcastData, ScheduleItem, PlayerState } from '../types';

export function useBroadcastData(broadcastId?: string) {
  const [state, setState] = useState<PlayerState>({
    currentShow: "Loading...",
    currentBroadcast: null,
    upcomingBroadcast: null,
    schedule: [],
    isLoading: false,
    streamUrl: null
  });

  const fetchBroadcastData = async () => {
    try {
      if (broadcastId) {
        const response = await fetch(`/api/admin/broadcasts/${broadcastId}`);
        if (response.ok) {
          const broadcast = await response.json();
          
          setState(prev => {
            // Only update if data actually changed
            if (prev.currentBroadcast?.id !== broadcast.id || 
                prev.currentBroadcast?.status !== broadcast.status ||
                prev.streamUrl !== broadcast.streamUrl) {
              return {
                ...prev,
                currentBroadcast: broadcast.status === 'LIVE' ? broadcast : null,
                currentShow: broadcast.status === 'LIVE' ? broadcast.title : "No live broadcast",
                streamUrl: broadcast.streamUrl
              };
            }
            return prev;
          });
        }
      } else {
        const currentResponse = await fetch('/api/broadcasts/current');
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          
          setState(prev => {
            // Only update if data actually changed
            if (prev.currentBroadcast?.id !== currentData.id || 
                prev.streamUrl !== currentData.streamUrl) {
              if (currentData.status === 'LIVE') {
                return {
                  ...prev,
                  currentBroadcast: currentData,
                  currentShow: currentData.title,
                  streamUrl: currentData.streamUrl
                };
              } else {
                const newShow = currentData.upcoming 
                  ? `Up next: ${currentData.upcoming.title} at ${new Date(currentData.upcoming.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                  : "No live broadcasts at the moment";
                
                return {
                  ...prev,
                  currentShow: newShow,
                  streamUrl: null,
                  currentBroadcast: null
                };
              }
            }
            return prev;
          });
        }
      }

      // Fetch schedule less frequently
      try {
        const scheduleResponse = await fetch('/api/broadcasts/schedule');
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setState(prev => ({ ...prev, schedule: scheduleData.schedule || [] }));
        }
      } catch (error) {
        // Silent fail for schedule
      }
    } catch (error) {
      console.error('Error fetching broadcast data:', error);
      setState(prev => ({ ...prev, currentShow: "Unable to load show info" }));
    }
  };

  useEffect(() => {
    fetchBroadcastData();
    const interval = setInterval(fetchBroadcastData, 10000); // Increased to 10s to reduce load
    return () => clearInterval(interval);
  }, [broadcastId]);

  return { state, setState, fetchBroadcastData };
}